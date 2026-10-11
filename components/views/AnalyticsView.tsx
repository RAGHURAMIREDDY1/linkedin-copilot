"use client";

import { activeDays, dailySeries, sampleSeries, totalsByKind, typeMix } from "@/lib/insights";
import { useApp } from "@/lib/store";
import { DemoNote, PageHeader, PageSkeleton, StatTile } from "../blocks";
import { ActivityChart, TypeMix } from "../charts";
import { Icon } from "../icons";

export default function AnalyticsView() {
  const app = useApp();
  if (!app.loaded) return <PageSkeleton rows={4} />;

  const hasActivity = app.activity.length > 0;
  const series = hasActivity ? dailySeries(app.activity, 30, app.now) : sampleSeries(30, app.now);
  const totals = totalsByKind(app.activity);
  const drafts = app.library.filter((i) => i.status === "draft").length;
  const published = app.library.filter((i) => i.status === "published").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Your activity"
        description="What you've done in SignalPost, counted in this browser."
      />
      <DemoNote>
        Figures come from your own activity here. Engagement numbers (views, reactions, followers) need a LinkedIn
        connection, which Demo Mode doesn&apos;t have.
        {!hasActivity && " The chart shows sample data until you generate your first posts."}
      </DemoNote>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Posts generated" value={totals.generated} caption="All time" icon="sparkles" />
        <StatTile label="Drafts saved" value={totals.saved} caption={`${drafts} still in drafts`} icon="file" />
        <StatTile label="Published" value={totals.posted} caption={`${published} currently published`} icon="send" />
        <StatTile label="Active days" value={activeDays(series.slice(-14))} caption="Of the last 14" icon="calendar" />
      </div>

      <ActivityChart
        series={series}
        sample={!hasActivity}
        title="Publishing activity, last 30 days"
        subtitle="Posts generated, saved and published, per day."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <TypeMix counts={typeMix(app.library)} />
        <section className="surface flex flex-col items-start p-4 sm:p-6" aria-labelledby="engagement-heading">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
            <Icon name="lock" className="h-5 w-5" />
          </span>
          <h2 id="engagement-heading" className="mt-4 text-lg font-semibold text-white">
            Engagement insights
          </h2>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-300">
            Impressions, reactions and follower growth would appear here once a LinkedIn account is connected. Not
            available in Demo Mode.
          </p>
        </section>
      </div>
    </div>
  );
}
