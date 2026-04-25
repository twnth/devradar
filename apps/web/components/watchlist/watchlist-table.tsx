"use client";

import type { WatchlistItem } from "@devradar/types";
import { SeverityBadge } from "@devradar/ui";

export function WatchlistTable({ items }: { items: WatchlistItem[] }) {
  return (
    <div className="overflow-hidden rounded-xl3 border border-line bg-panel">
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
  );
}
