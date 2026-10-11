"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { EmptyState, PageHeader, PageSkeleton } from "../blocks";
import LibraryCard from "../LibraryCard";
import LibraryToolbar, { NO_FILTERS, NoMatches, filterItems } from "../LibraryToolbar";

export default function DraftsView() {
  const app = useApp();
  const [filters, setFilters] = useState(NO_FILTERS);
  if (!app.loaded) return <PageSkeleton rows={2} />;
  const drafts = app.library.filter((i) => i.status === "draft");
  const visible = filterItems(drafts, filters, app.now, (i) => i.createdAt);

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
        <>
          <LibraryToolbar filters={filters} onChange={setFilters} shown={visible.length} total={drafts.length} dateLabel="Saved" />
          {visible.length === 0 ? (
            <NoMatches onClear={() => setFilters(NO_FILTERS)} />
          ) : (
            <div className="stagger grid items-start gap-4 xl:grid-cols-2">
              {visible.map((item, i) => (
                <div key={item.id} style={{ ["--i" as string]: Math.min(i, 8) }}>
                  <LibraryCard item={item} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
