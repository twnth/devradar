import { describe, expect, it } from "vitest";
import { buildAlertCopy, shouldTriggerImmediateAlert } from "./alerts";

describe("alerts", () => {
  it("triggers immediate alert for exact high severity", () => {
    expect(shouldTriggerImmediateAlert({
      severity: "high",
      packageMatched: true,
      currentVersionConfidence: "exact",
      exploitStatus: "none"
    })).toBe(true);
  });

  it("builds actionable copy", () => {
    expect(buildAlertCopy({
      packageName: "next",
      severity: "critical",
      fixedVersion: "15.3.6"
    }).body).toContain("15.3.6");
  });
});
