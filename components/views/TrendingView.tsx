"use client";

import { useRouter } from "next/navigation";
import { SAMPLE_TRENDS } from "@/lib/generators";
import { useApp } from "@/lib/store";
import { DemoNote, PageHeader, PageSkeleton } from "../blocks";
import TrendCard from "../TrendCards";

export default function TrendingView() {
  const app = useApp();
  const router = useRouter();
  if (!app.loaded) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Trending topics"
        title="Topics worth posting about"
        description="Pick the theme your Trending post should cover. Your choice is used the next time you generate, and swaps the topic right away if drafts already exist."
      />
      <DemoNote>
        <strong className="font-semibold">Sample data, not live.</strong> These three topics are built into the demo.
        SignalPost isn&apos;t connected to any trend source, so nothing here is verified current news.
      </DemoNote>
      <div className="stagger grid gap-5 lg:grid-cols-3">
        {SAMPLE_TRENDS.map((trend, i) => (
          <div key={trend.topic} style={{ ["--i" as string]: i }} className="h-full">
            <TrendCard
              rank={i + 1}
              trend={trend}
              detailed
              selected={app.trendIndex === i}
              onUse={() => {
                app.selectTrend(i);
                router.push("/create");
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
