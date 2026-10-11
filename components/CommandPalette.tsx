"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseNotes } from "@/lib/generators";
import { useApp } from "@/lib/store";
import { Icon, type IconName } from "./icons";
import { NAV } from "./nav";

interface Command {
  id: string;
  label: string;
  hint: string;
  icon: IconName;
  group: "Go to" | "Actions";
  run: () => void;
}

/** Quick navigation / actions dialog (Ctrl or ⌘ + K). Mounted only while open so its state resets. */
export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  return open ? <Palette onClose={onClose} /> : null;
}

function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const app = useApp();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the field on open and give focus back to whatever opened the dialog on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  const hasNotes = parseNotes(app.notes).length > 0;

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = NAV.map((n) => ({
      id: `nav-${n.href}`,
      label: n.label,
      hint: n.hint,
      icon: n.icon,
      group: "Go to",
      run: () => router.push(n.href),
    }));
    list.push(
      {
        id: "example",
        label: "Try an example update",
        hint: "Fill today's notes with example text",
        icon: "edit",
        group: "Actions",
        run: () => {
          app.fillExample();
          router.push("/create");
        },
      },
      {
        id: "generate",
        label: "Generate today's 3 posts",
        hint: hasNotes ? "Build three drafts from your notes" : "Add notes first, then generate",
        icon: "sparkles",
        group: "Actions",
        run: () => {
          app.generate();
          router.push("/create");
        },
      },
    );
    if (app.posts) {
      list.push({
        id: "save-all",
        label: "Save all three drafts",
        hint: "Add the current drafts to My Drafts",
        icon: "bookmark",
        group: "Actions",
        run: app.saveAllDrafts,
      });
    }
    return list;
  }, [router, app, hasNotes]);

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return commands;
    const matches = commands.filter((c) => {
      const hay = `${c.label} ${c.hint}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
    // Title matches first, description-only matches after (stable, so the original order is kept within each).
    const inTitle = (c: Command) => words.every((w) => c.label.toLowerCase().includes(w));
    return [...matches.filter(inTitle), ...matches.filter((c) => !inTitle(c))];
  }, [commands, query]);

  const current = Math.min(active, Math.max(results.length - 1, 0));

  useEffect(() => {
    document.getElementById(`cmd-${results[current]?.id}`)?.scrollIntoView({ block: "nearest" });
  }, [current, results]);

  function run(cmd: Command | undefined) {
    if (!cmd) return;
    onClose();
    cmd.run();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((current + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((current - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[current]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      e.preventDefault(); // keep focus inside the dialog
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-3 pt-[12vh]">
      <div className="anim-fade absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search or jump to"
        className="glass anim-pop relative w-full max-w-xl overflow-hidden rounded-2xl"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <Icon name="search" className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-list"
            aria-activedescendant={results[current] ? `cmd-${results[current].id}` : undefined}
            aria-label="Search pages and actions"
            placeholder="Search pages and actions…"
            className="h-14 w-full bg-transparent text-base text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-slate-400">Esc</kbd>
        </div>
        <ul id="cmd-list" role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-slate-400">Nothing matches &ldquo;{query}&rdquo;.</li>}
          {results.map((c, i) => {
            const header = i === 0 || results[i - 1].group !== c.group;
            return (
              <li key={c.id} role="presentation">
                {header && (
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{c.group}</p>
                )}
                <div
                  id={`cmd-${c.id}`}
                  role="option"
                  aria-selected={i === current}
                  onMouseMove={() => setActive(i)}
                  onClick={() => run(c)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${
                    i === current ? "bg-white/10" : ""
                  }`}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-violet-300">
                    <Icon name={c.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-100">{c.label}</span>
                    <span className="block truncate text-xs text-slate-400">{c.hint}</span>
                  </span>
                  {i === current && <span className="text-xs text-slate-400">Enter</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
