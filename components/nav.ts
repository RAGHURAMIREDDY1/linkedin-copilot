import type { IconName } from "./icons";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  /** Short hint shown in the quick-navigation dialog. */
  hint: string;
}

export const NAV: NavItem[] = [
  { href: "/", label: "Overview", icon: "overview", hint: "Dashboard and daily summary" },
  { href: "/create", label: "Create Posts", icon: "sparkles", hint: "Notes, profile and your three drafts" },
  { href: "/trending", label: "Trending Topics", icon: "trending", hint: "Sample topics for your industry" },
  { href: "/drafts", label: "My Drafts", icon: "file", hint: "Drafts you saved" },
  { href: "/published", label: "Published Posts", icon: "send", hint: "Posts you confirmed you published" },
  { href: "/analytics", label: "Analytics", icon: "chart", hint: "Your activity in this browser" },
  { href: "/settings", label: "Settings", icon: "settings", hint: "Profile, connections and data" },
];

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}
