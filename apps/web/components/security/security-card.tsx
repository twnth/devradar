"use client";

import Link from "next/link";
import type { SecurityIncident } from "@devradar/types";
import { Card, SeverityBadge, TagPill } from "@devradar/ui";

export function SecurityCard({
  incident,
  watchMatch
}: {
  incident: SecurityIncident;
  watchMatch?: boolean;
}) {
  return (
    <Link href={`/security/${incident.id}`}>
      <Card className="p-5 transition hover:-translate-y-0.5 hover:border-critical/40">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={incident.severity === "unknown" ? "info" : incident.severity} />
              <TagPill label={incident.packageName} />
              {watchMatch ? <TagPill label="watched" /> : null}
              {incident.exploitStatus === "known_exploited" ? <TagPill label="known exploited" /> : null}
            </div>
            <h3 className="mt-4 text-lg font-semibold">{incident.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{incident.summaryKo}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-elevated p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Affected</p>
            <p className="mt-2 break-words text-sm mono">{incident.affectedVersionRanges.join(", ")}</p>
          </div>
          <div className="rounded-2xl border border-safe/25 bg-safe/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-safe">Fixed</p>
            <p className="mt-2 break-words text-sm mono">{incident.fixedVersions.join(", ") || "미정"}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
