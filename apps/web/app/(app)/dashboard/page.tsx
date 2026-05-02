"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Newspaper, Shield, TrendingUp } from "lucide-react";
import { Card, SectionHeader, SeverityBadge, SourceBadge } from "@devradar/ui";
import { FeedCard } from "@/components/feed/feed-card";
import { SecurityCard } from "@/components/security/security-card";
import { useDashboardSummary, useFeedItems, useSecurityIncidents, useWatchlist } from "@/lib/hooks";

const categoryTabs = ["all", "ai", "web", "app", "backend", "security"] as const;
type DashboardCategory = (typeof categoryTabs)[number];

export default function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState<DashboardCategory>("all");
  const summary = useDashboardSummary();
  const feed = useFeedItems({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    limit: 4
  });
  const security = useSecurityIncidents();
  const watchlist = useWatchlist();

  const feedItems = feed.data ?? [];
  const incidents = (security.data ?? []).slice(0, 3);
  const watchedPackages = watchlist.data ?? [];
  const criticalIncidentCount = summary.data?.criticalIncidentCount ?? 0;
  const watchedAtRiskCount = summary.data?.watchedAtRiskCount ?? 0;
  const todayFeedCount = summary.data?.todayFeedCount ?? 0;
  const topPriorityLabel = summary.data?.topPriorityLabel ?? "-";

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
      <div className="space-y-6">
        <Card className="border-critical/25 bg-[linear-gradient(135deg,rgba(239,68,68,0.14),rgba(17,20,32,1))] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="metric-chip border-critical/30 bg-critical/15 text-critical">Urgent patch radar</p>
              <h1 className="mt-5 text-3xl font-semibold">긴급 업그레이드가 필요한 이슈가 있습니다.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                지금 점검할 패키지 이슈를 먼저 보여줍니다.
              </p>
            </div>
            <AlertTriangle className="size-8 text-critical" />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/security" className="rounded-2xl bg-critical px-4 py-3 text-sm font-medium text-white">
              보안 레인으로 이동
            </Link>
            <Link href="/watchlist" className="rounded-2xl border border-line bg-panel px-4 py-3 text-sm font-medium">
              워치리스트 점검
            </Link>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "긴급 점검 이슈", value: criticalIncidentCount, icon: AlertTriangle },
            { label: "주시 중 위험 패키지", value: watchedAtRiskCount, icon: Shield },
            { label: "오늘의 새 피드", value: todayFeedCount, icon: Newspaper },
            { label: "최고 우선순위", value: topPriorityLabel, icon: TrendingUp }
          ].map((metric) => {
            const Icon = metric.icon;
            const isTextValue = typeof metric.value === "string";
            return (
              <Card key={metric.label} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted">{metric.label}</p>
                    <p
                      title={String(metric.value)}
                      className={`mt-4 max-w-full font-semibold ${isTextValue ? "block overflow-hidden text-ellipsis whitespace-nowrap text-xl leading-7 xl:text-2xl" : "text-3xl"}`}
                    >
                      {metric.value}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-2xl border border-line bg-elevated p-3">
                    <Icon className="size-5 text-accent" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-6">
          <SectionHeader
            title="Unified developer feed"
            description="중요한 변경만 먼저 훑고, 자세한 내용은 상세에서 이어서 읽을 수 있습니다."
            action={<Link href="/feed" className="text-sm text-accent">전체 보기</Link>}
          />
          <div className="mt-5 flex flex-wrap gap-2">
            {categoryTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedCategory(tab)}
                className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.16em] ${selectedCategory === tab ? "bg-accent text-white" : "border border-line bg-elevated text-muted"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            {feedItems.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
            {feedItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-elevated p-5 text-sm text-muted">
                이 카테고리에 표시할 피드가 아직 없습니다.
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader
            title="Urgent security incidents"
            description="중복 advisory를 걷어내고 canonical incident 중심으로 정리했습니다."
            action={<Link href="/security" className="text-sm text-accent">전체 보기</Link>}
          />
          <div className="mt-6 space-y-4">
            {incidents.map((incident) => (
              <SecurityCard
                key={incident.id}
                incident={incident}
                watchMatch={watchedPackages.some((item) => item.packageName === incident.packageName)}
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <SectionHeader title="Today’s highlights" description="우측 패널은 데스크톱에서 빠르게 훑는 용도입니다." />
          <div className="mt-5 space-y-3">
            {incidents.slice(0, 3).map((incident) => (
              <Link
                key={incident.id}
                href={`/security/${incident.id}`}
                className="block rounded-2xl border border-line bg-elevated p-4 transition hover:border-critical/40"
              >
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={incident.severity === "unknown" ? "info" : incident.severity} />
                  <span className="mono min-w-0 break-all text-sm">{incident.packageName}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">{incident.summaryKo}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader title="Watched package status" description="현재 버전이 있으면 impact confidence를 같이 보여줍니다." />
          <div className="mt-5 space-y-3">
            {watchedPackages.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-line bg-elevated p-4">
                <div className="min-w-0 flex-1">
                  <p className="mono break-all text-sm font-medium">{item.packageName}</p>
                  <p className="mt-1 text-xs text-muted">{item.currentVersion ?? "version unknown"}</p>
                </div>
                <div className="shrink-0 pl-3">
                  <SourceBadge label={item.impactConfidence ?? "unknown"} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
