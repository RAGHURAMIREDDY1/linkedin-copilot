import type { PostType } from "@/lib/types";
import type { IconName } from "./icons";

/**
 * One distinct visual treatment per post type. Colour is never the only cue: each type
 * also has its own icon and kicker label. The `swatch` hexes are the validated dark-mode
 * categorical colours (violet / teal / blue) reused by the charts, so a type keeps one
 * colour everywhere.
 */
export interface PostTheme {
  kicker: string;
  icon: IconName;
  swatch: string;
  /** Bright accent text for headings/labels on dark surfaces. */
  text: string;
  chip: string;
  iconTile: string;
  /** Left accent bar. */
  bar: string;
  /** Soft wash behind the card header. */
  wash: string;
  /** Card border when editing. */
  editing: string;
}

export const POST_THEME: Record<PostType, PostTheme> = {
  trending: {
    kicker: "Your take on a sample topic",
    icon: "trending",
    swatch: "#19a9a0",
    text: "text-cyan-300",
    chip: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
    iconTile: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    bar: "from-cyan-300 to-teal-500",
    wash: "from-cyan-400/12 via-transparent to-transparent",
    editing: "border-cyan-400/60 ring-4 ring-cyan-400/10",
  },
  work: {
    kicker: "From today's notes",
    icon: "layers",
    swatch: "#8b7cf0",
    text: "text-violet-300",
    chip: "border-violet-400/30 bg-violet-400/10 text-violet-200",
    iconTile: "border-violet-400/30 bg-violet-400/10 text-violet-300",
    bar: "from-violet-300 to-violet-600",
    wash: "from-violet-400/14 via-transparent to-transparent",
    editing: "border-violet-400/60 ring-4 ring-violet-400/10",
  },
  domain: {
    kicker: "From your profile and interests",
    icon: "sparkles",
    swatch: "#3f86f2",
    text: "text-blue-300",
    chip: "border-blue-400/30 bg-blue-400/10 text-blue-200",
    iconTile: "border-blue-400/30 bg-blue-400/10 text-blue-300",
    bar: "from-blue-300 to-blue-600",
    wash: "from-blue-400/14 via-transparent to-transparent",
    editing: "border-blue-400/60 ring-4 ring-blue-400/10",
  },
};
