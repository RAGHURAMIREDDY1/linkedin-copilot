"use client";

import { useApp } from "@/lib/store";
import { EmptyState, PageHeader, PageSkeleton } from "../blocks";
import LibraryCard from "../LibraryCard";

export default function DraftsView() {
  const app = useApp();
  if (!app.loaded) return <PageSkeleton rows={2} />;
  const drafts = app.library.filter((i) => i.status === "draft");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My drafts"
        title="Saved drafts"
        description={
          drafts.length
            ? `${drafts.length} draft${drafts.length === 1 ? "" : "s"}. Open one to edit it, or press Publish when you're ready to post it on LinkedIn.`
            : "Drafts you save from Create Posts live here."
        }
      />
      {drafts.length === 0 ? (
        <EmptyState
          icon="file"
          title="No saved drafts yet"
          body="Generate today's posts, then use “Save draft” on the ones you like. Pressing Publish also saves a post here first. Drafts are kept in this browser."
          href="/create"
          cta="Create posts"
        />
      ) : (
        <div className="stagger grid gap-4 xl:grid-cols-2">
          {drafts.map((item, i) => (
            <div key={item.id} style={{ ["--i" as string]: Math.min(i, 8) }}>
              <LibraryCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
