import { useEffect, useRef } from "react";
import { EXAMPLE_NOTES } from "@/lib/defaults";
import { Icon } from "./icons";
import { btnPrimary, btnSecondary, cardClass, fieldClass } from "./ui";

export default function WorkUpdateForm({
  notes,
  onChange,
  onGenerate,
  error,
  loading = false,
  rows = 5,
  onGenerateLive,
  aiError = "",
}: {
  notes: string;
  onChange: (notes: string) => void;
  onGenerate: () => void;
  error: string;
  loading?: boolean;
  rows?: number;
  /** Offered only when live AI is configured on the server. Demo generation stays the default action. */
  onGenerateLive?: () => void;
  /** A failed live AI attempt. Separate from `error`, which is about the notes. */
  aiError?: string;
}) {
  const textarea = useRef<HTMLTextAreaElement>(null);

  // An error is always about the notes, so take the user straight to the field.
  useEffect(() => {
    if (error) textarea.current?.focus();
  }, [error]);

  return (
    <section className={cardClass}>
      <label htmlFor="notes" className="text-lg font-semibold text-white">
        What did you work on today?
      </label>
      <p id="notes-help" className="mt-1 text-sm text-slate-300">
        A few quick lines are enough. One item per line works best.
      </p>
      <textarea
        id="notes"
        ref={textarea}
        rows={rows}
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"Built a retrieval prototype\nCompared prompt variations\nFixed a slow API call"}
        aria-describedby={error ? "notes-help notes-error" : "notes-help"}
        aria-invalid={error ? true : undefined}
        className={`${fieldClass} ${error ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/25" : ""}`}
      />
      {error && (
        <p
          id="notes-error"
          role="alert"
          className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200"
        >
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          aria-busy={loading}
          className={`${btnPrimary} sm:min-h-11 sm:px-6`}
        >
          {loading ? (
            <>
              <span aria-hidden="true" className="anim-spin h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
              Building drafts…
            </>
          ) : (
            <>
              <Icon name="sparkles" className="h-4 w-4" />
              Generate Today&apos;s 3 Posts
            </>
          )}
        </button>
        {onGenerateLive && (
          <button type="button" onClick={onGenerateLive} disabled={loading} className={btnSecondary}>
            <Icon name="sparkles" className="h-4 w-4" />
            Generate with AI
          </button>
        )}
        <button type="button" onClick={() => onChange(EXAMPLE_NOTES)} className={btnSecondary}>
          Try an example update
        </button>
      </div>
      {aiError && (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200"
        >
          {aiError} Your existing drafts were not changed.
        </p>
      )}
    </section>
  );
}
