import { describe, expect, it } from "vitest";
import { createFeedDedupeKey } from "./dedupe";

describe("createFeedDedupeKey", () => {
  it("prefers canonical url", () => {
    expect(
      createFeedDedupeKey({
        canonicalUrl: "https://example.com/a?b=1",
        sourceName: "HN",
        title: "Ignored",
        publishedAt: new Date("2026-04-16T00:00:00Z")
      })
    ).toBe("https://example.com/a?b=1");
  });
});
