"use client";

import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import CommandPalette from "./CommandPalette";
import PublishDialog from "./PublishDialog";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Icon } from "./icons";

const COLLAPSE_KEY = "signalpost:nav-collapsed";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { toast } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // A remembered sidebar state is a per-viewer convenience; the app works without it.
  useEffect(() => {
    queueMicrotask(() => {
      try {
        setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
      } catch {
        /* storage unavailable */
      }
    });
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      try {
        window.localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {
        /* storage unavailable */
      }
      return !c;
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (e.key === "Escape") {
        setNavOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative min-h-dvh">
      <a
        href="#main"
        className="sr-only z-[80] rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <Topbar navOpen={navOpen} onOpenNav={() => setNavOpen(true)} onOpenPalette={() => setPaletteOpen(true)} />

      <div className="mx-auto flex w-full max-w-[1600px] gap-4 px-3 pb-10 pt-4">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          mobileOpen={navOpen}
          onClose={() => setNavOpen(false)}
        />
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
          {children}
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <PublishDialog />

      {/* Persistent live region so screen readers announce each message. */}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex justify-center px-3">
        {toast && (
          <div
            key={toast.id}
            className="glass anim-toast flex max-w-md items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-slate-100"
          >
            <Icon name="check" className="h-4 w-4 text-emerald-300" />
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
