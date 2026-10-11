"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { DemoNote, PageHeader, PageSkeleton } from "../blocks";
import { Icon, type IconName } from "../icons";
import ProfileForm from "../ProfileForm";
import { btnDanger, btnSecondary, chip, cardClass } from "../ui";

const CONNECTIONS: { icon: IconName; name: string; detail: string }[] = [
  { icon: "user", name: "LinkedIn account", detail: "Needed to publish posts and read engagement." },
  { icon: "sparkles", name: "AI writing model", detail: "Drafts currently come from built-in templates." },
  { icon: "trending", name: "Live trend data", detail: "Trending topics currently use fixed sample data." },
];

export default function SettingsView() {
  const app = useApp();
  const [confirming, setConfirming] = useState(false);
  if (!app.loaded) return <PageSkeleton rows={2} />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="Profile, connections and data" />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <ProfileForm profile={app.profile} onChange={app.setProfile} columns="grid" />

        <div className="space-y-6">
          <section className={cardClass} aria-labelledby="conn-heading">
            <h2 id="conn-heading" className="text-lg font-semibold text-white">
              Connections
            </h2>
            <DemoNote className="mt-3">
              You&apos;re in <strong className="font-semibold">Demo Mode</strong>. Nothing below is connected, and nothing
              leaves your browser.
            </DemoNote>
            <ul className="mt-4 divide-y divide-white/[0.06]">
              {CONNECTIONS.map((c) => (
                <li key={c.name} className="flex flex-wrap items-center gap-3 py-3.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
                    <Icon name={c.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-100">{c.name}</span>
                    <span className="block text-xs text-slate-400">{c.detail}</span>
                  </span>
                  <span className={`${chip} border-white/10 bg-white/5 text-slate-300`}>Not connected</span>
                  <button type="button" disabled className={btnSecondary} aria-label={`Connect ${c.name} (not available in Demo Mode)`}>
                    Connect
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className={cardClass} aria-labelledby="data-heading">
            <h2 id="data-heading" className="text-lg font-semibold text-white">
              Your data
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
              Profile, notes, drafts and activity are stored only in this browser. Clearing them also resets the demo.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {confirming ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      app.clearAll();
                      setConfirming(false);
                    }}
                    className={btnDanger}
                  >
                    Yes, clear everything
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} className={btnSecondary}>
                    Keep my data
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirming(true)} className={btnDanger}>
                  <Icon name="trash" className="h-4 w-4" />
                  Clear all local data
                </button>
              )}
            </div>
          </section>

          <section className={cardClass} aria-labelledby="motion-heading">
            <h2 id="motion-heading" className="text-lg font-semibold text-white">
              Motion
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
              Animations follow your system&apos;s &ldquo;reduce motion&rdquo; setting. When it&apos;s on, SignalPost
              drops movement and keeps only simple state changes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
