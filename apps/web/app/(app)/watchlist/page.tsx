"use client";

import { Clock3, Radar } from "lucide-react";
import { Card, SectionHeader } from "@devradar/ui";

export default function WatchlistPage() {
  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <SectionHeader
            title="Watchlist"
            description="워치리스트 기능은 현재 개발 중입니다. 패키지 등록과 영향도 추적 기능은 곧 제공됩니다."
          />
          <div className="hidden rounded-2xl border border-line bg-elevated p-3 sm:block">
            <Radar className="size-5 text-accent" />
          </div>
        </div>
      </Card>
      <Card className="p-8 sm:p-10">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-2xl border border-line bg-elevated p-4">
            <Clock3 className="size-6 text-accent" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">워치리스트는 곧 제공됩니다.</h2>
            <p className="max-w-xl text-sm leading-7 text-muted">
              패키지를 등록하고 보안 이슈와 업그레이드 필요 항목을 자동으로 추적하는 기능을 준비하고 있습니다.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
