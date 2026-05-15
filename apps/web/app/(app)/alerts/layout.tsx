import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "알림",
  description: "개인화된 보안 및 피드 알림 목록",
  path: "/alerts"
});

export default function AlertsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
