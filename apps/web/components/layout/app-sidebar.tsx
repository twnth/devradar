"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { navItems } from "./nav-items";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen border-r border-line bg-[#0d1019]/90 p-5 lg:block">
      <div className="flex h-full flex-col">
        <Link href="/dashboard" className="rounded-2xl border border-line bg-panel p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">DevRadar</p>
          <h1 className="mt-3 text-xl font-semibold">Patch radar for developers</h1>
          <p className="mt-3 text-sm leading-6 text-muted">뉴스는 빠르게, 업그레이드는 더 빠르게.</p>
        </Link>
        <nav className="mt-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                  active ? "bg-accent text-white" : "bg-transparent text-muted hover:bg-panel hover:text-white"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-critical/30 bg-critical/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-critical">Security first</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            긴급 이슈는 피드와 분리되어 항상 별도 레인에 노출됩니다.
          </p>
        </div>
      </div>
    </aside>
  );
}
