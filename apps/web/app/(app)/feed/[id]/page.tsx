"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, ExternalLink, LoaderCircle, MessageSquareText, Sparkles, Zap } from "lucide-react";
import { useParams } from "next/navigation";
import { FeedCard } from "@/components/feed/feed-card";
import { useFeedBriefing, useFeedItem, useFeedItems } from "@/lib/hooks";
import { Card, ErrorState, SectionHeader, SourceBadge, TagPill } from "@devradar/ui";

function formatDate(value: string) {
  return new Date(value).toLocaleString("ko-KR");
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function trimText(value: string, max: number) {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

function getPreviewText(rawPayload: Record<string, unknown>) {
  const candidates = [
    rawPayload.body,
    rawPayload.text,
    rawPayload.summary,
    rawPayload.description
  ];

  const firstText = candidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim().length > 0
  );

  return typeof firstText === "string" ? trimText(firstText.trim(), 900) : null;
}

function getSourceHost(rawUrl: string) {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return rawUrl;
  }
}

function extractBulletLines(text: string, limit: number) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean)
    .slice(0, limit);
}

function extractParagraphs(text: string, limit: number) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 40 && !line.startsWith("#") && !/^[-*]\s+/.test(line))
    .slice(0, limit)
    .map((line) => trimText(line, 220));
}

function getBriefing(data: {
  sourceName: string;
  title: string;
  summaryKo: string;
  whyItMattersKo: string;
  actionLabel: string;
  url: string;
  tags: string[];
  rawPayload: Record<string, unknown>;
}) {
  const body = typeof data.rawPayload.body === "string" ? data.rawPayload.body : "";
  const host = getSourceHost(data.url);

  if (data.sourceName.includes("Releases")) {
    const bullets = extractBulletLines(body, 4);
    const paragraphs = extractParagraphs(body, 2);

    return {
      title: "먼저 볼 포인트",
      description: "릴리즈 노트에서 실제 변경 내용을 먼저 뽑았습니다.",
      bullets:
        bullets.length > 0
          ? bullets
          : [
              `${data.sourceName}의 새 버전입니다. 제목상 주요 영역은 ${data.tags.join(", ")}입니다.`,
              "릴리즈 본문에 명시된 breaking change나 deprecated API를 우선 확인하세요.",
              "버전 고정, CI, 배포 파이프라인 영향 여부를 같이 보는 편이 안전합니다."
            ],
      notes:
        paragraphs.length > 0
          ? paragraphs
          : [data.summaryKo, getActionGuide(data.actionLabel, data.sourceName)]
    };
  }

  if (data.sourceName === "Hacker News") {
    const score =
      typeof data.rawPayload.score === "number" ? data.rawPayload.score : undefined;
    const comments =
      typeof data.rawPayload.descendants === "number"
        ? data.rawPayload.descendants
        : undefined;

    return {
      title: "읽기 전에 체크할 것",
      description: "커뮤니티 링크는 원문과 토론 맥락을 같이 보는 쪽이 낫습니다.",
      bullets: [
        `원문 도메인: ${host}`,
        `Hacker News 점수: ${score ?? "-"}, 댓글 수: ${comments ?? "-"}`,
        "제목만 보고 바로 적용하지 말고, 원문 출처와 댓글 반응을 함께 확인하세요.",
        data.whyItMattersKo
      ],
      notes: [data.summaryKo]
    };
  }

  return {
    title: "읽기 전에 체크할 것",
    description: "원문을 열기 전에 지금 판단에 필요한 정보만 먼저 정리했습니다.",
    bullets: [
      data.summaryKo,
      data.whyItMattersKo,
      getImpactGuide(data.tags, "feed", data.sourceName),
      getActionGuide(data.actionLabel, data.sourceName)
    ],
    notes: []
  };
}

function getSourceContext(rawPayload: Record<string, unknown>) {
  if (typeof rawPayload.tag_name === "string") {
    return {
      label: "Release context",
      lines: [
        `릴리즈 태그: ${rawPayload.tag_name}`,
        `프리릴리즈: ${rawPayload.prerelease ? "예" : "아니오"}`,
        `릴리즈 작성자: ${
          typeof rawPayload.author === "object" && rawPayload.author && "login" in rawPayload.author
            ? String(rawPayload.author.login)
            : "확인 불가"
        }`
      ]
    };
  }

  if (typeof rawPayload.score === "number" || typeof rawPayload.descendants === "number") {
    return {
      label: "Community context",
      lines: [
        `Hacker News 점수: ${typeof rawPayload.score === "number" ? rawPayload.score : "-"}`,
        `댓글 수: ${typeof rawPayload.descendants === "number" ? rawPayload.descendants : "-"}`,
        `제출자: ${typeof rawPayload.by === "string" ? rawPayload.by : "확인 불가"}`
      ]
    };
  }

  return {
    label: "Source context",
    lines: [
      `원문 소스: ${typeof rawPayload.url === "string" ? rawPayload.url : "원문 링크 확인"}`,
      `작성자: ${typeof rawPayload.author === "string" ? rawPayload.author : "확인 불가"}`,
      `원문 타입: ${typeof rawPayload.type === "string" ? rawPayload.type : "일반 피드"}`
    ]
  };
}

function getActionGuide(actionLabel: string, sourceName: string) {
  if (actionLabel === "Upgrade now") {
    return "배포 전에 변경 로그와 고정 버전을 먼저 확인하는 편이 안전합니다.";
  }

  if (sourceName.includes("Releases")) {
    return "릴리즈 노트에서 breaking change, deprecated API, upgrade guide부터 보세요.";
  }

  if (sourceName === "Hacker News") {
    return "원문 자체보다도 논의 맥락과 댓글 반응을 함께 보는 쪽이 가치가 큽니다.";
  }

  return "원문 확인 전 태그와 소스 성격부터 보고, 내 스택과 관련 있는지 먼저 판단하세요.";
}

function getImpactGuide(tags: string[], category: string, sourceName: string) {
  const tagLead = tags.slice(0, 2).join(", ");

  if (sourceName.includes("Releases")) {
    return `${tagLead || category}를 쓰는 코드베이스면 버전 고정, CI, 배포 스크립트 영향까지 같이 확인해야 합니다.`;
  }

  if (sourceName === "Hacker News") {
    return `${tagLead || category} 관련 커뮤니티 이슈입니다. 즉시 적용보다는 방향성 파악과 링크 추적 가치가 큽니다.`;
  }

  return `${tagLead || category} 스택과 맞닿아 있으면 이번 스프린트 안에 한 번 체크할 가치가 있습니다.`;
}

export default function FeedDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useFeedItem(params.id);
  const briefingQuery = useFeedBriefing(params.id);
  const relatedFeedQuery = useFeedItems({ limit: 18 });

  const previewText = useMemo(
    () => (data ? getPreviewText(data.rawPayload) : null),
    [data]
  );

  const sourceContext = useMemo(
    () => (data ? getSourceContext(data.rawPayload) : null),
    [data]
  );

  const relatedItems = useMemo(() => {
    if (!data) {
      return [];
    }

    return (relatedFeedQuery.data ?? [])
      .filter((item) => item.id !== data.id)
      .map((item) => ({
        item,
        overlap: item.tags.filter((tag) => data.tags.includes(tag)).length
      }))
      .filter(({ item, overlap }) => overlap > 0 || item.category === data.category)
      .sort((left, right) => {
        if (right.overlap !== left.overlap) {
          return right.overlap - left.overlap;
        }
        return new Date(right.item.publishedAt).getTime() - new Date(left.item.publishedAt).getTime();
      })
      .slice(0, 3)
      .map(({ item }) => item);
  }, [data, relatedFeedQuery.data]);

  const briefing = useMemo(
    () =>
      data
        ? getBriefing({
            sourceName: data.sourceName,
            title: data.title,
            summaryKo: data.summaryKo,
            whyItMattersKo: data.whyItMattersKo,
            actionLabel: data.actionLabel,
            url: data.url,
            tags: data.tags,
            rawPayload: data.rawPayload
          })
        : null,
    [data]
  );

  if (isLoading) {
    return null;
  }

  if (!data) {
    return <ErrorState title="피드 항목을 찾지 못했습니다." />;
  }

  const scoreCards = [
    {
      label: "Freshness",
      value: clampScore(data.freshnessScore),
      tone: "bg-accent"
    },
    {
      label: "Importance",
      value: clampScore(data.importanceScore),
      tone: "bg-safe"
    },
    {
      label: "Discussion",
      value: clampScore(data.discussionScore),
      tone: "bg-high"
    }
  ];

  return (
    <div className="space-y-6">
      <Link href="/feed" className="inline-flex items-center gap-2 text-sm text-muted">
        <ArrowLeft className="size-4" />
        피드로 돌아가기
      </Link>

      <Card className="p-8">
        <div className="flex flex-wrap items-center gap-2">
          <TagPill label={data.category.toUpperCase()} />
          <SourceBadge label={data.sourceName} />
          <TagPill label={data.actionLabel} />
        </div>
        <div className="mt-5 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-semibold tracking-tight">{data.title}</h1>
            <p className="mt-5 text-base leading-8 text-muted">{data.summaryKo}</p>
          </div>
          <div className="min-w-[220px] rounded-xl3 border border-line bg-elevated p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Decision snapshot</p>
            <p className="mt-3 text-3xl font-semibold">{Math.round(data.finalScore)}</p>
            <p className="mt-2 text-sm leading-7 text-muted">{data.whyItMattersKo}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 xl:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-accent" />
              <p className="text-xs uppercase tracking-[0.18em] text-muted">핵심 변화</p>
            </div>
            <p className="mt-3 text-sm leading-7">
              {data.sourceName.includes("Releases")
                ? `${data.sourceName}에서 새 버전이 게시됐습니다. 제목과 태그 기준으로 보면 ${data.tags.join(", ")} 변화 추적에 해당합니다.`
                : `이 피드는 ${data.sourceName}에서 올라온 항목으로, 제목 기준 핵심 키워드는 ${data.tags.join(", ")}입니다.`}
            </p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <MessageSquareText className="size-4 text-high" />
              <p className="text-xs uppercase tracking-[0.18em] text-muted">영향 범위</p>
            </div>
            <p className="mt-3 text-sm leading-7">{getImpactGuide(data.tags, data.category, data.sourceName)}</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-safe" />
              <p className="text-xs uppercase tracking-[0.18em] text-muted">지금 할 일</p>
            </div>
            <p className="mt-3 text-sm leading-7">{getActionGuide(data.actionLabel, data.sourceName)}</p>
          </Card>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-8">
          <SectionHeader
            title={briefing?.title ?? "먼저 볼 포인트"}
            description={
              briefing?.description ?? "원문을 열기 전에 핵심만 먼저 정리했습니다."
            }
          />
          {briefingQuery.isFetching && !briefingQuery.data ? (
            <div className="mt-6 rounded-xl3 border border-line bg-elevated p-5">
              <div className="flex items-center gap-3 text-sm text-muted">
                <LoaderCircle className="size-4 animate-spin text-accent" />
                <span>GPT 브리핑을 생성하는 중입니다.</span>
              </div>
            </div>
          ) : null}
          <div className="mt-6 grid gap-4">
            {((briefingQuery.data?.keyPoints ?? briefing?.bullets) ?? []).map((bullet) => (
              <div key={bullet} className="rounded-xl3 border border-line bg-elevated p-5">
                <p className="text-sm leading-7 text-foreground">{bullet}</p>
              </div>
            ))}
          </div>

          {briefingQuery.data ? (
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl3 border border-line bg-elevated p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">GPT 브리핑</p>
                <p className="mt-4 text-sm leading-7 text-foreground">{briefingQuery.data.intro}</p>
                <p className="mt-4 text-sm leading-7 text-muted">{briefingQuery.data.whyNow}</p>
              </div>
              <div className="rounded-xl3 border border-line bg-elevated p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">확인할 것</p>
                <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                  {briefingQuery.data.recommendedChecks.map((check) => (
                    <p key={check}>{check}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {!briefingQuery.data && briefing && briefing.notes.length > 0 ? (
            <div className="mt-8 rounded-xl3 border border-line bg-elevated p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">추가 메모</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                {briefing.notes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </div>
          ) : null}

          {previewText ? (
            <div className="mt-8 rounded-xl3 border border-line bg-elevated p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">원문 미리보기</p>
              <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted">{previewText}</pre>
            </div>
          ) : null}
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <SectionHeader title="점수 분해" description="왜 이 피드가 위로 올라왔는지 점수별로 봅니다." />
            <div className="mt-6 space-y-4">
              {scoreCards.map((card) => (
                <div key={card.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{card.label}</span>
                    <span className="mono">{card.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-panel">
                    <div className={`h-full rounded-full ${card.tone}`} style={{ width: `${card.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <SectionHeader title={sourceContext?.label ?? "Metadata"} description="소스 성격과 원문 메타데이터입니다." />
            <div className="mt-6 space-y-3 text-sm text-muted">
              <p>Source: {data.sourceName}</p>
              <p>Author: {data.author ?? "확인 불가"}</p>
              <p>Published: {formatDate(data.publishedAt)}</p>
              <p>Fetched: {formatDate(data.fetchedAt)}</p>
              {sourceContext?.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <div className="flex flex-wrap gap-2 pt-2">
                {data.tags.map((tag) => (
                  <TagPill key={tag} label={tag} />
                ))}
              </div>
              <a
                href={data.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 pt-3 text-accent"
              >
                원문 열기
                <ExternalLink className="size-4" />
              </a>
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-8">
        <SectionHeader
          title="관련 피드"
          description="같은 태그나 카테고리로 연결되는 항목들입니다."
        />
        <div className="mt-6 space-y-4">
          {relatedItems.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
          {relatedItems.length === 0 ? (
            <div className="rounded-xl3 border border-dashed border-line bg-elevated p-5 text-sm text-muted">
              아직 연결할 관련 피드가 충분하지 않습니다.
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
