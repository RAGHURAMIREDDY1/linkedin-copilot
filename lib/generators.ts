import type { Post, PostType, Posts, Profile } from "./types";
import { POST_TYPES } from "./types";

/**
 * Local, template-based "generators". No network calls, no LLM.
 * Each generator has several variants; "Regenerate" moves to the next one.
 */

export const VARIANT_COUNT = 3;

// ---------- helpers ----------

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function toHashtag(text: string): string {
  const words = text.replace(/[^a-zA-Z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  return "#" + words.map((w) => w[0].toUpperCase() + w.slice(1)).join("");
}

function buildHashtags(sources: string[], extra: string[] = []): string[] {
  const tags = [...sources.map(toHashtag), ...extra].filter((t) => t.length > 1);
  const seen = new Set<string>();
  return tags
    .filter((t) => {
      const key = t.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5);
}

/** Turn free-form notes into a short list of items (lines, bullets, sentences). */
export function parseNotes(notes: string): string[] {
  return notes
    .split(/\r?\n|;|(?<=[.!?])\s+/)
    // Strip only list markers ("- ", "* ", "• ", "1. ", "2) "), never digits that belong to the note.
    .map((s) => s.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim())
    .filter(Boolean)
    .slice(0, 5);
}

function bullets(items: string[]): string {
  return items.map((i) => `• ${i}`).join("\n");
}

function isCasual(tone: string): boolean {
  return /casual|conversational|friendly|warm|human/i.test(tone);
}

function pick(profile: Profile, formal: string, casual: string): string {
  return isCasual(profile.tone) ? casual : formal;
}

function interestAt(profile: Profile, index: number, fallback: string): string {
  const list = splitList(profile.interests);
  return list[index] ?? list[0] ?? fallback;
}

// ---------- sample trend data (NOT live, NOT verified) ----------

export interface SampleTrend {
  topic: string;
  hook: string;
  points: string[];
}

export const SAMPLE_TRENDS: SampleTrend[] = [
  {
    topic: "Moving AI agents from demos to production",
    hook: "Everyone is building AI agents. Far fewer people talk about how to trust them.",
    points: [
      "Clear boundaries on what the agent is allowed to do",
      "Step-by-step logging so every action can be reviewed",
      "A human checkpoint before high-impact actions",
      "Testing on realistic, messy tasks, not just the happy path",
    ],
  },
  {
    topic: "Evaluation as a first-class engineering practice",
    hook: "If you can't measure whether your LLM app got better, you're guessing.",
    points: [
      "A small, representative set of real test cases",
      "Automatic checks for the failure modes you care about most",
      "Regression runs whenever a prompt, model or retriever changes",
      "A habit of reading actual outputs, not just aggregate scores",
    ],
  },
  {
    topic: "Balancing model capability, cost and latency",
    hook: "The best model on paper isn't always the best model for your product.",
    points: [
      "What response time do your users actually tolerate?",
      "Which steps truly need a large model, and which don't?",
      "How does the cost behave when usage grows 10x?",
      "Can caching or smaller models cover the easy cases?",
    ],
  },
];

// ---------- generators ----------

function generateTrending(profile: Profile, variant: number): Post {
  const trend = SAMPLE_TRENDS[variant % SAMPLE_TRENDS.length];
  const industry = profile.industry || "my industry";
  const body = [
    `A theme I keep thinking about in ${industry}: ${trend.topic[0].toLowerCase()}${trend.topic.slice(1)}.`,
    `${profile.audience ? `For ${profile.audience}` : "For anyone building in this space"}, here's what I'd look at first:`,
    bullets(trend.points),
    pick(
      profile,
      `As ${/^[aeiou]/i.test(profile.role) ? "an" : "a"} ${profile.role || "practitioner"}, this is my perspective. What would you add?`,
      `That's my take as ${/^[aeiou]/i.test(profile.role) ? "an" : "a"} ${profile.role || "practitioner"}. What would you add to the list?`,
    ),
  ].join("\n\n");
  return {
    type: "trending",
    variant,
    hook: trend.hook,
    body,
    hashtags: buildHashtags([industry, interestAt(profile, 0, "")], ["#Trends"]),
    edited: false,
  };
}

function generateWork(profile: Profile, notes: string, variant: number): Post {
  const items = parseNotes(notes);
  const list = bullets(items);
  const focus = interestAt(profile, 0, "my craft");
  const role = profile.role || "my role";

  const variants: Pick<Post, "hook" | "body">[] = [
    {
      hook: `Today's work log: ${role} edition.`,
      body: [
        "Here's what I worked on today:",
        list,
        `Each of these taught me something about ${focus}. The details matter more than I expected.`,
        pick(
          profile,
          "I'm keen to learn how others approach similar problems.",
          "Curious how others tackle this kind of thing. Anything you'd do differently?",
        ),
      ].join("\n\n"),
    },
    {
      hook: "Learning in public: a quick look at my day.",
      body: [
        "Sharing what I'm working on, partly to keep myself honest:",
        list,
        `I'm still learning plenty about ${focus}, and writing things down helps me see what I'd do next.`,
        pick(
          profile,
          "What are you working on this week?",
          "What's on your plate this week? Would love to compare notes.",
        ),
      ].join("\n\n"),
    },
    {
      hook: "Not every day has a big announcement. Today was about the work itself.",
      body: [
        "Today's focus:",
        list,
        `Steady progress on ${focus} is how I try to build skills, one task at a time.`,
        pick(
          profile,
          "If you've tackled something similar, I'd value your advice.",
          "If you've been down this road, I'd love to hear what worked for you!",
        ),
      ].join("\n\n"),
    },
  ];

  return {
    type: "work",
    variant,
    ...variants[variant % variants.length],
    hashtags: buildHashtags(splitList(profile.interests).slice(0, 3), ["#LearningInPublic"]),
    edited: false,
  };
}

function generateDomain(profile: Profile, variant: number): Post {
  const a = interestAt(profile, 0, "my field");
  const b = interestAt(profile, 1, "good engineering");
  const audience = profile.audience || "practitioners";

  const variants: Pick<Post, "hook" | "body">[] = [
    {
      hook: `A lesson about ${a} that took me a while to appreciate:`,
      body: [
        `The hard part usually isn't the model or the tooling. It's defining what "good" looks like before you build.`,
        `Before starting anything involving ${a}, I try to write down:`,
        bullets([
          "Who the output is for",
          "What a good result looks like",
          "How I'll know when it's failing",
        ]),
        `It sounds basic, but it makes everything after it (${b} included) easier to reason about.`,
        `What's one question you always ask before you start a project?`,
      ].join("\n\n"),
    },
    {
      hook: `Unpopular opinion: most ${a} problems are really data and process problems.`,
      body: [
        `It's tempting to reach for a bigger model or a new framework. More often, the better lever is cleaner inputs, clearer requirements and a tighter feedback loop.`,
        `That's my view as ${/^[aeiou]/i.test(profile.role) ? "an" : "a"} ${profile.role || "practitioner"}, and I'm open to being wrong.`,
        `${audience.charAt(0).toUpperCase() + audience.slice(1)}: do you agree, or have you seen the opposite?`,
      ].join("\n\n"),
    },
    {
      hook: `A question for everyone working with ${a}:`,
      body: [
        `What's the most useful practice you've adopted that nobody told you about?`,
        `For me, a good candidate is treating ${b} as part of the build, not an afterthought.`,
        `I'd love to learn from ${audience}. Share yours in the comments and I'll read every one.`,
      ].join("\n\n"),
    },
  ];

  return {
    type: "domain",
    variant,
    ...variants[variant % variants.length],
    hashtags: buildHashtags(splitList(profile.interests).slice(0, 3), [toHashtag(profile.industry)]),
    edited: false,
  };
}

export function generatePost(
  type: PostType,
  profile: Profile,
  notes: string,
  variant: number,
): Post {
  switch (type) {
    case "trending":
      return generateTrending(profile, variant);
    case "work":
      return generateWork(profile, notes, variant);
    case "domain":
      return generateDomain(profile, variant);
  }
}

export function generateAllPosts(profile: Profile, notes: string, variant = 0): Posts {
  const entries = POST_TYPES.map((t) => [t, generatePost(t, profile, notes, variant)]);
  return Object.fromEntries(entries) as Posts;
}

/** The exact text that gets copied to the clipboard. */
export function formatPost(post: Post): string {
  return [post.hook.trim(), post.body.trim(), post.hashtags.join(" ")]
    .filter(Boolean)
    .join("\n\n");
}
