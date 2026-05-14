import type { Metadata } from "next";
 
export const metadata: Metadata = {
  title: "피드 상세",
  description: "개발 뉴스와 릴리즈, 공급망 보안 이슈의 상세 내용을 확인합니다.",
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: "피드 상세",
    description: "개발 뉴스와 릴리즈, 공급망 보안 이슈의 상세 내용을 확인합니다.",
    siteName: "DevRadar",
    type: "article",
    locale: "ko_KR"
  },
  twitter: {
    card: "summary",
    title: "피드 상세",
    description: "개발 뉴스와 릴리즈, 공급망 보안 이슈의 상세 내용을 확인합니다."
  }
};

export default function FeedDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
