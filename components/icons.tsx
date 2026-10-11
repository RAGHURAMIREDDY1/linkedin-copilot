import { useId } from "react";

/** Small inline icon set (24px grid, stroke-based) so no icon library is needed. */

export type IconName =
  | "overview"
  | "sparkles"
  | "trending"
  | "file"
  | "send"
  | "chart"
  | "settings"
  | "search"
  | "bell"
  | "menu"
  | "x"
  | "chevronLeft"
  | "chevronRight"
  | "copy"
  | "check"
  | "edit"
  | "refresh"
  | "bookmark"
  | "trash"
  | "lock"
  | "info"
  | "calendar"
  | "undo"
  | "layers"
  | "user";

const PATHS: Record<IconName, React.ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.8" />
      <rect x="14" y="3" width="7" height="5" rx="1.8" />
      <rect x="14" y="12" width="7" height="9" rx="1.8" />
      <rect x="3" y="16" width="7" height="5" rx="1.8" />
    </>
  ),
  sparkles: (
    <>
      <path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
    </>
  ),
  trending: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  send: (
    <>
      <path d="M21 3L10 14" />
      <path d="M21 3l-7 18-4-7-7-4z" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="M8 17v-5M13 17V8M18 17v-8" />
    </>
  ),
  settings: (
    <>
      <path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0" />
      <circle cx="15" cy="6" r="2.2" />
      <circle cx="9" cy="12" r="2.2" />
      <circle cx="17" cy="18" r="2.2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 0 0-14.5-3.5L4 9" />
      <path d="M4 4v5h5" />
      <path d="M4 13a8 8 0 0 0 14.5 3.5L20 15" />
      <path d="M20 20v-5h-5" />
    </>
  ),
  bookmark: <path d="M6 4h12v17l-6-4-6 4z" />,
  trash: (
    <>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  undo: (
    <>
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
};

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {PATHS[name]}
    </svg>
  );
}

/** SignalPost mark: a rounded tile with a "signal" arc pair around a post dot. */
export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={`shrink-0 ${className}`}>
      <defs>
        <linearGradient id={`${id}-g`} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b7cf0" />
          <stop offset="1" stopColor="#3f86f2" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id}-g)`} />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill="none" stroke="#fff" strokeOpacity="0.25" />
      <circle cx="12" cy="20" r="2.6" fill="#fff" />
      <path d="M12 13.2a6.8 6.8 0 0 1 6.8 6.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M12 8.2A11.8 11.8 0 0 1 23.8 20"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.7"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
