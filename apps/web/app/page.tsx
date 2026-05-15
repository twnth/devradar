import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "DevRadar",
  description: "DevRadar 기본 진입 경로입니다.",
  path: "/"
});

export default function HomePage() {
  redirect("/dashboard");
}
