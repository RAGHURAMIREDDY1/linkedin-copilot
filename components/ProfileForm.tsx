import type { Profile } from "@/lib/types";
import { DEFAULT_PROFILE } from "@/lib/defaults";
import { btnLink, cardClass, fieldClass } from "./ui";

const FIELDS: { key: keyof Profile; label: string; hint?: string }[] = [
  { key: "role", label: "Current role" },
  { key: "industry", label: "Industry" },
  { key: "interests", label: "Technical interests", hint: "Comma-separated" },
  { key: "audience", label: "Target audience" },
  { key: "tone", label: "Writing tone" },
];

export default function ProfileForm({
  profile,
  onChange,
  columns = "stack",
}: {
  profile: Profile;
  onChange: (profile: Profile) => void;
  /** "stack" = one column (sidebar use); "grid" = two columns from the sm breakpoint. */
  columns?: "stack" | "grid";
}) {
  return (
    <section className={cardClass}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-white">Your professional profile</h2>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_PROFILE)}
          aria-label="Reset profile to the example values"
          className={btnLink}
        >
          Reset
        </button>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-slate-300">
        Shapes the topics, audience and tone of every draft. Pre-filled with an example AI engineer; edit
        freely. Changes are saved in this browser only.
      </p>
      <div className={`mt-5 grid gap-4 ${columns === "grid" ? "sm:grid-cols-2" : ""}`}>
        {FIELDS.map(({ key, label, hint }) => (
          <label key={key} className="block text-sm font-medium text-slate-200">
            {label}
            {hint && <span className="ml-1 font-normal text-slate-400">({hint})</span>}
            <input
              type="text"
              value={profile[key]}
              onChange={(e) => onChange({ ...profile, [key]: e.target.value })}
              className={fieldClass}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
