"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const GA_MEASUREMENT_ID = "G-XGPYG18XV2";

type GtagCommand = "js" | "config" | "event";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (command: GtagCommand, target: string | Date, params?: Record<string, unknown>) => void;
  }
}

export function GoogleAnalyticsPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.gtag) {
      return;
    }

    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: pathname
    });
  }, [pathname]);

  return null;
}
