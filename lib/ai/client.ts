import type { PostType, Profile } from "../types";

/** Browser-side helpers for the live AI route. No keys here: the server owns them (see app/api/ai/route.ts). */

export interface AiStatus {
  configured: boolean;
  model: string | null;
}

export interface AiResult {
  model: string;
  posts: Partial<Record<PostType, { hook: string; body: string; hashtags: string[] }>>;
}

/** Longer than the server's own timeout plus its one retry, so the server's error arrives first. */
const CLIENT_TIMEOUT_MS = 150_000;

export async function fetchAiStatus(): Promise<AiStatus> {
  try {
    const res = await fetch("/api/ai", { cache: "no-store" });
    const data = await res.json();
    return { configured: data?.configured === true, model: typeof data?.model === "string" ? data.model : null };
  } catch {
    return { configured: false, model: null };
  }
}

/** Resolves with drafts, or throws an Error whose message is safe to show to the user. */
export async function requestDrafts(input: {
  profile: Profile;
  notes: string;
  types: PostType[];
  trendIndex: number;
  avoid: Partial<Record<PostType, string>>;
}): Promise<AiResult> {
  let res: Response;
  try {
    res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
    });
  } catch {
    throw new Error("Couldn't reach the server for live AI. Check your connection, or use Demo Mode.");
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error("The server sent an unreadable response. Please try again, or use Demo Mode.");
  }

  const d = data as { ok?: boolean; error?: unknown; model?: unknown; posts?: unknown } | null;
  if (!res.ok || !d?.ok) {
    throw new Error(typeof d?.error === "string" ? d.error : "Live AI failed. Please try again, or use Demo Mode.");
  }
  if (typeof d.model !== "string" || !d.posts || typeof d.posts !== "object") {
    throw new Error("The server sent an unexpected response. Please try again, or use Demo Mode.");
  }
  return { model: d.model, posts: d.posts as AiResult["posts"] };
}
