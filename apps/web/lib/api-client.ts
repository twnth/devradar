"use client";

import type {
  DashboardSummary,
  FeedBriefing,
  FeedItem,
  SecurityImpactBriefing,
  SecurityIncident,
  UserAlert,
  WatchlistItem
} from "@devradar/types";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

type FeedQuery = {
  category?: string;
  tag?: string;
  sort?: string;
  limit?: number;
};

function toQueryString(query: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`);
    if (!response.ok) {
      return fallback;
    }
    const payload = await response.json();
    return ("data" in payload ? payload.data : payload) as T;
  } catch {
    return fallback;
  }
}

export function getFeedItems(query: FeedQuery = {}) {
  return fetchJson<FeedItem[]>("/api/v1/feed" + toQueryString(query), []);
}

export function getDashboardSummary() {
  return fetchJson<DashboardSummary>("/api/v1/dashboard/summary", {
    criticalIncidentCount: 0,
    watchedAtRiskCount: 0,
    todayFeedCount: 0,
    topPriorityLabel: "-"
  });
}

export function getFeedItem(id: string) {
  return fetchJson<FeedItem | undefined>(`/api/v1/feed/${id}`, undefined);
}

export function getFeedBriefing(id: string) {
  return fetchJson<FeedBriefing | null>(`/api/v1/feed/${id}/briefing`, null);
}

export function getSecurityIncidents() {
  return fetchJson<SecurityIncident[]>("/api/v1/security/incidents", []);
}

export function getSecurityIncident(id: string) {
  return fetchJson<SecurityIncident | undefined>(`/api/v1/security/incidents/${id}`, undefined);
}

export function getSecurityImpactBriefing(id: string) {
  return fetchJson<SecurityImpactBriefing | null>(`/api/v1/security/incidents/${id}/impact`, null);
}

export function getWatchlist() {
  return fetchJson<WatchlistItem[]>("/api/v1/watchlist", []);
}

export function getAlerts() {
  return fetchJson<UserAlert[]>("/api/v1/alerts", []);
}

export function getSettings() {
  return fetchJson("/api/v1/settings", {
    notifications: {
      email: true,
      inApp: true,
      webPush: false
    },
    digestHour: "09:00",
    theme: "dark",
    sourceFilters: []
  });
}
