"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PostType } from "@/lib/types";
import { POST_LABELS, POST_TYPES } from "@/lib/types";
import type { DayBucket } from "@/lib/insights";
import { formatDate } from "@/lib/insights";
import { POST_THEME } from "./postTheme";
import { Icon } from "./icons";
import { SampleChip } from "./blocks";

/**
 * Charts are hand-built SVG/HTML so no chart library is needed. Colours are the dark-mode
 * categorical set validated against the card surface (violet / teal / blue). Single-series
 * charts use one colour and no legend, hover/focus shows exact values, and a table view
 * carries every number for anyone who can't or doesn't want to use the chart.
 */

const SERIES = "#8b7cf0";
const SERIES_HOVER = "#a99cf7";
const GRID = "rgb(255 255 255 / 0.07)";
const AXIS = "rgb(255 255 255 / 0.16)";
const MUTED = "#94a3b8";

function useWidth(): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

function niceMax(v: number): number {
  if (v <= 3) return 3;
  if (v <= 6) return 6;
  const step = v <= 10 ? 2 : v <= 30 ? 5 : 10;
  return Math.ceil(v / step) * step;
}

function barPath(x: number, w: number, y: number, base: number, r = 4): string {
  const rr = Math.min(r, w / 2, Math.max(base - y, 0));
  return `M${x},${base}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${base}Z`;
}

export function ActivityChart({
  series,
  sample,
  title,
  subtitle,
}: {
  series: DayBucket[];
  sample: boolean;
  title: string;
  subtitle: string;
}) {
  const [wrapRef, width] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const headingId = useId();

  const H = 210;
  const m = { top: 14, right: 8, bottom: 30, left: 30 };
  const W = Math.max(width, 240);
  const plotW = W - m.left - m.right;
  const plotH = H - m.top - m.bottom;
  const max = niceMax(Math.max(...series.map((b) => b.total), 0));
  const slot = plotW / series.length;
  const barW = Math.min(24, slot * 0.62);
  const base = m.top + plotH;
  // Each date label needs roughly 52px; thin them out so neighbours never touch.
  const labelEvery = Math.max(1, Math.ceil(52 / slot));
  const ticks = [0, max / 2, max];
  const hb = hover === null ? null : series[hover];
  const tipX = hover === null ? 0 : m.left + slot * hover + slot / 2;

  return (
    <section className="surface p-4 sm:p-6" aria-labelledby={headingId}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={headingId} className="text-lg font-semibold text-white">
              {title}
            </h2>
            {sample && <SampleChip />}
          </div>
          <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        </div>
        <div role="group" aria-label="Chart or table" className="flex rounded-lg border border-white/10 bg-ink-950/50 p-0.5 text-xs font-semibold">
          {[
            { label: "Chart", value: false },
            { label: "Table", value: true },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={asTable === o.value}
              onClick={() => setAsTable(o.value)}
              className={`min-h-8 rounded-md px-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 ${
                asTable === o.value ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {asTable ? (
        <div className="mt-4 max-h-64 overflow-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{title}</caption>
            <thead className="sticky top-0 bg-ink-800 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">Day</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Generated</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Saved</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Posted</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-slate-200">
              {[...series].reverse().map((b) => (
                <tr key={b.key}>
                  <th scope="row" className="px-3 py-2 font-medium">
                    {formatDate(b.date.getTime(), { weekday: "short", month: "short", day: "numeric" })}
                  </th>
                  <td className="px-3 py-2 text-right tabular-nums">{b.generated}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{b.saved}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{b.posted}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums text-white">{b.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={wrapRef} className="relative mt-4" style={{ height: H }}>
          {width > 0 && (
            <svg width={W} height={H} role="group" aria-label={`${title}, last ${series.length} days`} className="block overflow-visible">
              {ticks.map((t) => {
                const y = m.top + plotH - (t / max) * plotH;
                return (
                  <g key={t}>
                    <line x1={m.left} x2={W - m.right} y1={y} y2={y} stroke={t === 0 ? AXIS : GRID} strokeWidth="1" />
                    <text x={m.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill={MUTED}>
                      {Number.isInteger(t) ? t : ""}
                    </text>
                  </g>
                );
              })}
              {series.map((b, i) => {
                const x = m.left + slot * i + (slot - barW) / 2;
                const h = (b.total / max) * plotH;
                const y = base - h;
                const isToday = i === series.length - 1;
                const showLabel = (series.length - 1 - i) % labelEvery === 0;
                const active = hover === i;
                return (
                  <g key={b.key}>
                    {b.total > 0 && (
                      <path
                        d={barPath(x, barW, y, base)}
                        fill={active ? SERIES_HOVER : SERIES}
                        className="anim-bar"
                        style={{ animationDelay: `${i * 25}ms` }}
                      />
                    )}
                    {showLabel && (
                      <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize="11" fill={isToday ? "#e2e8f0" : MUTED} fontWeight={isToday ? 600 : 400}>
                        {isToday ? "Today" : formatDate(b.date.getTime())}
                      </text>
                    )}
                    {/* Hit area is the full column, much larger than the bar. */}
                    <rect
                      x={m.left + slot * i}
                      y={m.top}
                      width={slot}
                      height={plotH + 4}
                      fill="transparent"
                      tabIndex={0}
                      role="img"
                      aria-label={`${formatDate(b.date.getTime(), { weekday: "long", month: "long", day: "numeric" })}: ${b.generated} generated, ${b.saved} saved, ${b.posted} published`}
                      onPointerEnter={() => setHover(i)}
                      onPointerLeave={() => setHover(null)}
                      onFocus={() => setHover(i)}
                      onBlur={() => setHover(null)}
                      className="outline-none"
                    />
                  </g>
                );
              })}
            </svg>
          )}
          {hb && (
            <div
              role="presentation"
              className="glass pointer-events-none absolute z-10 w-44 rounded-xl px-3 py-2 text-xs"
              style={{ left: Math.min(Math.max(tipX, 92), W - 92), top: -6, transform: "translate(-50%, -100%)" }}
            >
              <p className="text-slate-300">{formatDate(hb.date.getTime(), { weekday: "short", month: "short", day: "numeric" })}</p>
              <p className="mt-0.5 text-lg font-semibold leading-none text-white">
                {hb.total} <span className="text-xs font-normal text-slate-300">{hb.total === 1 ? "action" : "actions"}</span>
              </p>
              <dl className="mt-1.5 space-y-0.5 text-slate-300">
                <div className="flex justify-between"><dt>Generated</dt><dd className="font-semibold text-slate-100">{hb.generated}</dd></div>
                <div className="flex justify-between"><dt>Saved</dt><dd className="font-semibold text-slate-100">{hb.saved}</dd></div>
                <div className="flex justify-between"><dt>Published</dt><dd className="font-semibold text-slate-100">{hb.posted}</dd></div>
              </dl>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** Drafts + posted items per post type. Bars carry direct value labels, so the numbers never depend on hover. */
export function TypeMix({ counts }: { counts: Record<PostType, number> }) {
  const total = POST_TYPES.reduce((n, t) => n + counts[t], 0);
  const max = Math.max(...POST_TYPES.map((t) => counts[t]), 1);

  return (
    <section className="surface p-4 sm:p-6" aria-labelledby="mix-heading">
      <h2 id="mix-heading" className="text-lg font-semibold text-white">
        Saved posts by type
      </h2>
      <p className="mt-1 text-sm text-slate-300">Drafts and posted items in your library.</p>
      {total === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-white/15 px-4 py-6 text-center text-sm text-slate-300">
          Save a draft to see your mix of domain, trending and work posts.
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {POST_TYPES.map((t) => {
            const theme = POST_THEME[t];
            const pct = (counts[t] / max) * 100;
            return (
              <li key={t}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-slate-200">
                    <Icon name={theme.icon} className={`h-4 w-4 ${theme.text}`} />
                    <span className="truncate">{POST_LABELS[t]}</span>
                  </span>
                  <span className="font-semibold tabular-nums text-white">{counts[t]}</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-white/[0.06]" role="img" aria-label={`${POST_LABELS[t]}: ${counts[t]} of ${total}`}>
                  <div
                    className="h-full rounded-full transition-[width] duration-500 ease-out"
                    style={{ width: `${counts[t] === 0 ? 0 : Math.max(pct, 4)}%`, background: theme.swatch }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
