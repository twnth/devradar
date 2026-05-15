import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Dashboard",
  description: "개발 뉴스, 릴리즈, 보안 이슈를 한 화면에서 빠르게 확인하는 DevRadar 대시보드",
  path: "/dashboard"
});

export default function DashboardRouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
