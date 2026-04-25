import type { NormalizedSecurityStaging } from "@devradar/types";
import { normalizedSecurityStagingSchema } from "@devradar/types";
import type { SecuritySourceAdapter } from "../lib/adapter";

const watchedPackages = ["next", "react", "vite", "okhttp", "spring boot"];

function mapSeverity(metrics: unknown) {
  const metricRecord = metrics as
    | {
        cvssMetricV31?: Array<{ cvssData?: { baseSeverity?: string } }>;
        cvssMetricV40?: Array<{ cvssData?: { baseSeverity?: string } }>;
        cvssMetricV30?: Array<{ cvssData?: { baseSeverity?: string } }>;
        cvssMetricV2?: Array<{ baseSeverity?: string }>;
      }
    | undefined;
  const severity =
    metricRecord?.cvssMetricV40?.[0]?.cvssData?.baseSeverity ??
    metricRecord?.cvssMetricV31?.[0]?.cvssData?.baseSeverity ??
    metricRecord?.cvssMetricV30?.[0]?.cvssData?.baseSeverity ??
    metricRecord?.cvssMetricV2?.[0]?.baseSeverity ??
    "unknown";
  const normalized = severity.toLowerCase();

  return ["critical", "high", "medium", "low"].includes(normalized)
    ? normalized
    : "unknown";
}

export class NvdAdapter implements SecuritySourceAdapter {
  key = "nvd";

  async fetch(): Promise<NormalizedSecurityStaging[]> {
    const results = await Promise.all(
      watchedPackages.map(async (packageName) => {
        const url = new URL("https://services.nvd.nist.gov/rest/json/cves/2.0");
        url.searchParams.set("keywordSearch", packageName);
        url.searchParams.set("resultsPerPage", "10");

        const response = await fetch(url, {
          headers: {
            "user-agent": "DevRadarWorker/1.0"
          }
        });

        if (!response.ok) {
          return [];
        }

        const payload = (await response.json()) as {
          vulnerabilities?: Array<{
            cve?: {
              id?: string;
              descriptions?: Array<{ lang?: string; value?: string }>;
              references?: { referenceData?: Array<{ url?: string }> };
              metrics?: unknown;
              published?: string;
              lastModified?: string;
            };
          }>;
        };

        return (payload.vulnerabilities ?? []).map((entry) => {
          const cve = entry.cve ?? {};
          const title =
            cve.descriptions?.find((description) => description.lang === "en")?.value ??
            cve.id ??
            "NVD advisory";

          return normalizedSecurityStagingSchema.parse({
            sourceKey: this.key,
            packageName: packageName.replace(" ", "-"),
            ecosystem: packageName === "okhttp" || packageName === "spring boot" ? "maven" : "npm",
            title,
            aliases: [String(cve.id ?? "")].filter(Boolean),
            affectedVersionRanges: [],
            fixedVersions: [],
            references: (cve.references?.referenceData ?? [])
              .map((reference) => String(reference.url ?? ""))
              .filter(Boolean)
              .slice(0, 5),
            severity: mapSeverity(cve.metrics),
            exploitStatus: "unknown",
            publishedAt: String(cve.published ?? new Date().toISOString()),
            modifiedAt: String(cve.lastModified ?? cve.published ?? new Date().toISOString()),
            rawPayload: entry
          });
        });
      })
    );

    return results.flat();
  }
}
