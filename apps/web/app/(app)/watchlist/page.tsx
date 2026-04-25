"use client";

import { Radar } from "lucide-react";
import { WatchlistTable } from "@/components/watchlist/watchlist-table";
import { useWatchlist } from "@/lib/hooks";
import { Card, SectionHeader } from "@devradar/ui";

export default function WatchlistPage() {
  const { data } = useWatchlist();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <SectionHeader title="Watchlist" description="버전이 없더라도 패키지 레벨로 먼저 감시하고, 있으면 impact confidence를 높입니다." />
          <div className="rounded-2xl border border-line bg-elevated p-3">
            <Radar className="size-5 text-accent" />
          </div>
        </div>
      </Card>
      <WatchlistTable items={data ?? []} />
    </div>
  );
}
