import type { NormalizedSecurityStaging } from "@devradar/types";
import { normalizedSecurityStagingSchema } from "@devradar/types";
import type { SecuritySourceAdapter } from "../lib/adapter";

export class OsvAdapter implements SecuritySourceAdapter {
  key = "osv";

  async fetch(): Promise<NormalizedSecurityStaging[]> {
    const response = await fetch("https://api.osv.dev/v1/querybatch", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        queries: [
          { package: { name: "next", ecosystem: "npm" } },
          { package: { name: "react", ecosystem: "npm" } },
          { package: { name: "spring-boot", ecosystem: "Maven" } }
        ]
      })
    });

    const payload = (await response.json()) as {
      results?: Array<{
        vulns?: Array<Record<string, unknown>>;
      }>;
    };

    return (payload.results ?? [])
      .flatMap((result) => result.vulns ?? [])
      .map((vuln) =>
        normalizedSecurityStagingSchema.parse({
          sourceKey: this.key,
          packageName: String((vuln.affected as Array<{ package?: { name?: string } }> | undefined)?.[0]?.package?.name ?? "unknown"),
          ecosystem: String((vuln.affected as Array<{ package?: { ecosystem?: string } }> | undefined)?.[0]?.package?.ecosystem ?? "unknown"),
          title: String(vuln.summary ?? vuln.id ?? "OSV advisory"),
          aliases: Array.isArray(vuln.aliases) ? vuln.aliases.map(String) : [String(vuln.id)],
          affectedVersionRanges: [String((vuln.affected as Array<{ ranges?: Array<{ events?: Array<Record<string, string>> }> }> | undefined)?.[0]?.ranges?.[0]?.events?.map((event) => Object.values(event).join(" ")).join(" ") ?? "")].filter(Boolean),
          fixedVersions: [String((vuln.affected as Array<{ versions?: string[] }> | undefined)?.[0]?.versions?.at(-1) ?? "")].filter(Boolean),
          references: Array.isArray(vuln.references)
            ? vuln.references.map((reference) => String((reference as { url?: string }).url)).filter(Boolean)
            : [],
          severity: "high",
          exploitStatus: "unknown",
          publishedAt: String(vuln.published ?? new Date().toISOString()),
          modifiedAt: String(vuln.modified ?? new Date().toISOString()),
          rawPayload: vuln
        })
      );
  }
}
