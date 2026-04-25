"use client";

import type { UserAlert } from "@devradar/types";
import { Card, SeverityBadge } from "@devradar/ui";

export function AlertsList({ alerts }: { alerts: UserAlert[] }) {
  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card key={alert.id} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={alert.severity} />
                <span className="text-xs uppercase tracking-[0.18em] text-muted">{alert.type}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{alert.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{alert.body}</p>
            </div>
            <span className="text-xs text-muted">{alert.status}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
