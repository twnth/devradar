import type { NormalizedSecurityStaging } from "@devradar/types";
import { normalizedSecurityStagingSchema } from "@devradar/types";
import type { SecuritySourceAdapter } from "../lib/adapter";

const watchedPackages = [
  { packageName: "next", ecosystem: "npm" },
  { packageName: "react", ecosystem: "npm" },
  { packageName: "vite", ecosystem: "npm" }
];

const ecosystemIncidentKeywords = [
  "malware",
  "compromise",
  "compromised",
  "supply chain",
  "supply-chain",
  "credential",
  "token",
  "exfiltrat",
  "oidc",
  "cache poisoning",
  "trusted publisher",
  "npm",
  "pypi",
  "worm",
  "tanstack",
  "axios",
  "bitwarden",
  "trivy",
  "kics"
];

function mapSeverity(value: unknown) {
  const severity = String(value ?? "unknown").toLowerCase();
  return ["critical", "high", "medium", "low"].includes(severity) ? severity : "unknown";
}

function getVulnerabilityPackageName(vulnerability: Record<string, unknown>) {
  const packageInfo = vulnerability.package as { name?: string } | undefined;
  return String(packageInfo?.name ?? vulnerability.packageName ?? "").toLowerCase();
}

function getFirstPatchedVersion(value: unknown) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && "identifier" in value) {
    return String((value as { identifier?: string }).identifier ?? "");
  }

  return "";
}

function getAdvisoryVulnerabilities(advisory: Record<string, unknown>) {
  return Array.isArray(advisory.vulnerabilities)
    ? advisory.vulnerabilities as Array<Record<string, unknown>>
    : [];
}

function getAdvisoryText(advisory: Record<string, unknown>) {
  return [
    String(advisory.summary ?? ""),
    String(advisory.description ?? ""),
    String(advisory.cve_id ?? ""),
    String(advisory.ghsa_id ?? "")
  ]
    .join(" ")
    .toLowerCase();
}

function isBroadEcosystemIncident(advisory: Record<string, unknown>) {
  const advisoryText = getAdvisoryText(advisory);
  return ecosystemIncidentKeywords.some((keyword) => advisoryText.includes(keyword));
}

function mapAdvisoryToStaging(
  sourceKey: string,
  ecosystem: string,
  advisory: Record<string, unknown>,
  vulnerability: Record<string, unknown>
) {
  const packageName = String(
    (vulnerability.package as { name?: string } | undefined)?.name ??
      vulnerability.packageName ??
      ""
  ).trim();

  if (!packageName) {
    return null;
  }

  return normalizedSecurityStagingSchema.parse({
    sourceKey,
    packageName,
    ecosystem,
    title: String(advisory.summary ?? advisory.ghsa_id ?? "GitHub advisory"),
    aliases: [String(advisory.ghsa_id ?? ""), String(advisory.cve_id ?? "")].filter(Boolean),
    affectedVersionRanges: [String(vulnerability.vulnerable_version_range ?? "")].filter(Boolean),
    fixedVersions: [getFirstPatchedVersion(vulnerability.first_patched_version)].filter(Boolean),
    references: [String(advisory.html_url ?? advisory.url ?? "")].filter(Boolean),
    severity: mapSeverity(advisory.severity),
    exploitStatus: "unknown",
    publishedAt: String(advisory.published_at ?? new Date().toISOString()),
    modifiedAt: String(advisory.updated_at ?? advisory.published_at ?? new Date().toISOString()),
    rawPayload: advisory
  });
}

export class GitHubAdvisoriesAdapter implements SecuritySourceAdapter {
  key = "github-advisories";

  async fetch(): Promise<NormalizedSecurityStaging[]> {
    const watchedAdvisories = await Promise.all(
      watchedPackages.map(async (watched) => {
        const url = new URL("https://api.github.com/advisories");
        url.searchParams.set("type", "reviewed");
        url.searchParams.set("ecosystem", watched.ecosystem);
        url.searchParams.set("affects", watched.packageName);
        url.searchParams.set("per_page", "10");

        const response = await fetch(url, {
          headers: {
            accept: "application/vnd.github+json",
            "user-agent": "DevRadarWorker/1.0"
          }
        });

        if (!response.ok) {
          return [];
        }

        const payload = (await response.json()) as Array<Record<string, unknown>>;

        return payload.flatMap((advisory) => {
          const vulnerabilities = getAdvisoryVulnerabilities(advisory);
          const matchingVulnerabilities = vulnerabilities.filter(
            (vulnerability) =>
              getVulnerabilityPackageName(vulnerability) === watched.packageName
          );

          return matchingVulnerabilities
            .map((vulnerability) =>
              mapAdvisoryToStaging(this.key, watched.ecosystem, advisory, vulnerability)
            )
            .filter((item): item is NonNullable<typeof item> => Boolean(item));
        });
      })
    );

    const broadUrl = new URL("https://api.github.com/advisories");
    broadUrl.searchParams.set("type", "reviewed");
    broadUrl.searchParams.set("ecosystem", "npm");
    broadUrl.searchParams.set("per_page", "100");

    const broadResponse = await fetch(broadUrl, {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "DevRadarWorker/1.0"
      }
    });

    const broadAdvisories = broadResponse.ok
      ? ((await broadResponse.json()) as Array<Record<string, unknown>>)
      : [];

    const broadItems = broadAdvisories.flatMap((advisory) => {
      if (!isBroadEcosystemIncident(advisory)) {
        return [];
      }

      return getAdvisoryVulnerabilities(advisory)
        .map((vulnerability) =>
          mapAdvisoryToStaging(this.key, "npm", advisory, vulnerability)
        )
        .filter((item): item is NonNullable<typeof item> => Boolean(item));
    });

    const deduped = new Map<string, NormalizedSecurityStaging>();
    for (const item of [...watchedAdvisories.flat(), ...broadItems]) {
      const dedupeKey = [
        item.packageName.toLowerCase(),
        item.aliases[0] ?? item.title,
        item.affectedVersionRanges.join("|"),
        item.fixedVersions.join("|")
      ].join("::");
      deduped.set(dedupeKey, item);
    }

    return Array.from(deduped.values());
  }
}
