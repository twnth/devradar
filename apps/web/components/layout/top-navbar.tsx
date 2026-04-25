"use client";

import { Search } from "lucide-react";
import { usePathname } from "next/navigation";

const routeTitles: Record<string, string> = {
  "/dashboard": "Developer Dashboard",
  "/feed": "Unified Feed",
  "/security": "Urgent Patch Radar",
  "/watchlist": "Package Watchlist"
};

export function TopNavbar() {
  const pathname = usePathname();
  const title = Object.entries(routeTitles).find(([route]) => pathname.startsWith(route))?.[1] ?? "DevRadar";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#090b12]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Today</p>
          <h2 className="mt-1 text-xl font-semibold">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-muted md:flex">
            <Search className="size-4" />
            React, Next.js, CVE, Spring...
          </div>
        </div>
      </div>
    </header>
  );
}
