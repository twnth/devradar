import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "보안 이슈",
  description: "OSV, GHSA, NVD, CISA KEV 기반 보안 이슈와 공급망 사고를 정리한 DevRadar 보안 피드",
  path: "/security"
});

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
