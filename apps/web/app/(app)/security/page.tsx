"use client";

import { useMemo, useState } from "react";
import { SecurityCard } from "@/components/security/security-card";
import { useSecurityIncidents, useWatchlist } from "@/lib/hooks";
import { Card, SectionHeader } from "@devradar/ui";

export default function SecurityPage() {
  const { data } = useSecurityIncidents();
  const { data: watchlist } = useWatchlist();
  const [severity, setSeverity] = useState("all");

  const incidents = data ?? [];
  const watched = new Set((watchlist ?? []).map((item) => item.packageName));

  const filtered = useMemo(
    () => (severity === "all" ? incidents : incidents.filter((item) => item.severity === severity)),
    [incidents, severity]
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <SectionHeader title="Security incidents" description="OSV, GHSA, NVD, CISA KEV를 canonical incident 기준으로 묶었습니다." />
        <div className="mt-6 flex flex-wrap gap-2">
          {["all", "critical", "high", "medium", "low"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSeverity(item)}
              className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.16em] ${severity === item ? "bg-critical text-white" : "border border-line bg-elevated text-muted"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </Card>
      <div className="space-y-4">
        {filtered.map((incident) => (
          <SecurityCard key={incident.id} incident={incident} watchMatch={watched.has(incident.packageName)} />
        ))}
      </div>
    </div>
  );
}
