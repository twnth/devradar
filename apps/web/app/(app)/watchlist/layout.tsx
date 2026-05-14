import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Watchlist",
  description: "추적 중인 패키지 목록과 영향도 관리",
  path: "/watchlist"
});

export default function WatchlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
