"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAlerts,
  getFeedBriefing,
  getFeedItem,
  getFeedItems,
  getSecurityImpactBriefing,
  getSecurityIncident,
  getSecurityIncidents,
  getSettings,
  getWatchlist
} from "./api-client";

type FeedQuery = {
  category?: string;
  tag?: string;
  sort?: string;
  limit?: number;
};

export function useFeedItems(query: FeedQuery = {}) {
  return useQuery({
    queryKey: ["feed-items", query],
    queryFn: () => getFeedItems(query)
  });
}

export function useFeedItem(id: string) {
  return useQuery({
    queryKey: ["feed-item", id],
    queryFn: () => getFeedItem(id)
  });
}

export function useFeedBriefing(id: string) {
  return useQuery({
    queryKey: ["feed-briefing", id],
    queryFn: () => getFeedBriefing(id),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });
}

export function useSecurityIncidents() {
  return useQuery({
    queryKey: ["security-incidents"],
    queryFn: getSecurityIncidents
  });
}

export function useSecurityIncident(id: string) {
  return useQuery({
    queryKey: ["security-incident", id],
    queryFn: () => getSecurityIncident(id)
  });
}

export function useSecurityImpactBriefing(id: string) {
  return useQuery({
    queryKey: ["security-impact-briefing", id],
    queryFn: () => getSecurityImpactBriefing(id),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });
}

export function useWatchlist() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: getWatchlist
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: getAlerts
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettings
  });
}
