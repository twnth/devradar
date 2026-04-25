import type { Severity } from "@devradar/types";

export function calculateFeedScore(input: {
  freshnessScore: number;
  importanceScore: number;
  discussionScore: number;
  interestMatchScore: number;
}) {
  return (
    input.freshnessScore * 0.45 +
    input.importanceScore * 0.3 +
    input.discussionScore * 0.15 +
    input.interestMatchScore * 0.1
  );
}

export function calculateSecurityPriority(input: {
  severity: Severity;
  watchedPackage: boolean;
  knownExploited: boolean;
  hasFixedVersion: boolean;
  publishedWithin48h: boolean;
}) {
  const severityWeight = {
    critical: 100,
    high: 70,
    medium: 40,
    low: 20,
    unknown: 10
  }[input.severity];

  return (
    severityWeight +
    (input.watchedPackage ? 40 : 0) +
    (input.knownExploited ? 60 : 0) +
    (input.hasFixedVersion ? 10 : 0) +
    (input.publishedWithin48h ? 10 : 0)
  );
}
