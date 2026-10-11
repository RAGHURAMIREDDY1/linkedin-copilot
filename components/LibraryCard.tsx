"use client";

import { useState } from "react";
import type { LibraryItem } from "@/lib/types";
import { useApp } from "@/lib/store";
import { Icon } from "./icons";
import PostCard from "./PostCard";
import { btnDanger, btnSecondary } from "./ui";

/**
 * A saved record, reopened as a full post card, so earlier drafts and published posts can be
 * read, copied, edited (drafts only) and published with the same controls as today's posts.
 */
export default function LibraryCard({ item }: { item: LibraryItem }) {
  const { savePost, openPublish, moveToDrafts, removeItem } = useApp();
  const [confirming, setConfirming] = useState(false);
  const published = item.status === "published";

  const extra = confirming ? (
    <>
      <button type="button" onClick={() => removeItem(item.id)} className={`${btnDanger} flex-1 sm:flex-none`}>
        Confirm delete
      </button>
      <button type="button" onClick={() => setConfirming(false)} className={`${btnSecondary} flex-1 sm:flex-none`}>
        Keep
      </button>
    </>
  ) : (
    <>
      {published && (
        <button type="button" onClick={() => moveToDrafts(item.id)} className={`${btnSecondary} flex-1 sm:flex-none`}>
          <Icon name="undo" className="h-4 w-4" />
          Move back to drafts
        </button>
      )}
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="Delete this post"
        className={`${btnSecondary} sm:ml-auto`}
      >
        <Icon name="trash" className="h-4 w-4" />
        <span className="sm:sr-only">Delete</span>
      </button>
    </>
  );

  return (
    <PostCard
      post={item.post}
      onSave={savePost}
      onPublish={() => openPublish(item.id)}
      savedAt={item.createdAt}
      publishedAt={published ? item.publishedAt : undefined}
      draftSaved
      extra={extra}
    />
  );
}
