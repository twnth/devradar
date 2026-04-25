"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useSecurityImpactBriefing, useSecurityIncident, useWatchlist } from "@/lib/hooks";
import { Card, ErrorState, SectionHeader, SeverityBadge, TagPill } from "@devradar/ui";

export default function SecurityDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useSecurityIncident(params.id);
  const impactQuery = useSecurityImpactBriefing(params.id);
  const { data: watchlist } = useWatchlist();

  if (isLoading) {
    return null;
  }

  if (!data) {
    return <ErrorState title="보안 사고를 찾지 못했습니다." />;
  }

  const watchMatch = (watchlist ?? []).find((item) => item.packageName === data.packageName);

  return (
    <div className="space-y-6">
      <Link href="/security" className="inline-flex items-center gap-2 text-sm text-muted">
        <ArrowLeft className="size-4" />
        보안 레인으로 돌아가기
      </Link>

      <Card className="border-critical/25 p-8">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={data.severity === "unknown" ? "info" : data.severity} />
          <TagPill label={data.packageName} />
          <TagPill label={data.ecosystem} />
          {data.exploitStatus === "known_exploited" ? <TagPill label="known exploited" /> : null}
          {watchMatch ? <TagPill label={`watch: ${watchMatch.currentVersion ?? "unknown"}`} /> : null}
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">{data.title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted">{data.summaryKo}</p>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-8">
          <SectionHeader title="Version impact" description="가장 먼저 봐야 할 건 affected / fixed line입니다." />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-elevated p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Affected ranges</p>
              <p className="mt-3 mono text-sm">{data.affectedVersionRanges.join(", ")}</p>
            </div>
            <div className="rounded-2xl border border-safe/25 bg-safe/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-safe">Fixed versions</p>
              <p className="mt-3 mono text-sm">{data.fixedVersions.join(", ") || "미정"}</p>
            </div>
          </div>
          {impactQuery.isLoading ? (
            <div className="mt-6 rounded-2xl border border-line bg-elevated p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">조치하지 않으면 생길 수 있는 일</p>
              <div className="mt-4 flex items-center gap-3 text-sm text-muted">
                <LoaderCircle className="size-4 animate-spin text-accent" />
                <span>실제 advisory 기준으로 사이드 이펙트를 정리하는 중입니다.</span>
              </div>
            </div>
          ) : null}
          {impactQuery.data ? (
            <div className="mt-6 rounded-2xl border border-line bg-elevated p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">조치하지 않으면 생길 수 있는 일</p>
              <h2 className="mt-3 text-lg font-semibold">{impactQuery.data.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{impactQuery.data.intro}</p>
              <div className="mt-5 space-y-3">
                {impactQuery.data.sideEffects.map((effect) => (
                  <div key={effect} className="rounded-2xl border border-line/80 bg-black/10 p-4 text-sm leading-7 text-foreground/90">
                    {effect}
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-critical/20 bg-critical/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-critical">Operational risk</p>
                <p className="mt-2 text-sm leading-7 text-foreground/90">{impactQuery.data.operationalRisk}</p>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="p-8">
          <SectionHeader title="References & aliases" />
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Aliases</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.aliases.map((alias) => (
                  <TagPill key={alias} label={alias} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">References</p>
              <div className="mt-3 space-y-2">
                {data.references.map((reference) => (
                  <a key={reference} href={reference} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-accent">
                    {reference}
                    <ExternalLink className="size-4" />
                  </a>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-elevated p-4 text-sm leading-7 text-muted">
              Published: {new Date(data.publishedAt).toLocaleString("ko-KR")}
              <br />
              Modified: {new Date(data.modifiedAt).toLocaleString("ko-KR")}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
