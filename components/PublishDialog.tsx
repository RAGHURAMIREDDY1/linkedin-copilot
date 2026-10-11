"use client";

import { useEffect, useId, useRef, useState } from "react";
import { POST_LABELS } from "@/lib/types";
import type { LibraryItem } from "@/lib/types";
import { formatPost } from "@/lib/generators";
import { useApp } from "@/lib/store";
import { Icon } from "./icons";
import { copyToClipboard } from "./PostCard";
import { POST_THEME } from "./postTheme";
import { btnPrimary, btnSecondary, btnSuccess, chip } from "./ui";

// Opens LinkedIn's post composer. We only open it: nothing is published until the user posts there.
const LINKEDIN_COMPOSE_URL = "https://www.linkedin.com/feed/?shareActive=true";

/**
 * Manual publishing flow. SignalPost has no LinkedIn connection, so "publish" means: copy the text,
 * post it on LinkedIn yourself, then confirm here. Copying and opening LinkedIn never change the
 * post's status; only the explicit "I have published this" button does.
 */
export default function PublishDialog() {
  const { publishId, library } = useApp();
  const item = publishId ? library.find((i) => i.id === publishId) : undefined;
  return item && item.status === "draft" ? <Dialog key={item.id} item={item} /> : null;
}

function Dialog({ item }: { item: LibraryItem }) {
  const { closePublish, confirmPublished } = useApp();
  const [copied, setCopied] = useState<"idle" | "ok" | "error">("idle");
  const [opened, setOpened] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const text = formatPost(item.post);
  const theme = POST_THEME[item.post.type];

  // Move focus into the dialog, and give it back to the Publish button afterwards.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>("button, a[href]")?.focus();
    return () => opener?.focus?.();
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      closePublish();
    } else if (e.key === "Tab") {
      const nodes = panel.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]");
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  async function copy() {
    setCopied((await copyToClipboard(text)) ? "ok" : "error");
  }

  function confirm() {
    if (confirming) return; // ignore a double-click; the store also refuses a second record
    setConfirming(true);
    confirmPublished(item.id);
  }

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-3" onKeyDown={onKeyDown}>
      <div className="anim-fade absolute inset-0 bg-ink-950/75 backdrop-blur-sm" onClick={closePublish} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="glass anim-pop relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-y-auto rounded-2xl p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-violet-300">
            <Icon name="send" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-semibold text-white">
              Publish to LinkedIn
            </h2>
            <p className="mt-0.5 text-sm text-slate-300">You post it yourself, then confirm here.</p>
          </div>
          <button
            type="button"
            onClick={closePublish}
            aria-label="Close without publishing"
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70"
          >
            <Icon name="x" />
          </button>
        </div>

        <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300/25 bg-amber-300/[0.07] px-3.5 py-2.5 text-sm leading-relaxed text-amber-100">
          <Icon name="info" className="mt-0.5 h-4 w-4 text-amber-300" />
          <span>
            <strong className="font-semibold">SignalPost isn&apos;t connected to LinkedIn</strong> and can&apos;t post for you.
            Copying the text or opening LinkedIn does not publish anything.
          </span>
        </p>

        <div className="mt-4 rounded-xl border border-white/[0.06] bg-ink-950/50 p-4">
          <span className={`${chip} ${theme.chip}`}>{POST_LABELS[item.post.type]}</span>
          <p className="mt-3 max-h-44 overflow-y-auto whitespace-pre-line break-words text-sm leading-6 text-slate-200">{text}</p>
        </div>

        <ol className="mt-5 space-y-4 text-sm text-slate-200">
          <li className="flex flex-wrap items-center gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">1</span>
            <span className="min-w-0 flex-1">Copy the final text</span>
            <button type="button" onClick={copy} className={copied === "ok" ? btnSuccess : btnSecondary}>
              <Icon name={copied === "ok" ? "check" : "copy"} className="h-4 w-4" />
              {copied === "ok" ? "Copied" : "Copy post text"}
            </button>
          </li>
          {copied === "error" && (
            <li role="alert" className="-mt-2 ml-9 text-sm text-red-300">
              Couldn&apos;t copy automatically. Select the text above and copy it yourself.
            </li>
          )}
          <li className="flex flex-wrap items-center gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">2</span>
            <span className="min-w-0 flex-1">Paste and post it on LinkedIn</span>
            <a
              href={LINKEDIN_COMPOSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpened(true)}
              className={btnSecondary}
            >
              Open LinkedIn
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
          {opened && (
            <li className="-mt-2 ml-9 text-sm text-slate-300">
              LinkedIn opened in a new tab. Nothing is published until you post it there yourself.
            </li>
          )}
          <li className="flex flex-wrap items-center gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">3</span>
            <span className="min-w-0 flex-1">
              Come back and confirm
              <span className="block text-xs text-slate-400">Only after your post is live on LinkedIn.</span>
            </span>
            <button type="button" onClick={confirm} disabled={confirming} className={btnPrimary}>
              <Icon name="check" className="h-4 w-4" />
              I have published this
            </button>
          </li>
        </ol>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <p className="max-w-xs text-xs leading-relaxed text-slate-400">
            This will be recorded as confirmed by you. LinkedIn hasn&apos;t verified it.
          </p>
          <button type="button" onClick={closePublish} className={btnSecondary}>
            Not yet
          </button>
        </div>
      </div>
    </div>
  );
}
