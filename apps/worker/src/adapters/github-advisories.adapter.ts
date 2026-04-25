import type { NormalizedSecurityStaging } from "@devradar/types";
import { normalizedSecurityStagingSchema } from "@devradar/types";
import type { SecuritySourceAdapter } from "../lib/adapter";

const watchedPackages = [
  { packageName: "next", ecosystem: "npm" },
  { packageName: "react", ecosystem: "npm" },
  { packageName: "vite", ecosystem: "npm" }
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

export class GitHubAdvisoriesAdapter implements SecuritySourceAdapter {
  key = "github-advisories";

  async fetch(): Promise<NormalizedSecurityStaging[]> {
    const advisories = await Promise.all(
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
          const vulnerabilities = Array.isArray(advisory.vulnerabilities)
            ? advisory.vulnerabilities as Array<Record<string, unknown>>
            : [];
          const matchingVulnerabilities = vulnerabilities.filter(
            (vulnerability) =>
              getVulnerabilityPackageName(vulnerability) === watched.packageName
          );

          return matchingVulnerabilities.map((vulnerability) =>
            normalizedSecurityStagingSchema.parse({
              sourceKey: this.key,
              packageName: watched.packageName,
              ecosystem: watched.ecosystem,
              title: String(advisory.summary ?? advisory.ghsa_id ?? "GitHub advisory"),
              aliases: [
                String(advisory.ghsa_id ?? ""),
                String(advisory.cve_id ?? "")
              ].filter(Boolean),
              affectedVersionRanges: [
                String(vulnerability.vulnerable_version_range ?? "")
              ].filter(Boolean),
              fixedVersions: [
                getFirstPatchedVersion(vulnerability.first_patched_version)
              ].filter(Boolean),
              references: [String(advisory.html_url ?? advisory.url ?? "")].filter(Boolean),
              severity: mapSeverity(advisory.severity),
              exploitStatus: "unknown",
              publishedAt: String(advisory.published_at ?? new Date().toISOString()),
              modifiedAt: String(advisory.updated_at ?? advisory.published_at ?? new Date().toISOString()),
              rawPayload: advisory
            })
          );
        });
      })
    );

    return advisories.flat();
  }
}
