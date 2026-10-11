"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import { Icon } from "./icons";
import { NAV, isActive } from "./nav";
import { focusRing } from "./ui";

export default function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onClose,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { library, loaded } = useApp();
  const counts: Record<string, number> = loaded
    ? {
        "/drafts": library.filter((i) => i.status === "draft").length,
        "/published": library.filter((i) => i.status === "published").length,
      }
    : {};
  // Labels hide only on desktop when collapsed; the mobile drawer is always full width.
  const hideLabel = collapsed ? "lg:hidden" : "";

  return (
    <>
      {mobileOpen && (
        <div
          className="anim-fade fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        id="app-sidebar"
        aria-label="Primary"
        className={`glass fixed bottom-3 left-3 top-3 z-50 flex w-72 max-w-[calc(100vw-1.5rem)] flex-col rounded-2xl p-3 transition-[transform,width,visibility] duration-300 ease-out lg:visible lg:sticky lg:top-20 lg:z-30 lg:h-[calc(100dvh-6.5rem)] lg:translate-x-0 lg:self-start ${
          collapsed ? "lg:w-[4.75rem]" : "lg:w-64"
        } ${mobileOpen ? "translate-x-0" : "invisible -translate-x-[120%]"}`}
      >
        <div className="mb-2 flex items-center justify-between lg:hidden">
          <span className="px-2 text-sm font-semibold text-slate-100">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={`grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10 ${focusRing}`}
          >
            <Icon name="x" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {NAV.map(({ href, label, icon }) => {
            const active = isActive(pathname, href);
            const count = counts[href];
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${focusRing} ${
                  active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                } ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-violet-400 to-blue-500"
                  />
                )}
                <Icon
                  name={icon}
                  className={`h-5 w-5 transition-colors ${active ? "text-violet-300" : "text-slate-400 group-hover:text-slate-200"}`}
                />
                <span className={`flex-1 truncate ${hideLabel}`}>{label}</span>
                {count ? (
                  <span
                    className={`rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-semibold text-violet-200 ${hideLabel}`}
                    aria-label={`${count} items`}
                  >
                    {count}
                  </span>
                ) : null}
                {count && collapsed ? (
                  <span
                    aria-hidden="true"
                    className="absolute right-2 top-2 hidden h-2 w-2 rounded-full bg-violet-400 lg:block"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-3 space-y-2">
          <div
            className={`rounded-xl border border-amber-300/20 bg-amber-300/[0.07] p-3 ${collapsed ? "lg:flex lg:justify-center lg:p-2" : ""}`}
            title={collapsed ? "Demo Mode: local templates only" : undefined}
          >
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-200">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-400" />
              <span className={hideLabel}>Demo Mode</span>
            </p>
            <p className={`mt-1.5 text-xs leading-relaxed text-slate-300 ${hideLabel}`}>
              Local templates only. No AI, live trends or LinkedIn connection.
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`hidden min-h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200 lg:flex ${focusRing} ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <Icon name={collapsed ? "chevronRight" : "chevronLeft"} className="h-5 w-5" />
            <span className={hideLabel}>Collapse</span>
          </button>
        </div>
      </aside>
    </>
  );
}
