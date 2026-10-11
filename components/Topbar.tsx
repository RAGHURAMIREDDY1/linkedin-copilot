"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { POST_TYPES } from "@/lib/types";
import { formatDate, initialsOf } from "@/lib/insights";
import { Icon, Logo } from "./icons";
import { focusRing } from "./ui";

/** Close a popover on outside click or Escape. */
function useDismiss(ref: React.RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open, onClose]);
}

function NotificationsMenu() {
  const { library, posts, isSaved } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));

  const drafts = library.filter((i) => i.status === "draft").length;
  const unsaved = !!posts && POST_TYPES.some((t) => !isSaved(posts[t]));

  // Honest, local-only notices. Nothing here comes from LinkedIn.
  const items: { title: string; body: string; href?: string }[] = [
    { title: "You're in Demo Mode", body: "Drafts come from local templates. Nothing is sent to LinkedIn." },
    { title: "Trending topics are sample data", body: "Live trend detection isn't connected in this demo." },
  ];
  if (unsaved) {
    items.unshift({ title: "Your latest drafts aren't saved yet", body: "Save them to My Drafts to keep them.", href: "/create" });
  }
  if (drafts > 0) {
    items.unshift({
      title: `${drafts} draft${drafts === 1 ? "" : "s"} in My Drafts`,
      body: "Copy one into LinkedIn when you're ready.",
      href: "/drafts",
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
        className={`grid h-9 w-9 place-items-center rounded-xl text-slate-300 transition-colors hover:bg-white/10 hover:text-white sm:h-10 sm:w-10 ${focusRing}`}
      >
        <Icon name="bell" />
      </button>
      {open && (
        <div className="glass anim-pop absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl p-2" role="menu">
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Notifications</p>
          <ul className="space-y-1">
            {items.map((n) => {
              const inner = (
                <>
                  <p className="text-sm font-semibold text-slate-100">{n.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-300">{n.body}</p>
                </>
              );
              return (
                <li key={n.title} role="none">
                  {n.href ? (
                    <Link
                      href={n.href}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className={`block rounded-xl px-3 py-2.5 transition-colors hover:bg-white/10 ${focusRing}`}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div role="menuitem" className="rounded-xl px-3 py-2.5">
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Topbar({
  onOpenNav,
  onOpenPalette,
  navOpen,
}: {
  onOpenNav: () => void;
  onOpenPalette: () => void;
  navOpen: boolean;
}) {
  const { now, profile } = useApp();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setIsMac(/mac|iphone|ipad/i.test(navigator.platform)));
  }, []);

  return (
    <header className="glass sticky top-3 z-40 mx-3 mt-3 flex h-14 items-center gap-1 rounded-2xl px-2 sm:gap-3 sm:px-3">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open menu"
        aria-expanded={navOpen}
        aria-controls="app-sidebar"
        className={`grid h-9 w-9 place-items-center rounded-xl text-slate-200 hover:bg-white/10 sm:h-10 sm:w-10 lg:hidden ${focusRing}`}
      >
        <Icon name="menu" />
      </button>

      <Link href="/" className={`flex items-center gap-2.5 rounded-xl pr-1 ${focusRing}`} aria-label="SignalPost home">
        <Logo className="h-8 w-8" />
        <span className="text-[15px] font-semibold tracking-tight text-white max-[359px]:hidden">SignalPost</span>
      </Link>

      <div className="ml-1 hidden items-center gap-2 text-sm text-slate-300 md:flex">
        <span aria-hidden="true" className="h-5 w-px bg-white/10" />
        <Icon name="calendar" className="h-4 w-4 text-slate-400" />
        {now ? (
          <time dateTime={new Date(now).toISOString().slice(0, 10)}>
            {formatDate(now, { weekday: "short", month: "short", day: "numeric" })}
          </time>
        ) : (
          <span className="skeleton h-4 w-24" />
        )}
      </div>

      <div className="flex-1" />

      <button
        type="button"
        onClick={onOpenPalette}
        aria-label="Search or jump to…"
        className={`flex h-9 w-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm sm:h-10 sm:w-auto sm:px-2.5 text-slate-300 transition-colors hover:border-white/20 hover:bg-white/10 md:w-72 md:justify-start md:px-3 ${focusRing}`}
      >
        <Icon name="search" className="h-[18px] w-[18px] text-slate-400" />
        <span className="hidden flex-1 text-left text-slate-400 md:inline">Search or jump to…</span>
        <kbd className="hidden rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-slate-300 md:inline">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      <div
        role="group"
        aria-label="Mode"
        className="flex shrink-0 items-center whitespace-nowrap rounded-full border border-white/10 bg-ink-950/50 p-0.5 text-[11px] font-bold uppercase tracking-wide"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-2 py-1 text-amber-200 sm:px-2.5">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span aria-hidden="true" className="sm:hidden">Demo</span>
          <span className="sr-only sm:not-sr-only">Demo Mode</span>
        </span>
        <span
          className="hidden items-center gap-1 px-2.5 py-1 text-slate-400 lg:inline-flex"
          title="Live mode needs a LinkedIn and AI connection, which this demo doesn't have."
        >
          <Icon name="lock" className="h-3 w-3" />
          Live
          <span className="sr-only">(not available in this demo)</span>
        </span>
      </div>

      <NotificationsMenu />

      <Link
        href="/settings"
        aria-label="Profile and settings"
        title="Profile and settings"
        className={`hidden h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600 text-xs font-bold text-white ring-2 ring-white/15 transition-transform hover:scale-105 sm:grid ${focusRing}`}
      >
        {initialsOf(profile.role)}
      </Link>
    </header>
  );
}
