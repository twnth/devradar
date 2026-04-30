"use client";

import type { WatchlistItem } from "@devradar/types";
import { SeverityBadge } from "@devradar/ui";

export function WatchlistTable({ items }: { items: WatchlistItem[] }) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-line bg-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="mono break-all font-medium">{item.packageName}</p>
                <p className="mt-1 text-xs text-muted">{item.ecosystem}</p>
              </div>
              <SeverityBadge
                severity={
                  item.impactConfidence === "exact"
                    ? "critical"
                    : item.impactConfidence === "likely"
                      ? "high"
                      : item.impactConfidence === "no_match"
                        ? "info"
                        : "medium"
                }
              />
            </div>
            <div className="mt-4 rounded-xl border border-line bg-black/10 px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Current version</p>
              <p className="mt-2 break-all text-sm mono">{item.currentVersion ?? "unknown"}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl3 border border-line bg-panel md:block">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-black/10 text-left text-xs uppercase tracking-[0.16em] text-muted">
            <tr>
              <th className="px-5 py-4">Package</th>
              <th className="px-5 py-4">Ecosystem</th>
              <th className="px-5 py-4">Current</th>
              <th className="px-5 py-4">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-4">
                  <div className="mono font-medium">{item.packageName}</div>
                </td>
                <td className="px-5 py-4 text-muted">{item.ecosystem}</td>
                <td className="px-5 py-4 mono">{item.currentVersion ?? "unknown"}</td>
                <td className="px-5 py-4">
                  <SeverityBadge
                    severity={
                      item.impactConfidence === "exact"
                        ? "critical"
                        : item.impactConfidence === "likely"
                          ? "high"
                          : item.impactConfidence === "no_match"
                            ? "info"
                            : "medium"
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
