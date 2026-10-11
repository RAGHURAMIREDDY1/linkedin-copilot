"use client";

import type { SampleTrend } from "@/lib/generators";
import { Icon } from "./icons";
import Tilt from "./Tilt";
import { btnPrimary, btnSecondary, chip } from "./ui";

/**
 * One accent per rank so the three topics read as distinct at a glance. Rank 2 and 3 reuse the
 * app's violet and blue; the cyan of rank 1 matches the Trending post colour. Colour is never the
 * only cue: each card also carries its rank number.
 */
const ACCENTS = [
  { tile: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200", wash: "from-cyan-400/14", dot: "bg-cyan-300", ring: "border-cyan-400/50" },
  { tile: "border-violet-400/30 bg-violet-400/10 text-violet-200", wash: "from-violet-400/16", dot: "bg-violet-300", ring: "border-violet-400/50" },
  { tile: "border-blue-400/30 bg-blue-400/10 text-blue-200", wash: "from-blue-400/16", dot: "bg-blue-300", ring: "border-blue-400/50" },
];

/** One sample trend. Always labelled as sample data: nothing here is live or verified. */
export default function TrendCard({
  rank,
  trend,
  selected,
  onUse,
  detailed = false,
}: {
  rank: number;
  trend: SampleTrend;
  selected: boolean;
  onUse: () => void;
  detailed?: boolean;
}) {
  const accent = ACCENTS[(rank - 1) % ACCENTS.length];
  return (
    <Tilt className={`surface flex h-full flex-col overflow-hidden p-5 sm:p-6 ${selected ? accent.ring : ""}`}>
      <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${accent.wash} via-transparent to-transparent`} />
      <div className="relative flex items-center justify-between gap-2">
        <span className={`grid h-9 w-9 place-items-center rounded-xl border text-sm font-bold tabular-nums ${accent.tile}`}>
          {String(rank).padStart(2, "0")}
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          <span className={`${chip} border-amber-300/30 bg-amber-300/10 text-amber-200`}>Sample, not live</span>
          {selected && (
            <span className={`${chip} ${accent.tile}`}>
              <Icon name="check" className="h-3 w-3" />
              In use
            </span>
          )}
        </div>
      </div>
      <h3 className="relative mt-4 text-lg font-semibold leading-snug text-white">{trend.topic}</h3>
      <p className={`relative mt-2 text-sm leading-relaxed text-slate-300 ${detailed ? "" : "line-clamp-3"}`}>{trend.hook}</p>
      {detailed && (
        <ul className="relative mt-4 space-y-2 text-sm text-slate-300">
          {trend.points.map((p) => (
            <li key={p} className="flex gap-2.5">
              <span aria-hidden="true" className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} />
              {p}
            </li>
          ))}
        </ul>
      )}
      <div className="relative mt-auto pt-5">
        {/* Honest provenance: the built-in sample has no outside source or publication date. */}
        <p className="mb-3 text-xs text-slate-400">Source: built-in sample. No publication date.</p>
        <button type="button" onClick={onUse} className={`${selected ? btnSecondary : btnPrimary} w-full sm:w-auto`}>
          Create post from topic
          <Icon name="chevronRight" className="h-4 w-4" />
        </button>
      </div>
    </Tilt>
  );
}
