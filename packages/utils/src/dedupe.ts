import { formatISO } from "date-fns";

function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function canonicalizeUrl(url: string) {
  const parsed = new URL(url);
  parsed.hash = "";
  parsed.searchParams.sort();
  return parsed.toString();
}

export function createFeedDedupeKey(input: {
  canonicalUrl?: string | null;
  sourceName: string;
  title: string;
  publishedAt: Date;
}) {
  if (input.canonicalUrl) {
    return canonicalizeUrl(input.canonicalUrl);
  }

  return [
    input.sourceName.toLowerCase(),
    normalizeTitle(input.title),
    formatISO(input.publishedAt, { representation: "date" })
  ].join(":");
}

export function mergeAliasSets(current: string[], incoming: string[]) {
  return Array.from(new Set([...current, ...incoming])).sort();
}
