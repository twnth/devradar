import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "로그인",
  description: "DevRadar GitHub 로그인 페이지",
  path: "/login"
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
