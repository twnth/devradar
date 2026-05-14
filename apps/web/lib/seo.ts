import type { Metadata } from "next";

const defaultSiteUrl = "https://devradar-web-six.vercel.app";

export function getSiteUrl() {
  const value =
    process.env.APP_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_BASE_URL ??
    defaultSiteUrl;

  try {
    return new URL(value).origin;
  } catch {
    return defaultSiteUrl;
  }
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function buildPublicMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(input.path);

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: url
    },
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: "DevRadar",
      type: "website",
      locale: "ko_KR"
    },
    twitter: {
      card: "summary",
      title: input.title,
      description: input.description
    }
  };
}

export function buildNoIndexMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: absoluteUrl(input.path)
    },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true
      }
    }
  };
}
