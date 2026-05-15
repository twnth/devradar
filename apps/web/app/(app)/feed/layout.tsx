import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "오늘의 피드",
  description: "개발 뉴스, 릴리즈, 공급망 보안 이슈를 한 화면에서 정리한 DevRadar 피드",
  path: "/feed"
});

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
