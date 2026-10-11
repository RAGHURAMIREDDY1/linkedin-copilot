import type { ActivityEvent, ActivityKind, LibraryItem, PostType } from "./types";
import { POST_TYPES } from "./types";

/**
 * Pure helpers that turn the local activity log and library into numbers for the
 * dashboard. Everything here comes from this browser's own data. There is no LinkedIn
 * connection, so no impressions, reactions or follower figures exist.
 */

export interface DayBucket {
  key: string; // local YYYY-MM-DD
  date: Date;
  generated: number;
  saved: number;
  posted: number;
  total: number;
}

function dayStart(ms: number): Date {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** One bucket per local day for the last `days` days, oldest first, ending today. */
export function dailySeries(events: ActivityEvent[], days: number, now: number): DayBucket[] {
  const today = dayStart(now);
  const buckets: DayBucket[] = [];
  const index = new Map<string, DayBucket>();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const b: DayBucket = { key: dayKey(date), date, generated: 0, saved: 0, posted: 0, total: 0 };
    buckets.push(b);
    index.set(b.key, b);
  }
  for (const e of events) {
    const b = index.get(dayKey(dayStart(e.t)));
    if (!b) continue;
    b[e.kind as ActivityKind] += e.count;
    b.total += e.count;
  }
  return buckets;
}

/** Illustrative numbers shown (and labelled "Sample") until the user has real activity. */
const SAMPLE_PATTERN: [number, number, number][] = [
  [3, 2, 1], [0, 0, 0], [3, 1, 0], [3, 3, 2], [0, 0, 0], [0, 0, 0], [3, 2, 1],
  [3, 3, 1], [0, 0, 0], [3, 2, 2], [3, 1, 1], [0, 0, 0], [3, 3, 2], [3, 2, 1],
];

export function sampleSeries(days: number, now: number): DayBucket[] {
  const base = dailySeries([], days, now);
  return base.map((b, i) => {
    const [generated, saved, posted] = SAMPLE_PATTERN[i % SAMPLE_PATTERN.length];
    return { ...b, generated, saved, posted, total: generated + saved + posted };
  });
}

export function totalsByKind(events: ActivityEvent[]): Record<ActivityKind, number> {
  const out: Record<ActivityKind, number> = { generated: 0, saved: 0, posted: 0 };
  for (const e of events) out[e.kind] += e.count;
  return out;
}

export function typeMix(items: LibraryItem[]): Record<PostType, number> {
  const out = Object.fromEntries(POST_TYPES.map((t) => [t, 0])) as Record<PostType, number>;
  for (const i of items) out[i.post.type] += 1;
  return out;
}

export function activeDays(series: DayBucket[]): number {
  return series.filter((b) => b.total > 0).length;
}

export function greeting(now: number): string {
  const h = new Date(now).getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function formatDate(ms: number, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(undefined, opts ?? { month: "short", day: "numeric" }).format(new Date(ms));
}

export function formatDateTime(ms: number): string {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(
    new Date(ms),
  );
}

export function initialsOf(role: string): string {
  const words = role.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "ME";
  return (words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0]).toUpperCase();
}
