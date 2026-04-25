import { describe, expect, it } from "vitest";
import { calculateFeedScore, calculateSecurityPriority } from "./scoring";

describe("scoring", () => {
  it("calculates feed score", () => {
    expect(calculateFeedScore({
      freshnessScore: 100,
      importanceScore: 80,
      discussionScore: 50,
      interestMatchScore: 90
    })).toBeGreaterThan(80);
  });

  it("boosts critical watched known-exploited incidents", () => {
    expect(calculateSecurityPriority({
      severity: "critical",
      watchedPackage: true,
      knownExploited: true,
      hasFixedVersion: true,
      publishedWithin48h: true
    })).toBe(220);
  });
});
