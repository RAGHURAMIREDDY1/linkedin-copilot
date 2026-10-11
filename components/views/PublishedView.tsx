"use client";

import { useApp } from "@/lib/store";
import { DemoNote, EmptyState, PageHeader, PageSkeleton } from "../blocks";
import LibraryCard from "../LibraryCard";

export default function PublishedView() {
  const app = useApp();
  if (!app.loaded) return <PageSkeleton rows={2} />;
  const published = app.library
    .filter((i) => i.status === "published")
    .sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Published posts"
        title="Posts you've published"
        description="Posts you confirmed you published on LinkedIn, with the time you confirmed."
      />
      <DemoNote>
        <strong className="font-semibold">SignalPost doesn&apos;t publish for you.</strong> A post appears here only after
        you pressed &ldquo;I have published this&rdquo;. It&apos;s your confirmation: there is no LinkedIn connection, so
        nothing is verified and there are no views or reactions to show.
      </DemoNote>
      {published.length === 0 ? (
        <EmptyState
          icon="send"
          title="Nothing published yet"
          body="Press Publish on a draft, post it on LinkedIn yourself, then confirm “I have published this”. It will appear here with the time you confirmed."
          href="/drafts"
          cta="Go to My Drafts"
        />
      ) : (
        <div className="stagger grid gap-4 xl:grid-cols-2">
          {published.map((item, i) => (
            <div key={item.id} style={{ ["--i" as string]: Math.min(i, 8) }}>
              <LibraryCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
