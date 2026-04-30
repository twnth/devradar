import { BookOpenText, Gauge, Radar, ShieldAlert } from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/feed", label: "Feed", icon: BookOpenText },
  { href: "/security", label: "Security", icon: ShieldAlert },
  { href: "/watchlist", label: "Watchlist", icon: Radar }
] as const;
