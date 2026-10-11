"use client";

import { useEffect, useRef, useState } from "react";
import type { Post } from "@/lib/types";
import { POST_LABELS } from "@/lib/types";
import { formatPost } from "@/lib/generators";
import { formatDateTime } from "@/lib/insights";
import { Icon } from "./icons";
import { POST_THEME } from "./postTheme";
import { btnPrimary, btnSecondary, btnSuccess, chip, fieldClass } from "./ui";

type Status = "idle" | "copied" | "copy-error" | "saved";

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers/contexts where the async clipboard API is unavailable.
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function PostCard({
  post,
  onSave,
  onRegenerate,
  onSaveDraft,
  draftSaved = false,
  onPublish,
  savedAt,
  publishedAt,
  extra,
  regenerating = false,
}: {
  post: Post;
  onSave: (post: Post) => void;
  /** Omit for saved records: regenerating only makes sense for the day's current drafts. */
  onRegenerate?: () => void;
  onSaveDraft?: () => void;
  draftSaved?: boolean;
  /** Opens the publish dialog. Never publishes by itself. */
  onPublish?: () => void;
  savedAt?: number;
  /** Set only once the user has confirmed they published it; locks editing. */
  publishedAt?: number;
  /** Extra footer actions (e.g. delete) supplied by the saved-posts views. */
  extra?: React.ReactNode;
  /** True while live AI is redrafting this post. */
  regenerating?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [hook, setHook] = useState(post.hook);
  const [body, setBody] = useState(post.body);
  const [tags, setTags] = useState(post.hashtags.join(" "));
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function flash(next: Status) {
    setStatus(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2500);
  }

  function startEdit() {
    setHook(post.hook);
    setBody(post.body);
    setTags(post.hashtags.join(" "));
    setStatus("idle");
    setEditing(true);
  }

  function save() {
    onSave({
      ...post,
      hook: hook.trim(),
      body: body.trim(),
      hashtags: tags.split(/\s+/).filter(Boolean),
      edited: true,
    });
    setEditing(false);
    flash("saved");
  }

  async function copy() {
    const ok = await copyToClipboard(formatPost(post));
    flash(ok ? "copied" : "copy-error");
  }

  function regenerate() {
    setStatus("idle");
    onRegenerate?.();
  }

  const published = publishedAt !== undefined;

  const theme = POST_THEME[post.type];
  const isTrending = post.type === "trending";

  return (
    <article
      className={`surface relative flex flex-col overflow-hidden p-4 transition-all duration-300 hover:border-white/15 sm:p-6 ${
        editing ? theme.editing : ""
      }`}
    >
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${theme.bar}`} />
      <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${theme.wash}`} />

      <header className="relative flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={`grid h-9 w-9 place-items-center rounded-xl border ${theme.iconTile}`}>
          <Icon name={theme.icon} className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <h3 className={`text-sm font-bold uppercase tracking-[0.12em] ${theme.text}`}>{POST_LABELS[post.type]}</h3>
          <p className="text-xs text-slate-400">{theme.kicker}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
          {published ? (
            <span className={`${chip} border-emerald-400/30 bg-emerald-400/10 text-emerald-200`}>
              <Icon name="check" className="h-3 w-3" />
              Published, confirmed by you
            </span>
          ) : (
            <span className={`${chip} border-white/10 bg-white/5 text-slate-300`}>{draftSaved ? "Saved draft" : "Draft"}</span>
          )}
          {post.source === "ai" ? (
            <span className={`${chip} border-violet-300/30 bg-violet-400/10 text-violet-200`}>
              <Icon name="sparkles" className="h-3 w-3" />
              AI-generated{post.model ? ` · ${post.model}` : ""}
            </span>
          ) : (
            <span className={`${chip} border-white/10 bg-white/5 text-slate-300`}>Demo template</span>
          )}
          {isTrending && (
            <span className={`${chip} border-amber-300/30 bg-amber-300/10 text-amber-200`}>
              Sample trend data, not live
            </span>
          )}
          {editing ? (
            <span className={`${chip} ${theme.chip}`}>Editing</span>
          ) : (
            post.edited && <span className={`${chip} border-white/10 bg-white/10 text-slate-200`}>Edited</span>
          )}
        </div>
      </header>

      {(savedAt !== undefined || published) && (
        <p className="relative mt-3 text-xs text-slate-400">
          {savedAt !== undefined && <>Saved {formatDateTime(savedAt)}</>}
          {published && (
            <>
              {savedAt !== undefined && " · "}Published {formatDateTime(publishedAt)}. Recorded because you confirmed it; not verified by LinkedIn.
            </>
          )}
        </p>
      )}

      {editing ? (
        <div className="relative mt-4 space-y-4">
          <label className="block text-sm font-medium text-slate-200">
            Opening hook
            <textarea rows={2} value={hook} onChange={(e) => setHook(e.target.value)} className={fieldClass} />
          </label>
          <label className="block text-sm font-medium text-slate-200">
            Post body
            <textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} className={fieldClass} />
          </label>
          <label className="block text-sm font-medium text-slate-200">
            Hashtags (space-separated)
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={fieldClass} />
          </label>
          <p className="text-sm text-slate-300">Your changes only apply when you press Save.</p>
        </div>
      ) : (
        <div className="relative mt-4 flex-1 rounded-xl border border-white/[0.06] bg-ink-950/50 px-4 py-4 sm:px-5">
          <div className="max-w-prose">
            <p className="break-words text-lg font-semibold leading-snug text-white">{post.hook}</p>
            <p className="mt-3 whitespace-pre-line break-words text-[15px] leading-6 text-slate-300">{post.body}</p>
            {post.hashtags.length > 0 && (
              <p className={`mt-4 break-words text-sm font-medium ${theme.text}`}>{post.hashtags.join(" ")}</p>
            )}
          </div>
        </div>
      )}

      <footer className="relative mt-5 flex flex-wrap items-center gap-2">
        {editing ? (
          <>
            <button type="button" onClick={save} className={`${btnPrimary} flex-1 sm:flex-none`}>
              <Icon name="check" className="h-4 w-4" />
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className={`${btnSecondary} flex-1 sm:flex-none`}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={copy}
              className={`${status === "copied" ? btnSuccess : btnPrimary} min-w-32 flex-1 sm:flex-none`}
            >
              <Icon name={status === "copied" ? "check" : "copy"} className="h-4 w-4" />
              {status === "copied" ? "Copied" : "Copy Post"}
            </button>
            {!published && (
              <button type="button" onClick={startEdit} className={`${btnSecondary} flex-1 sm:flex-none`}>
                <Icon name="edit" className="h-4 w-4" />
                Edit
              </button>
            )}
            {onRegenerate && (
              <button
                type="button"
                onClick={regenerate}
                disabled={regenerating}
                aria-busy={regenerating}
                className={`${btnSecondary} flex-1 sm:flex-none`}
              >
                <Icon name="refresh" className="h-4 w-4" />
                {regenerating ? "Regenerating…" : "Regenerate"}
              </button>
            )}
            {onSaveDraft && !published && (
              <button
                type="button"
                onClick={onSaveDraft}
                aria-pressed={draftSaved}
                className={`${draftSaved ? btnSuccess : btnSecondary} flex-1 sm:flex-none`}
              >
                <Icon name={draftSaved ? "check" : "bookmark"} className="h-4 w-4" />
                {draftSaved ? "Saved to drafts" : "Save draft"}
              </button>
            )}
            {onPublish && !published && (
              <button type="button" onClick={onPublish} className={`${btnSecondary} flex-1 sm:flex-none`}>
                <Icon name="send" className="h-4 w-4" />
                Publish
              </button>
            )}
            {extra}
          </>
        )}
        <span role="status" aria-live="polite" className="w-full text-sm font-medium sm:ml-1 sm:w-auto">
          {status === "copied" && <span className="sr-only">Copied to clipboard!</span>}
          {status === "saved" && <span className="text-emerald-300">✓ Changes saved</span>}
          {status === "copy-error" && (
            <span className="text-red-300">Couldn&apos;t copy. Select the text and copy it manually.</span>
          )}
        </span>
      </footer>
    </article>
  );
}
