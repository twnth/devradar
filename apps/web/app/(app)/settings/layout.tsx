import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "설정",
  description: "알림 및 계정 설정",
  path: "/settings"
});

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
