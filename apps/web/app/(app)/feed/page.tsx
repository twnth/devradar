"use client";

import { useMemo, useState } from "react";
import { FeedCard } from "@/components/feed/feed-card";
import { useFeedItems } from "@/lib/hooks";
import { Card, SectionHeader } from "@devradar/ui";

export default function FeedPage() {
  const { data } = useFeedItems();
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const items = data ?? [];

  const filtered = useMemo(() => {
    const byCategory = category === "all" ? items : items.filter((item) => item.category === category);
    return [...byCategory].sort((left, right) => {
      if (sort === "important") return right.finalScore - left.finalScore;
      if (sort === "discussed") return right.discussionScore - left.discussionScore;
      return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
    });
  }, [items, category, sort]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <SectionHeader title="Feed" description="AI / Web / App / Backend / Security 뉴스를 하나의 스캐너로 정리했습니다." />
        <div className="mt-6 flex flex-wrap gap-3">
          {["all", "ai", "web", "app", "backend", "security"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.16em] ${category === item ? "bg-accent text-white" : "border border-line bg-elevated text-muted"}`}
            >
              {item}
            </button>
          ))}
          <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
            {["latest", "important", "discussed"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSort(item)}
                className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.16em] ${sort === item ? "bg-white text-black" : "border border-line bg-elevated text-muted"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filtered.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
