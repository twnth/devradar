import type { Metadata } from "next";
 
export const metadata: Metadata = {
  title: "보안 이슈 상세",
  description: "패키지별 영향을 받는 버전과 권장 대응 방법을 확인합니다.",
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: "보안 이슈 상세",
    description: "패키지별 영향을 받는 버전과 권장 대응 방법을 확인합니다.",
    siteName: "DevRadar",
    type: "article",
    locale: "ko_KR"
  },
  twitter: {
    card: "summary",
    title: "보안 이슈 상세",
    description: "패키지별 영향을 받는 버전과 권장 대응 방법을 확인합니다."
  }
};

export default function SecurityDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
