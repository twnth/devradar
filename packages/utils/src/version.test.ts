import { describe, expect, it } from "vitest";
import { matchesAffectedRange } from "./version";

describe("matchesAffectedRange", () => {
  it("matches npm ranges", () => {
    expect(matchesAffectedRange("15.2.0", ["<15.3.6"], "npm")).toBe("exact");
  });

  it("returns likely when version is missing", () => {
    expect(matchesAffectedRange(null, ["<15.3.6"], "npm")).toBe("likely");
  });
});
