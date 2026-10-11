// A template remounts on every navigation, which replays this short enter animation.
// It is a no-op for people who prefer reduced motion (see globals.css).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="anim-page">{children}</div>;
}
