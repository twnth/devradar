import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { GoogleAnalyticsPageView } from "@/components/analytics/google-analytics";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://devradar-web-six.vercel.app"),
  applicationName: "DevRadar",
  title: {
    default: "DevRadar | 개발 뉴스와 보안 패치 레이더",
    template: "%s | DevRadar"
  },
  description: "개발 뉴스, 릴리즈, 보안 권고를 모아 내 기술 스택에 영향 있는 업데이트를 빠르게 보여주는 개발자용 레이더",
  keywords: [
    "DevRadar",
    "developer news",
    "security advisories",
    "package updates",
    "React",
    "Next.js",
    "Vite",
    "Spring Boot"
  ],
  authors: [{ name: "DevRadar" }],
  creator: "DevRadar",
  publisher: "DevRadar",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  },
  openGraph: {
    title: "DevRadar | 개발 뉴스와 보안 패치 레이더",
    description: "개발 뉴스, 릴리즈, 보안 권고를 모아 내 기술 스택에 영향 있는 업데이트를 빠르게 보여주는 개발자용 레이더",
    url: "https://devradar-web-six.vercel.app",
    siteName: "DevRadar",
    locale: "ko_KR",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "DevRadar | 개발 뉴스와 보안 패치 레이더",
    description: "개발 뉴스, 릴리즈, 보안 권고를 모아 내 기술 스택에 영향 있는 업데이트를 빠르게 보여주는 개발자용 레이더"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-K8TG32PZ0F"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-K8TG32PZ0F');
          `}
        </Script>
        <Providers>{children}</Providers>
        <GoogleAnalyticsPageView />
      </body>
    </html>
  );
}
