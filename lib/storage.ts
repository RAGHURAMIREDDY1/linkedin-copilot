import type { ActivityEvent, AppState, LibraryItem, Post, Posts } from "./types";
import { POST_TYPES } from "./types";
import { DEFAULT_PROFILE } from "./defaults";

const KEY = "linkedin-copilot:v1";

function isPost(value: unknown): value is Post {
  const p = value as Post;
  return (
    !!p &&
    typeof p.hook === "string" &&
    typeof p.body === "string" &&
    Array.isArray(p.hashtags) &&
    typeof p.variant === "number"
  );
}

function isLibraryItem(value: unknown): value is LibraryItem {
  const i = value as LibraryItem;
  return (
    !!i &&
    typeof i.id === "string" &&
    typeof i.createdAt === "number" &&
    (i.status === "draft" || i.status === "published") &&
    isPost(i.post) &&
    POST_TYPES.includes(i.post.type)
  );
}

function isActivity(value: unknown): value is ActivityEvent {
  const e = value as ActivityEvent;
  return (
    !!e &&
    typeof e.t === "number" &&
    typeof e.count === "number" &&
    (e.kind === "generated" || e.kind === "saved" || e.kind === "posted")
  );
}

/** Data saved by earlier versions used the post type "visibility"; it is now "domain". */
function migratePost(value: unknown): unknown {
  const p = value as { type?: string } | null;
  return p && p.type === "visibility" ? { ...p, type: "domain" } : value;
}

function migrateItem(value: unknown): unknown {
  const i = value as LibraryItem | null;
  if (!i || typeof i !== "object" || !i.post) return value;
  // Every saved record's post carries its own id, which is how edits and publishing stay linked.
  return { ...i, post: { ...(migratePost(i.post) as Post), draftId: i.id } };
}

/** Client-only. Returns null when nothing valid is stored or storage is unavailable. */
export function loadState(): AppState | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const profile = { ...DEFAULT_PROFILE, ...(data.profile ?? {}) };
    const notes = typeof data.notes === "string" ? data.notes : "";
    const migrated = data.posts
      ? {
          domain: migratePost(data.posts.domain ?? data.posts.visibility),
          trending: migratePost(data.posts.trending),
          work: migratePost(data.posts.work),
        }
      : null;
    const posts: Posts | null = migrated && POST_TYPES.every((t) => isPost(migrated[t])) ? (migrated as Posts) : null;
    // Older saved data has no library/activity, so default both to empty.
    const library: LibraryItem[] = Array.isArray(data.library) ? data.library.map(migrateItem).filter(isLibraryItem) : [];
    const activity: ActivityEvent[] = Array.isArray(data.activity) ? data.activity.filter(isActivity) : [];
    return { profile, notes, posts, library, activity };
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked (e.g. private mode): the app still works, just without persistence.
  }
}
