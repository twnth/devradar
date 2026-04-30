"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { FeedItem } from "@devradar/types";
import { Card, SourceBadge, TagPill } from "@devradar/ui";

export function FeedCard({ item }: { item: FeedItem }) {
  return (
    <Link href={`/feed/${item.id}`}>
      <Card className="p-5 transition hover:-translate-y-0.5 hover:border-accent/50">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <TagPill label={item.category.toUpperCase()} />
              <SourceBadge label={item.sourceName} />
            </div>
            <h3 className="mt-4 text-lg font-semibold leading-7">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{item.summaryKo}</p>
          </div>
          <div className="shrink-0 rounded-xl border border-line bg-black/10 px-3 py-2 text-xs text-muted">
            {Math.round(item.finalScore)}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {item.tags.map((tag) => (
            <TagPill key={tag} label={tag} />
          ))}
          <span className="w-full text-xs text-muted sm:ml-auto sm:w-auto">
            {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true, locale: ko })}
          </span>
        </div>
      </Card>
    </Link>
  );
}
