"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SAMPLE_TRENDS } from "@/lib/generators";
import { activeDays, dailySeries, greeting, sampleSeries, totalsByKind, typeMix, formatDate } from "@/lib/insights";
import { POST_LABELS, POST_TYPES } from "@/lib/types";
import type { LibraryItem } from "@/lib/types";
import { useApp } from "@/lib/store";
import { SampleChip, PageSkeleton, StatTile } from "../blocks";
import { ActivityChart, TypeMix } from "../charts";
import { Icon } from "../icons";
import { POST_THEME } from "../postTheme";
import TrendCard from "../TrendCards";
import WorkUpdateForm from "../WorkUpdateForm";
import { btnLink, eyebrow } from "../ui";

function RecentList({
  title,
  href,
  items,
  published,
  empty,
}: {
  title: string;
  href: string;
  items: LibraryItem[];
  published: boolean;
  empty: string;
}) {
  return (
    <section className="surface p-4 sm:p-6" aria-label={title}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <Link href={href} className={btnLink}>
          View all
          <Icon name="chevronRight" className="h-4 w-4" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-white/15 px-4 py-6 text-center text-sm text-slate-300">{empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-white/[0.06]">
          {items.map((item) => {
            const theme = POST_THEME[item.post.type];
            const when = published && item.publishedAt ? item.publishedAt : item.createdAt;
            return (
              <li key={item.id}>
                <Link
                  href={href}
                  className="-mx-2 flex items-start gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70"
                >
                  <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${theme.iconTile}`}>
                    <Icon name={theme.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-100">{item.post.hook}</span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      {POST_LABELS[item.post.type]} · {formatDate(when)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function OverviewView() {
  const app = useApp();
  const router = useRouter();

  if (!app.loaded) return <PageSkeleton rows={3} />;

  const drafts = app.library.filter((i) => i.status === "draft");
  const published = app.library.filter((i) => i.status === "published");
  const hasActivity = app.activity.length > 0;
  const series = hasActivity ? dailySeries(app.activity, 14, app.now) : sampleSeries(14, app.now);
  const totals = totalsByKind(app.activity);
  const mix = typeMix(app.library);

  const unsaved = !!app.posts && POST_TYPES.every((t) => !app.isSaved(app.posts![t]));
  let summary: string;
  if (app.posts && unsaved) summary = "Your latest three drafts are ready. Review, edit and save them in Create Posts.";
  else if (drafts.length + published.length > 0)
    summary = `${drafts.length} draft${drafts.length === 1 ? "" : "s"} saved and ${published.length} published. Add today's notes to write more.`;
  else summary = "No drafts yet. Add today's notes and generate three posts in one click.";

  function generate() {
    // Validation errors show on the notes box right here; on success, go and watch the drafts appear.
    if (app.generate()) router.push("/create");
  }

  function chooseTrend(index: number) {
    app.selectTrend(index);
    router.push("/create");
  }

  return (
    <div className="space-y-8">
      {/* Hero + primary action */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section className="surface relative overflow-hidden p-5 sm:p-8 2xl:pr-64" aria-labelledby="hero-heading">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <p className={`${eyebrow} relative`}>Overview</p>
          <h1 id="hero-heading" className="relative mt-2 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {greeting(app.now)}.
          </h1>
          <p className="relative mt-3 hidden max-w-xl text-base leading-relaxed text-slate-300 sm:block">{summary}</p>
          <p className="relative mt-4 max-w-md text-balance text-xl font-semibold leading-snug sm:mt-6 sm:text-2xl">
            <span className="bg-gradient-to-r from-violet-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
              Three LinkedIn posts. Tailored to your professional goals. Ready in one click.
            </span>
          </p>

          <p className="relative mt-4 max-w-md text-sm leading-relaxed text-amber-100/90 sm:mt-5">
            <strong className="font-semibold text-amber-200">Demo Mode:</strong> local templates only. No AI, live trends
            or LinkedIn connection.
          </p>

          {/* Decorative depth: three stacked "post" tiles in perspective. */}
          <div aria-hidden="true" className="stack-scene pointer-events-none absolute bottom-8 right-16 hidden h-32 w-44 2xl:block">
            <div className="anim-float relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
              <div className="stack-card" />
              <div className="stack-card" />
              <div className="stack-card p-4">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-violet-400 to-blue-500" />
                  <span className="h-2 w-20 rounded-full bg-white/25" />
                </div>
                <div className="mt-4 space-y-2">
                  <span className="block h-2 w-full rounded-full bg-white/15" />
                  <span className="block h-2 w-11/12 rounded-full bg-white/15" />
                  <span className="block h-2 w-2/3 rounded-full bg-white/15" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <WorkUpdateForm
          notes={app.notes}
          onChange={app.setNotes}
          onGenerate={generate}
          error={app.error}
          loading={app.generating}
          loadingLive={app.generatingLive}
          rows={4}
        />
      </div>

      {/* Trending topics (sample data) */}
      <section aria-labelledby="trend-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 id="trend-heading" className="text-xl font-semibold text-white">
              Top trending topics
            </h2>
            <SampleChip>Sample data, not live</SampleChip>
          </div>
          <Link href="/trending" className={btnLink}>
            View all
            <Icon name="chevronRight" className="h-4 w-4" />
          </Link>
        </div>
        <div className="stagger mt-4 grid gap-4 md:grid-cols-3">
          {SAMPLE_TRENDS.map((trend, i) => (
            <div key={trend.topic} style={{ ["--i" as string]: i }} className="h-full">
              <TrendCard rank={i + 1} trend={trend} selected={app.trendIndex === i} onUse={() => chooseTrend(i)} />
            </div>
          ))}
        </div>
      </section>

      {/* Analytics */}
      <section aria-labelledby="analytics-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="analytics-heading" className="text-xl font-semibold text-white">
            Your activity
          </h2>
          <Link href="/analytics" className={btnLink}>
            Analytics
            <Icon name="chevronRight" className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Posts generated" value={totals.generated} caption="All time, this browser" icon="sparkles" />
          <StatTile label="Drafts saved" value={drafts.length} caption="Waiting in My Drafts" icon="file" />
          <StatTile label="Published" value={published.length} caption="Confirmed by you" icon="send" />
          <StatTile label="Active days" value={activeDays(dailySeries(app.activity, 14, app.now))} caption="Of the last 14" icon="calendar" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <ActivityChart
            series={series}
            sample={!hasActivity}
            title="Publishing activity"
            subtitle="Posts generated, saved and published, per day."
          />
          <TypeMix counts={mix} />
        </div>
      </section>

      {/* Recent library */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentList
          title="Recent drafts"
          href="/drafts"
          items={drafts.slice(0, 3)}
          published={false}
          empty="No saved drafts yet. Generate posts, then save the ones you like."
        />
        <RecentList
          title="Recently published"
          href="/published"
          items={[...published].sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0)).slice(0, 3)}
          published
          empty="Nothing published yet. Use Publish on a draft, post it on LinkedIn, then confirm here."
        />
      </div>
    </div>
  );
}
