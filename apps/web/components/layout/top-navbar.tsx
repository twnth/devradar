"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { navItems } from "./nav-items";

const routeTitles: Record<string, string> = {
  "/dashboard": "Developer Dashboard",
  "/feed": "Unified Feed",
  "/security": "Urgent Patch Radar",
  "/watchlist": "Package Watchlist"
};

export function TopNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const title = Object.entries(routeTitles).find(([route]) => pathname.startsWith(route))?.[1] ?? "DevRadar";

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#090b12]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-panel text-white lg:hidden"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Today</p>
            <h2 className="mt-1 truncate text-xl font-semibold">{title}</h2>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-muted md:flex">
            <Search className="size-4" />
            React, Next.js, CVE, Spring...
          </div>
        </div>
      </div>
      {mobileMenuOpen ? (
        <div className="border-t border-line bg-[#090b12]/95 px-4 pb-6 pt-4 sm:px-6 lg:hidden">
          <div className="rounded-2xl border border-line bg-panel p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">DevRadar</p>
            <p className="mt-3 text-base font-semibold text-white">Patch radar for developers</p>
            <p className="mt-2 text-sm leading-6 text-muted">뉴스는 빠르게, 업그레이드는 더 빠르게.</p>
          </div>
          <nav className="mt-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                    active ? "bg-accent text-white" : "bg-panel text-muted hover:text-white"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
