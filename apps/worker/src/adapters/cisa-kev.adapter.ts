import type { NormalizedSecurityStaging } from "@devradar/types";
import { normalizedSecurityStagingSchema } from "@devradar/types";
import type { SecuritySourceAdapter } from "../lib/adapter";

function normalizeProductName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class CisaKevAdapter implements SecuritySourceAdapter {
  key = "cisa-kev";

  async fetch(): Promise<NormalizedSecurityStaging[]> {
    const response = await fetch(
      "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
      {
        headers: {
          "user-agent": "DevRadarWorker/1.0"
        }
      }
    );

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as {
      vulnerabilities?: Array<{
        cveID?: string;
        vendorProject?: string;
        product?: string;
        vulnerabilityName?: string;
        dateAdded?: string;
        shortDescription?: string;
        requiredAction?: string;
        notes?: string;
      }>;
    };

    return (payload.vulnerabilities ?? []).slice(0, 25).map((vulnerability) =>
      normalizedSecurityStagingSchema.parse({
        sourceKey: this.key,
        packageName: normalizeProductName(
          vulnerability.product ?? vulnerability.vendorProject ?? "unknown"
        ),
        ecosystem: "unknown",
        title: vulnerability.vulnerabilityName ?? vulnerability.cveID ?? "CISA KEV advisory",
        aliases: [String(vulnerability.cveID ?? "")].filter(Boolean),
        affectedVersionRanges: [],
        fixedVersions: [],
        references: ["https://www.cisa.gov/known-exploited-vulnerabilities-catalog"],
        severity: "critical",
        exploitStatus: "known_exploited",
        publishedAt: vulnerability.dateAdded
          ? new Date(vulnerability.dateAdded).toISOString()
          : new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        rawPayload: vulnerability
      })
    );
  }
}
