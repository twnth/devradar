import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DevRadar",
  description: "개발자용 최신 뉴스와 긴급 패치 레이더"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
