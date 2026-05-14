import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Dashboard",
  description: "개인화된 개발 뉴스와 보안 요약 대시보드",
  path: "/dashboard"
});

export default function DashboardRouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
