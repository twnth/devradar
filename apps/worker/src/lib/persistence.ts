import { ExploitStatus, FeedCategory, IncidentSeverity, SourceType } from "@prisma/client";
import { calculateFeedScore, createFeedDedupeKey } from "@devradar/utils";
import type { NormalizedFeedStaging, NormalizedSecurityStaging } from "@devradar/types";
import { prisma } from "./prisma";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function trimSentence(value: string, max: number) {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

function sourceNameFromKey(sourceKey: string) {
  const sourceNames: Record<string, string> = {
    "hacker-news": "Hacker News",
    "github-releases:next.js": "Next.js Releases",
    "github-releases:vite": "Vite Releases",
    "github-releases:react": "React Releases",
    osv: "OSV",
    "github-advisories": "GitHub Advisories",
    nvd: "NVD",
    "cisa-kev": "CISA KEV"
  };

  return sourceNames[sourceKey] ?? sourceKey;
}

function summarizeFeed(item: NormalizedFeedStaging) {
  if (item.sourceKey === "hacker-news") {
    return trimSentence(`HN에서 논의 중인 개발 이슈입니다. ${item.title}`, 120);
  }

  if (item.sourceKey.startsWith("github-releases")) {
    const project = item.tags.find((tag) => tag !== "Release") ?? "프로젝트";
    return trimSentence(`${project} 새 릴리즈입니다. 변경 내역과 업그레이드 영향도를 확인하세요.`, 120);
  }

  return trimSentence(`${item.tags[0] ?? item.category} 관련 새 업데이트입니다. ${item.title}`, 120);
}

function whyFeedMatters(item: NormalizedFeedStaging) {
  if (item.sourceKey.startsWith("github-releases")) {
    return trimSentence("버전 고정, CI, 배포 파이프라인에 바로 영향이 있을 수 있습니다.", 80);
  }

  return trimSentence(
    `${item.tags[0] ?? item.category}를 쓰는 팀이면 오늘 읽을 가치가 있습니다.`,
    80
  );
}

function summarizeIncident(item: NormalizedSecurityStaging) {
  return trimSentence(
    `${item.packageName} 취약 버전이 보고돼 사용 중인 버전과 고정 버전을 빠르게 확인해야 합니다.`,
    120
  );
}

function whyIncidentMatters(item: NormalizedSecurityStaging) {
  return trimSentence(
    `${item.packageName}가 서비스 핵심 경로라면 늦지 않게 패치 판단이 필요합니다.`,
    80
  );
}

function mapSourceType(sourceKey: string) {
  return ["osv", "github-advisories", "nvd", "cisa-kev"].some((prefix) =>
    sourceKey.startsWith(prefix)
  )
    ? SourceType.security
    : SourceType.news;
}

function mapSeverity(severity: NormalizedSecurityStaging["severity"]) {
  return severity as IncidentSeverity;
}

function mapExploitStatus(status: NormalizedSecurityStaging["exploitStatus"]) {
  return status as ExploitStatus;
}

async function upsertSource(sourceKey: string) {
  return prisma.source.upsert({
    where: { key: sourceKey },
    update: {
      name: sourceNameFromKey(sourceKey),
      enabled: true
    },
    create: {
      key: sourceKey,
      name: sourceNameFromKey(sourceKey),
      type: mapSourceType(sourceKey),
      enabled: true,
      pollIntervalMinutes: mapSourceType(sourceKey) === SourceType.security ? 5 : 10
    }
  });
}

export async function persistFeedItems(items: NormalizedFeedStaging[]) {
  const persisted = [];

  for (const item of items) {
    const source = await upsertSource(item.sourceKey);
    const publishedAt = new Date(item.publishedAt);
    const freshnessScore = Math.max(
      10,
      100 - Math.floor((Date.now() - publishedAt.getTime()) / (60 * 60 * 1000))
    );
    const importanceScore = item.sourceKey.includes("github-releases") ? 74 : 62;
    const discussionScore = item.sourceKey === "hacker-news" ? 78 : 34;
    const finalScore = calculateFeedScore({
      freshnessScore,
      importanceScore,
      discussionScore,
      interestMatchScore: 60
    });
    const dedupeKey = createFeedDedupeKey({
      canonicalUrl: item.url,
      sourceName: source.name,
      title: item.title,
      publishedAt
    });

    const record = await prisma.feedItem.upsert({
      where: { dedupeKey },
      update: {
        sourceId: source.id,
        externalId: item.externalId,
        title: item.title,
        slug: `${slugify(item.title)}-${slugify(item.externalId)}`.slice(0, 191),
        url: item.url,
        canonicalUrl: item.url,
        sourceName: source.name,
        author: item.author ?? null,
        publishedAt,
        fetchedAt: new Date(),
        category: item.category as FeedCategory,
        tags: item.tags,
        summaryKo: summarizeFeed(item),
        whyItMattersKo: whyFeedMatters(item),
        actionLabel: item.category === "security" ? "Watch" : "Read",
        importanceScore,
        discussionScore,
        freshnessScore,
        finalScore,
        rawPayload: item.rawPayload
      },
      create: {
        sourceId: source.id,
        externalId: item.externalId,
        title: item.title,
        slug: `${slugify(item.title)}-${slugify(item.externalId)}`.slice(0, 191),
        url: item.url,
        canonicalUrl: item.url,
        dedupeKey,
        sourceName: source.name,
        author: item.author ?? null,
        publishedAt,
        fetchedAt: new Date(),
        category: item.category as FeedCategory,
        tags: item.tags,
        summaryKo: summarizeFeed(item),
        whyItMattersKo: whyFeedMatters(item),
        actionLabel: item.category === "security" ? "Watch" : "Read",
        importanceScore,
        discussionScore,
        freshnessScore,
        finalScore,
        rawPayload: item.rawPayload
      }
    });

    persisted.push(record);
  }

  return persisted;
}

export async function persistSecurityIncidents(items: NormalizedSecurityStaging[]) {
  const persisted = [];

  for (const item of items) {
    if (item.packageName === "unknown") {
      continue;
    }

    const existing = await prisma.securityIncident.findFirst({
      where: {
        OR: [
          { aliases: { hasSome: item.aliases } },
          {
            packageName: item.packageName,
            affectedVersionRanges: { hasEvery: item.affectedVersionRanges },
            fixedVersions: { hasEvery: item.fixedVersions }
          }
        ]
      }
    });

    const canonicalKey =
      existing?.canonicalKey ??
      `${slugify(item.packageName)}-${slugify(item.aliases[0] ?? item.title)}`.slice(0, 191);

    const record = await prisma.securityIncident.upsert({
      where: { canonicalKey },
      update: {
        title: item.title,
        summaryKo: summarizeIncident(item),
        whyItMattersKo: whyIncidentMatters(item),
        packageName: item.packageName,
        ecosystem: item.ecosystem.toLowerCase(),
        severity: mapSeverity(item.severity),
        affectedVersionRanges: Array.from(new Set([...(existing?.affectedVersionRanges ?? []), ...item.affectedVersionRanges])),
        fixedVersions: Array.from(new Set([...(existing?.fixedVersions ?? []), ...item.fixedVersions])),
        aliases: Array.from(new Set([...(existing?.aliases ?? []), ...item.aliases])),
        references: Array.from(new Set([...(existing?.references ?? []), ...item.references])),
        exploitStatus: mapExploitStatus(item.exploitStatus),
        publishedAt: new Date(item.publishedAt),
        modifiedAt: new Date(item.modifiedAt),
        sourcePriority:
          item.severity === "critical" ? 100 : item.severity === "high" ? 80 : 50,
        actionRequired: item.severity === "critical" || item.severity === "high",
        recommendation:
          item.fixedVersions.length > 0
            ? `${item.fixedVersions[0]} 이상으로 업그레이드하고 릴리즈 노트를 확인하세요.`
            : "원문 advisory를 확인하고 임시 완화책을 적용하세요.",
        rawPayload: item.rawPayload
      },
      create: {
        canonicalKey,
        title: item.title,
        summaryKo: summarizeIncident(item),
        whyItMattersKo: whyIncidentMatters(item),
        packageName: item.packageName,
        ecosystem: item.ecosystem.toLowerCase(),
        severity: mapSeverity(item.severity),
        affectedVersionRanges: item.affectedVersionRanges,
        fixedVersions: item.fixedVersions,
        aliases: item.aliases,
        references: item.references,
        exploitStatus: mapExploitStatus(item.exploitStatus),
        publishedAt: new Date(item.publishedAt),
        modifiedAt: new Date(item.modifiedAt),
        sourcePriority:
          item.severity === "critical" ? 100 : item.severity === "high" ? 80 : 50,
        actionRequired: item.severity === "critical" || item.severity === "high",
        recommendation:
          item.fixedVersions.length > 0
            ? `${item.fixedVersions[0]} 이상으로 업그레이드하고 릴리즈 노트를 확인하세요.`
            : "원문 advisory를 확인하고 임시 완화책을 적용하세요.",
        rawPayload: item.rawPayload
      }
    });

    await prisma.securityIncidentPackage.deleteMany({
      where: { incidentId: record.id }
    });

    await prisma.securityIncidentPackage.create({
      data: {
        incidentId: record.id,
        packageName: record.packageName,
        ecosystem: record.ecosystem,
        affectedVersionRanges: record.affectedVersionRanges,
        fixedVersions: record.fixedVersions
      }
    });

    persisted.push(record);
  }

  return persisted;
}
