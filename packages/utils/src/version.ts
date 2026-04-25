import semver from "semver";
import type { ImpactConfidence } from "@devradar/types";

function normalizeJvmVersion(version: string) {
  const coerced = semver.coerce(version.replace(/[^0-9A-Za-z.+-]/g, ""));
  return coerced?.version ?? null;
}

export function matchesAffectedRange(
  currentVersion: string | null | undefined,
  ranges: string[],
  ecosystem: string
): ImpactConfidence {
  if (!currentVersion) {
    return "likely";
  }

  try {
    if (ecosystem === "npm") {
      const exact = ranges.some((range) => semver.satisfies(currentVersion, range, { includePrerelease: true }));
      return exact ? "exact" : "no_match";
    }

    if (ecosystem === "maven" || ecosystem === "gradle") {
      const normalized = normalizeJvmVersion(currentVersion);
      if (!normalized) {
        return "unknown";
      }

      const exact = ranges.some((range) => {
        const converted = range
          .replace(/\[/g, ">=")
          .replace(/\(/g, ">")
          .replace(/\]/g, "")
          .replace(/\)/g, "")
          .replace(/,/g, " <");
        return semver.satisfies(normalized, converted);
      });

      return exact ? "exact" : "no_match";
    }
  } catch {
    return "unknown";
  }

  return "unknown";
}
