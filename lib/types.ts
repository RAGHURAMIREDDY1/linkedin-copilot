export type PostType = "domain" | "trending" | "work";

export interface Profile {
  role: string;
  industry: string;
  interests: string; // comma-separated
  audience: string;
  tone: string;
}

export interface Post {
  type: PostType;
  variant: number; // which template variant produced this post
  hook: string;
  body: string;
  hashtags: string[];
  edited: boolean;
  /** "ai" only for text written by the live model. Missing means a Demo Mode template (also for older saved posts). */
  source?: "ai";
  /** Model that wrote an AI post, as reported by the provider. */
  model?: string;
  /** Id of the My Drafts record this post is saved as (set once it has been saved or published). */
  draftId?: string;
}

export type Posts = Record<PostType, Post>;

export interface AppState {
  profile: Profile;
  notes: string;
  posts: Posts | null;
  library: LibraryItem[];
  activity: ActivityEvent[];
}

export const POST_TYPES: PostType[] = ["domain", "trending", "work"];

export const POST_LABELS: Record<PostType, string> = {
  domain: "Domain Expertise",
  trending: "Trending Topic",
  work: "Work & Professional Visibility",
};

// ---------- library (saved drafts, and posts the user confirmed they published) ----------

export type LibraryStatus = "draft" | "published";

/**
 * How a post came to be "published". Today it is only ever "user-confirmed": the user posted it on
 * LinkedIn themselves and told us so. If an official LinkedIn API integration is added later, a post
 * may be marked "api-verified" only after the API confirms success. Never set it from a click.
 */
export type PublishMethod = "user-confirmed" | "api-verified";

export interface LibraryItem {
  id: string;
  post: Post;
  status: LibraryStatus;
  createdAt: number; // epoch ms
  publishedAt?: number; // set only when the user confirms "I have published this"
  publishMethod?: PublishMethod;
}

export type ActivityKind = "generated" | "saved" | "posted";

/** Local-only activity log. Powers the analytics; nothing here comes from LinkedIn. */
export interface ActivityEvent {
  t: number; // epoch ms
  kind: ActivityKind;
  count: number;
}
