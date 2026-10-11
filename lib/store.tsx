"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ActivityEvent, ActivityKind, LibraryItem, Post, Posts, PostType, Profile } from "./types";
import { POST_TYPES } from "./types";
import { DEFAULT_PROFILE, EXAMPLE_NOTES } from "./defaults";
import { generateAllPosts, generatePost, parseNotes, SAMPLE_TRENDS, VARIANT_COUNT } from "./generators";
import { fetchAiStatus, requestDrafts, type AiStatus } from "./ai/client";
import { loadState, saveState } from "./storage";

/** Short pause so the loading state is visible. Generation itself is instant and local. */
const GENERATE_MS = 650;
const MAX_ACTIVITY = 500;

interface Toast {
  id: number;
  message: string;
}

interface AppContextValue {
  loaded: boolean;
  /** Epoch ms captured after mount (0 before). Used for dates so server and client markup match. */
  now: number;
  profile: Profile;
  setProfile: (p: Profile) => void;
  notes: string;
  setNotes: (n: string) => void;
  fillExample: () => void;
  posts: Posts | null;
  generation: number;
  generating: boolean;
  error: string;
  /** True while the in-flight generation is a live Claude request (as opposed to Demo Mode templates). */
  generatingLive: boolean;
  /**
   * "Generate Today's 3 Posts": drafts all three posts with Claude via the server. Returns false (and sets `error`)
   * when the notes are empty; otherwise the request runs in the background and failures land in `aiError`.
   */
  generate: () => boolean;
  /** Explicit Demo Mode: local templates, no AI. Never used as a silent fallback for a failed live request. */
  generateDemo: () => boolean;
  /** Whether the server has live AI configured (null until checked). Demo Mode never depends on it. */
  ai: AiStatus | null;
  /** Failure message from the last live AI attempt. Existing drafts are left untouched. */
  aiError: string;
  /** The post type currently being redrafted by live AI, if any. */
  regeneratingType: PostType | null;
  regenerate: (type: PostType) => void;
  savePost: (post: Post) => void;
  trendIndex: number;
  selectTrend: (index: number) => void;
  library: LibraryItem[];
  activity: ActivityEvent[];
  isSaved: (post: Post) => boolean;
  /** The saved record a current post is linked to, if any. */
  itemFor: (post: Post) => LibraryItem | undefined;
  saveDraft: (type: PostType) => void;
  saveAllDrafts: () => void;
  /** Id of the record whose publish dialog is open. Opening it never changes the post's status. */
  publishId: string | null;
  /** Open the publish dialog for a current post (saving it to My Drafts first if needed). */
  publishCurrent: (type: PostType) => void;
  openPublish: (id: string) => void;
  closePublish: () => void;
  /** The only way a post becomes Published: the user explicitly confirms they posted it themselves. */
  confirmPublished: (id: string) => void;
  moveToDrafts: (id: string) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  toast: Toast | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function sameContent(a: Post, b: Post): boolean {
  return a.type === b.type && a.hook === b.hook && a.body === b.body;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [notes, setNotesState] = useState("");
  const [posts, setPosts] = useState<Posts | null>(null);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [error, setError] = useState("");
  const [ai, setAi] = useState<AiStatus | null>(null);
  const [aiError, setAiError] = useState("");
  const [regeneratingType, setRegeneratingType] = useState<PostType | null>(null);
  // Bumped on every full generation so any open edit draft in a card is discarded.
  const [generation, setGeneration] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generatingLive, setGeneratingLive] = useState(false);
  const [trendIndex, setTrendIndex] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const [publishId, setPublishId] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  // localStorage only exists in the browser, so load after mount and
  // don't save until loading has finished (avoids overwriting stored data).
  const [loaded, setLoaded] = useState(false);
  const genTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped when a newer action supersedes an in-flight live request, so its late answer is ignored.
  const liveRequest = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mirrors `library` so a rapid double-click on "I have published this" sees the first click's result.
  const libraryRef = useRef<LibraryItem[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      const saved = loadState();
      if (saved) {
        setProfile(saved.profile);
        setNotesState(saved.notes);
        setPosts(saved.posts);
        setLibrary(saved.library);
        setActivity(saved.activity);
        if (saved.posts) setTrendIndex(saved.posts.trending.variant % SAMPLE_TRENDS.length);
      }
      setNow(Date.now());
      setLoaded(true);
    });
    fetchAiStatus().then(setAi);
    return () => {
      if (genTimer.current) clearTimeout(genTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    libraryRef.current = library;
  }, [library]);

  useEffect(() => {
    if (loaded) saveState({ profile, notes, posts, library, activity });
  }, [loaded, profile, notes, posts, library, activity]);

  const notify = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const log = useCallback((kind: ActivityKind, count = 1) => {
    setActivity((a) => [...a, { t: Date.now(), kind, count }].slice(-MAX_ACTIVITY));
  }, []);

  const setNotes = useCallback((value: string) => {
    setNotesState(value);
    setError((e) => (e ? "" : e));
  }, []);

  const fillExample = useCallback(() => setNotes(EXAMPLE_NOTES), [setNotes]);

  const generateDemo = useCallback((): boolean => {
    if (generating || regeneratingType) return true;
    if (parseNotes(notes).length === 0) {
      setError("Add a few notes about your day first, or try the example update.");
      return false;
    }
    setError("");
    setAiError("");
    liveRequest.current++; // a Demo Mode generation supersedes any live redraft still in flight
    setRegeneratingType(null);
    setGeneratingLive(false);
    setGenerating(true);
    if (genTimer.current) clearTimeout(genTimer.current);
    genTimer.current = setTimeout(() => {
      const all = generateAllPosts(profile, notes);
      // Honour the topic picked on the Trending Topics page; otherwise variant 0 as before.
      all.trending = generatePost("trending", profile, notes, trendIndex);
      setPosts(all);
      setGeneration((g) => g + 1);
      setGenerating(false);
      setNow(Date.now());
      log("generated", 3);
    }, GENERATE_MS);
    return true;
  }, [generating, regeneratingType, notes, profile, trendIndex, log]);

  const generate = useCallback((): boolean => {
    if (generating || regeneratingType) return true;
    if (parseNotes(notes).length === 0) {
      setError("Add a few notes about your day first, or try the example update.");
      return false;
    }
    setError("");
    setAiError("");
    if (ai && !ai.configured) {
      // No key on the server: say so instead of quietly producing templates.
      setAiError(
        "Live AI isn't set up: ANTHROPIC_API_KEY is missing on the server. Add it to .env.local (or your host's environment variables) and restart, or use demo templates.",
      );
      return true;
    }
    setGeneratingLive(true);
    setGenerating(true);
    const id = ++liveRequest.current;
    void (async () => {
      try {
        const result = await requestDrafts({ profile, notes, types: POST_TYPES, trendIndex, avoid: {} });
        if (id !== liveRequest.current) return;
        const all = {} as Posts;
        for (const type of POST_TYPES) {
          const draft = result.posts[type];
          if (!draft) throw new Error("The AI's answer was incomplete. Please try again, or use demo templates.");
          // A trending post's variant records its sample topic, which is how the topic is restored on reload.
          all[type] = { type, variant: type === "trending" ? trendIndex : 0, ...draft, edited: false, source: "ai", model: result.model };
        }
        setPosts(all);
        setGeneration((g) => g + 1);
        setNow(Date.now());
        log("generated", 3);
      } catch (e) {
        if (id === liveRequest.current) setAiError(e instanceof Error ? e.message : "Live AI failed. Please try again.");
      } finally {
        if (id === liveRequest.current) {
          setGenerating(false);
          setGeneratingLive(false);
        }
      }
    })();
    return true;
  }, [generating, regeneratingType, ai, notes, profile, trendIndex, log]);

  const regenerateLive = useCallback(
    async (type: PostType, current: Post) => {
      setError("");
      setAiError("");
      setRegeneratingType(type);
      const id = ++liveRequest.current;
      try {
        const result = await requestDrafts({ profile, notes, types: [type], trendIndex, avoid: { [type]: current.hook } });
        if (id !== liveRequest.current) return;
        const draft = result.posts[type];
        if (!draft) throw new Error("The AI's answer was incomplete. Please try again, or use demo templates.");
        const next: Post = {
          type,
          variant: type === "trending" ? trendIndex : 0,
          ...draft,
          edited: false,
          source: "ai",
          model: result.model,
        };
        setPosts((p) => (p ? { ...p, [type]: next } : p));
      } catch (e) {
        if (id === liveRequest.current) setAiError(e instanceof Error ? e.message : "Live AI failed. Please try again.");
      } finally {
        if (id === liveRequest.current) setRegeneratingType(null);
      }
    },
    [profile, notes, trendIndex],
  );

  const regenerate = useCallback(
    (type: PostType) => {
      if (!posts || generating || regeneratingType) return;
      if (type === "work" && parseNotes(notes).length === 0) {
        setError("Your daily notes are empty, so the Work & Learning post can't be regenerated.");
        return;
      }
      // An AI draft is redrafted by the AI (never silently swapped for a template).
      if (posts[type].source === "ai") {
        void regenerateLive(type, posts[type]);
        return;
      }
      setError("");
      const next = generatePost(type, profile, notes, (posts[type].variant + 1) % VARIANT_COUNT);
      setPosts({ ...posts, [type]: next });
      if (type === "trending") setTrendIndex(next.variant % SAMPLE_TRENDS.length);
    },
    [posts, generating, regeneratingType, regenerateLive, notes, profile],
  );

  // An edit applies to the current card and, if the post is saved, to its My Drafts record too.
  // Published records are never edited (the text must stay what the user actually posted).
  const savePost = useCallback(
    (post: Post) => {
      if (posts && posts[post.type].draftId === post.draftId) setPosts({ ...posts, [post.type]: post });
      if (post.draftId) {
        setLibrary((l) => l.map((i) => (i.id === post.draftId && i.status === "draft" ? { ...i, post } : i)));
      }
    },
    [posts],
  );

  const selectTrend = useCallback(
    (index: number) => {
      setTrendIndex(index);
      if (posts?.trending.source === "ai") {
        // Don't overwrite an AI draft with a template; the next AI redraft uses the new topic.
        notify("Topic selected. Press Regenerate on the Trending post to redraft it with AI.");
      } else if (posts) {
        setPosts({ ...posts, trending: generatePost("trending", profile, notes, index) });
        notify("Trending post updated with that topic.");
      } else {
        notify("Topic selected. It will be used when you generate your posts.");
      }
    },
    [posts, profile, notes, notify],
  );

  const itemFor = useCallback(
    (post: Post) => (post.draftId ? library.find((i) => i.id === post.draftId) : undefined),
    [library],
  );
  const isSaved = useCallback((post: Post) => !!itemFor(post), [itemFor]);

  // Save the given current posts as drafts (status stays "draft") and link each card to its record.
  // A post that is already saved, or has identical text to an existing draft, is linked, not duplicated.
  const stageDrafts = useCallback(
    (types: PostType[]) => {
      if (!posts) return null;
      const stamp = Date.now();
      const created: LibraryItem[] = [];
      const ids: Partial<Record<PostType, string>> = {};
      let nextPosts = posts;
      for (const type of types) {
        const post = nextPosts[type];
        const linked = post.draftId ? library.find((i) => i.id === post.draftId) : undefined;
        if (linked) {
          ids[type] = linked.id;
          continue;
        }
        const twin = library.find((i) => i.status === "draft" && sameContent(i.post, post));
        const id = twin ? twin.id : newId() + type;
        ids[type] = id;
        if (!twin) created.push({ id, post: { ...post, draftId: id }, status: "draft", createdAt: stamp });
        nextPosts = { ...nextPosts, [type]: { ...post, draftId: id } };
      }
      if (created.length) {
        setLibrary((l) => [...created, ...l]);
        log("saved", created.length);
        setNow(stamp);
      }
      setPosts(nextPosts);
      return { created: created.length, ids };
    },
    [posts, library, log],
  );

  const saveDraft = useCallback(
    (type: PostType) => {
      const r = stageDrafts([type]);
      if (r) notify(r.created ? "Saved to My Drafts." : "That draft is already in My Drafts.");
    },
    [stageDrafts, notify],
  );

  const saveAllDrafts = useCallback(() => {
    const r = stageDrafts(POST_TYPES);
    if (!r) return;
    notify(r.created ? `Saved ${r.created} draft${r.created === 1 ? "" : "s"} to My Drafts.` : "All three drafts are already saved.");
  }, [stageDrafts, notify]);

  const openPublish = useCallback(
    (id: string) => {
      const item = library.find((i) => i.id === id);
      if (!item) return;
      if (item.status === "published") {
        notify("That post is already in Published.");
        return;
      }
      setPublishId(id);
    },
    [library, notify],
  );

  const publishCurrent = useCallback(
    (type: PostType) => {
      if (!posts) return;
      const existing = itemFor(posts[type]);
      if (existing) return openPublish(existing.id);
      const r = stageDrafts([type]);
      const id = r?.ids[type];
      if (id) setPublishId(id); // saved as a draft only; nothing is published yet
    },
    [posts, itemFor, openPublish, stageDrafts],
  );

  const closePublish = useCallback(() => setPublishId(null), []);

  const confirmPublished = useCallback(
    (id: string) => {
      // Idempotent: a double-click (or a second tab of the dialog) can't create a second record.
      const item = libraryRef.current.find((i) => i.id === id);
      if (!item || item.status === "published") return;
      const stamp = Date.now();
      const next = libraryRef.current.map((i) =>
        i.id === id ? { ...i, status: "published" as const, publishedAt: stamp, publishMethod: "user-confirmed" as const } : i,
      );
      libraryRef.current = next;
      setLibrary(next);
      setPublishId(null);
      log("posted");
      setNow(stamp);
      notify("Moved to Published. Recorded as confirmed by you; LinkedIn hasn't verified it.");
    },
    [notify, log],
  );

  const moveToDrafts = useCallback(
    (id: string) => {
      setLibrary((l) =>
        l.map((i) => (i.id === id ? { ...i, status: "draft", publishedAt: undefined, publishMethod: undefined } : i)),
      );
      notify("Moved back to My Drafts.");
    },
    [notify],
  );

  const removeItem = useCallback(
    (id: string) => {
      setLibrary((l) => l.filter((i) => i.id !== id));
      setPublishId((p) => (p === id ? null : p));
      notify("Deleted.");
    },
    [notify],
  );

  const clearAll = useCallback(() => {
    if (genTimer.current) clearTimeout(genTimer.current);
    liveRequest.current++; // drop any in-flight live request
    setGenerating(false);
    setGeneratingLive(false);
    setRegeneratingType(null);
    setAiError("");
    setProfile(DEFAULT_PROFILE);
    setNotesState("");
    setPosts(null);
    setLibrary([]);
    setPublishId(null);
    setActivity([]);
    setError("");
    setTrendIndex(0);
    setGeneration((g) => g + 1);
    notify("All local data cleared.");
  }, [notify]);

  const value = useMemo<AppContextValue>(
    () => ({
      loaded, now, profile, setProfile, notes, setNotes, fillExample, posts, generation, generating, generatingLive, error,
      generate, generateDemo, ai, aiError, regeneratingType, regenerate, savePost, trendIndex, selectTrend, library, activity, isSaved, itemFor, saveDraft,
      saveAllDrafts, publishId, publishCurrent, openPublish, closePublish, confirmPublished, moveToDrafts,
      removeItem, clearAll, toast,
    }),
    [
      loaded, now, profile, notes, setNotes, fillExample, posts, generation, generating, generatingLive, error, generate, generateDemo,
      ai, aiError, regeneratingType, regenerate, savePost, trendIndex, selectTrend, library, activity,
      isSaved, itemFor, saveDraft, saveAllDrafts, publishId, publishCurrent, openPublish, closePublish, confirmPublished, moveToDrafts, removeItem, clearAll,
      toast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
