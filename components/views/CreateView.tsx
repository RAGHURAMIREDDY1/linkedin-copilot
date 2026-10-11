"use client";

import { useEffect, useRef } from "react";
import { POST_LABELS, POST_TYPES } from "@/lib/types";
import { useApp } from "@/lib/store";
import { DemoNote, PageHeader, PageSkeleton, PostSkeletons } from "../blocks";
import { Icon } from "../icons";
import PostCard from "../PostCard";
import ProfileForm from "../ProfileForm";
import WorkUpdateForm from "../WorkUpdateForm";
import { POST_THEME } from "../postTheme";
import { btnSecondary } from "../ui";

const EMPTY_HINTS = {
  domain: "A technical or industry insight built from your profile and interests.",
  trending: "A take on a sample topic. Demo Mode topics are not live news.",
  work: "Built from the notes you enter above: what you did and learned.",
} as const;

export default function CreateView() {
  const app = useApp();
  const resultsRef = useRef<HTMLElement>(null);
  const seenGeneration = useRef(app.generation);

  // On narrow screens the drafts land below the fold, so bring them into view after generating.
  useEffect(() => {
    if (app.generation === seenGeneration.current) return;
    seenGeneration.current = app.generation;
    const el = resultsRef.current;
    if (!app.posts || !el || el.getBoundingClientRect().top < window.innerHeight * 0.6) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [app.generation, app.posts]);

  if (!app.loaded) return <PageSkeleton />;
  const { posts } = app;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Create posts"
        title="Today's three posts"
        description="Add what you worked on, check your profile, and get three editable drafts in one click."
      />
      <DemoNote>
        <strong className="font-semibold">Demo Mode:</strong> drafts are built from local templates in your browser. No AI
        model, no live trend data, and no LinkedIn connection. Nothing is posted for you.
      </DemoNote>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-x-8">
        <div className="xl:col-start-2 xl:row-start-1">
          <WorkUpdateForm
            notes={app.notes}
            onChange={app.setNotes}
            onGenerate={app.generate}
            error={app.error}
            loading={app.generating}
          />
        </div>
        <div className="xl:sticky xl:top-20 xl:col-start-1 xl:row-span-2 xl:row-start-1 xl:self-start">
          <ProfileForm profile={app.profile} onChange={app.setProfile} />
        </div>
        <section
          ref={resultsRef}
          aria-labelledby="drafts-heading"
          aria-busy={app.generating}
          className="scroll-mt-24 xl:col-start-2 xl:row-start-2"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="drafts-heading" className="text-xl font-semibold text-white">
                Your drafts
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                {posts && !app.generating
                  ? "Edit anything, then press Publish to post it on LinkedIn yourself. SignalPost never posts for you."
                  : "Three drafts will appear here once you generate them."}
              </p>
            </div>
            {posts && !app.generating && (
              <button type="button" onClick={app.saveAllDrafts} className={btnSecondary}>
                <Icon name="bookmark" className="h-4 w-4" />
                Save all to drafts
              </button>
            )}
          </div>

          {app.generating ? (
            <div className="mt-5">
              <PostSkeletons />
            </div>
          ) : posts ? (
            <div className="stagger mt-5 space-y-6">
              {POST_TYPES.map((type, i) => (
                <div key={`${type}-${app.generation}`} style={{ ["--i" as string]: i }}>
                  <PostCard
                    post={posts[type]}
                    onSave={app.savePost}
                    onRegenerate={() => app.regenerate(type)}
                    onSaveDraft={() => app.saveDraft(type)}
                    draftSaved={app.isSaved(posts[type])}
                    onPublish={() => app.publishCurrent(type)}
                    savedAt={app.itemFor(posts[type])?.createdAt}
                    publishedAt={
                      app.itemFor(posts[type])?.status === "published" ? app.itemFor(posts[type])?.publishedAt : undefined
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4 sm:p-6">
              <p className="text-sm font-medium text-slate-100">
                Add a few notes (or try the example update), then click &ldquo;Generate Today&rsquo;s 3 Posts&rdquo;.
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {POST_TYPES.map((type) => {
                  const theme = POST_THEME[type];
                  return (
                    <li key={type} className="rounded-xl border border-white/10 bg-ink-800/60 p-3.5">
                      <span className={`grid h-8 w-8 place-items-center rounded-lg border ${theme.iconTile}`}>
                        <Icon name={theme.icon} className="h-4 w-4" />
                      </span>
                      <p className="mt-2.5 text-sm font-semibold text-slate-100">{POST_LABELS[type]}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300">{EMPTY_HINTS[type]}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
