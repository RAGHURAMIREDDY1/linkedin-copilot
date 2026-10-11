"use client";

import type { LibraryItem, PostType } from "@/lib/types";
import { POST_LABELS, POST_TYPES } from "@/lib/types";
import { Icon } from "./icons";
import { fieldClass, focusRing } from "./ui";

/**
 * Search and filters for the saved-post views. Purely a view over the existing library: it never
 * changes a record, a status or the publishing workflow.
 */

export type DateRange = "all" | "7" | "30";

export interface LibraryFilters {
  query: string;
  type: PostType | "all";
  range: DateRange;
}

export const NO_FILTERS: LibraryFilters = { query: "", type: "all", range: "all" };

const DAY = 86_400_000;

export function isFiltering(f: LibraryFilters): boolean {
  return f.query.trim() !== "" || f.type !== "all" || f.range !== "all";
}

/** `dateOf` picks the date that matters for the view: saved time for drafts, confirmed time for published posts. */
export function filterItems(
  items: LibraryItem[],
  f: LibraryFilters,
  now: number,
  dateOf: (item: LibraryItem) => number,
): LibraryItem[] {
  const words = f.query.toLowerCase().split(/\s+/).filter(Boolean);
  const since = f.range === "all" ? 0 : now - Number(f.range) * DAY;
  return items.filter((item) => {
    if (f.type !== "all" && item.post.type !== f.type) return false;
    if (dateOf(item) < since) return false;
    if (words.length === 0) return true;
    const hay = `${item.post.hook} ${item.post.body} ${item.post.hashtags.join(" ")}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

const TYPE_SHORT: Record<PostType, string> = { domain: "Domain", trending: "Trending", work: "Work" };

export default function LibraryToolbar({
  filters,
  onChange,
  shown,
  total,
  dateLabel,
}: {
  filters: LibraryFilters;
  onChange: (next: LibraryFilters) => void;
  shown: number;
  total: number;
  /** Names the date being filtered, e.g. "Saved" or "Published". */
  dateLabel: string;
}) {
  const filtering = isFiltering(filters);
  return (
    <section aria-label="Search and filters" className="surface p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">Search posts</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="Search hooks, text or hashtags"
            className={`${fieldClass} !mt-0 pl-10`}
          />
        </label>

        <div role="group" aria-label="Post type" className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-ink-950/50 p-0.5 text-xs font-semibold">
          {(["all", ...POST_TYPES] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={filters.type === t}
              title={t === "all" ? "All types" : POST_LABELS[t]}
              onClick={() => onChange({ ...filters, type: t })}
              className={`min-h-9 rounded-lg px-3 transition-colors ${focusRing} ${
                filters.type === t ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t === "all" ? "All" : TYPE_SHORT[t]}
            </button>
          ))}
        </div>

        <label className="block lg:w-44">
          <span className="sr-only">{dateLabel} date</span>
          <select
            value={filters.range}
            onChange={(e) => onChange({ ...filters, range: e.target.value as DateRange })}
            className={`${fieldClass} !mt-0 cursor-pointer`}
          >
            <option value="all">{dateLabel}: any time</option>
            <option value="7">{dateLabel}: last 7 days</option>
            <option value="30">{dateLabel}: last 30 days</option>
          </select>
        </label>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400" role="status" aria-live="polite">
        <span>
          {filtering ? `Showing ${shown} of ${total}` : `${total} ${total === 1 ? "post" : "posts"}`}
        </span>
        {filtering && (
          <button
            type="button"
            onClick={() => onChange(NO_FILTERS)}
            className={`inline-flex min-h-8 items-center gap-1 rounded-md px-1 font-semibold text-violet-300 hover:text-violet-200 hover:underline ${focusRing}`}
          >
            <Icon name="x" className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}

/** Shown when filters hide every post. */
export function NoMatches({ onClear }: { onClear: () => void }) {
  return (
    <div className="surface flex flex-col items-center px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-300">
        <Icon name="search" className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-white">No posts match these filters</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-300">Try a different word or a wider date range.</p>
      <button
        type="button"
        onClick={onClear}
        className={`mt-4 inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-100 hover:bg-white/10 ${focusRing}`}
      >
        Clear filters
      </button>
    </div>
  );
}
