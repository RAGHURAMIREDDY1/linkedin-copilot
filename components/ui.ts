/** Shared Tailwind class strings so every button, field and card looks the same. */

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900";

const btn = `inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

// White text on violet-600 / blue-600 keeps contrast above 5:1.
export const btnPrimary = `${btn} border-white/15 bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-950/40 hover:brightness-110`;
export const btnSecondary = `${btn} border-white/10 bg-white/5 text-slate-100 hover:border-white/20 hover:bg-white/10`;
export const btnSuccess = `${btn} border-emerald-400/40 bg-emerald-500/15 text-emerald-200`;
export const btnDanger = `${btn} border-red-400/40 bg-red-500/15 text-red-200 hover:bg-red-500/25`;

export const btnLink = `inline-flex min-h-8 items-center rounded-md px-1 text-sm font-semibold text-violet-300 transition-colors hover:text-violet-200 hover:underline ${focusRing}`;

// 16px text on small screens stops iOS Safari zooming into the field on focus.
export const fieldClass =
  "mt-1.5 block w-full rounded-xl border border-white/10 bg-ink-950/60 px-3 py-2.5 text-base text-slate-100 shadow-inner shadow-black/20 transition-colors placeholder:text-slate-500 hover:border-white/20 focus:border-violet-400/70 focus:outline-none focus:ring-2 focus:ring-violet-400/25 sm:text-sm";

export const cardClass = "surface p-4 sm:p-6";

export const eyebrow = "text-xs font-semibold uppercase tracking-[0.14em] text-slate-400";

export const chip = "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium";

export { focusRing };
