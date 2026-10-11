import Link from "next/link";
import { Icon, type IconName } from "./icons";
import { btnPrimary, chip, eyebrow, focusRing } from "./ui";

export function PageHeader({
  eyebrow: kicker,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className={eyebrow}>{kicker}</p>
        <h1 className="mt-1.5 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-300">{description}</p>}
      </div>
      {actions}
    </header>
  );
}

/** Honest "this is a demo" note. Used wherever a view could be mistaken for live data. */
export function DemoNote({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`flex items-start gap-2.5 rounded-xl border border-amber-300/25 bg-amber-300/[0.07] px-3.5 py-2.5 text-sm leading-relaxed text-amber-100 ${className}`}
    >
      <Icon name="info" className="mt-0.5 h-4 w-4 text-amber-300" />
      <span>{children}</span>
    </p>
  );
}

export function SampleChip({ children = "Sample data" }: { children?: string }) {
  return <span className={`${chip} border-amber-300/30 bg-amber-300/10 text-amber-200`}>{children}</span>;
}

export function EmptyState({
  icon,
  title,
  body,
  href,
  cta,
}: {
  icon: IconName;
  title: string;
  body: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="surface flex flex-col items-center px-6 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/20 to-blue-500/10 text-violet-300">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-300">{body}</p>
      {href && cta && (
        <Link href={href} className={`${btnPrimary} mt-5`}>
          {cta}
        </Link>
      )}
    </div>
  );
}

export function StatTile({
  label,
  value,
  caption,
  icon,
  href,
}: {
  label: string;
  value: string | number;
  caption: string;
  icon: IconName;
  /** When set, the whole tile links to the page where this number comes from. */
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-300">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-violet-300 transition-colors group-hover:border-violet-400/40 group-hover:bg-violet-400/10">
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-white tabular-nums">{value}</p>
      <p className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-400">
        <span>{caption}</span>
        {href && <Icon name="chevronRight" className="h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-300" />}
      </p>
    </>
  );
  return href ? (
    <Link href={href} className={`surface surface-hover group block h-full p-4 sm:p-5 ${focusRing}`}>
      {body}
    </Link>
  ) : (
    <div className="surface h-full p-4 sm:p-5">{body}</div>
  );
}

// ---------- loading states ----------

export function PageSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-3">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-9 w-2/3 max-w-md" />
        <div className="skeleton h-4 w-full max-w-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="surface space-y-3 p-5">
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-4/5" />
            <div className="skeleton h-3 w-3/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Shown in place of the three cards while drafts are being built. */
export function PostSkeletons() {
  return (
    <div className="space-y-6" aria-busy="true">
      <p className="flex items-center gap-2 text-sm font-medium text-violet-200" role="status">
        <span aria-hidden="true" className="anim-spin h-4 w-4 rounded-full border-2 border-violet-300/30 border-t-violet-300" />
        Building your three drafts from your notes and profile…
      </p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="surface p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="skeleton h-9 w-9" />
            <div className="skeleton h-4 w-48" />
          </div>
          <div className="mt-5 space-y-2.5 rounded-xl border border-white/[0.06] bg-ink-950/40 p-5">
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-11/12" />
            <div className="skeleton h-3 w-2/3" />
          </div>
          <div className="mt-5 flex gap-2">
            <div className="skeleton h-10 w-28" />
            <div className="skeleton h-10 w-20" />
            <div className="skeleton h-10 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
