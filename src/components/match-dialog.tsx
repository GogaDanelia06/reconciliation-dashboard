"use client";

import { useEffect, useState } from "react";
import { MONTHS } from "@/lib/months";
import { formatDate, formatGel } from "@/lib/format";
import { usePreviewMatching } from "@/hooks/use-preview-matching";
import { useRunMatching } from "@/hooks/use-run-matching";

interface MatchDialogProps {
  open: boolean;
  onClose: () => void;
  defaultMonthKey: string;
  onSaved: (count: number) => void;
}

export function MatchDialog({ open, onClose, defaultMonthKey, onSaved }: MatchDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set([defaultMonthKey]));
  const preview = usePreviewMatching();
  const run = useRunMatching();

  useEffect(() => {
    if (open) {
      setSelected(new Set([defaultMonthKey]));
      preview.reset();
      run.reset();
    }
    // preview/run are stable mutation objects; re-running on their identity
    // would loop. Only reset on open / month change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultMonthKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const months = Array.from(selected).sort();
  const inReview = preview.isSuccess;

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const doSave = () =>
    run.mutate(months, {
      onSuccess: (res) => {
        onSaved(res.newly_matched);
        onClose();
      },
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line p-5">
          <div>
            <h2 className="text-base font-semibold text-ink">
              {inReview ? "Review matches" : "Auto-match transactions"}
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {inReview
                ? "These matches aren't saved yet — review, then confirm."
                : "Match unmatched transactions to companies by tax ID."}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1 text-muted transition-colors hover:bg-card-hover hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {!inReview ? (
          /* Step 1 — scope */
          <>
            <div className="p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Months to match</p>
              <div className="space-y-1">
                {MONTHS.map((m) => (
                  <label
                    key={m.key}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-card-hover"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(m.key)}
                      onChange={() => toggle(m.key)}
                      className="h-4 w-4 accent-brand"
                    />
                    {m.label}
                  </label>
                ))}
              </div>
              {preview.isError && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">{(preview.error as Error).message}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-line p-4">
              <button type="button" onClick={onClose} className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-card-hover">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => preview.mutate(months)}
                disabled={selected.size === 0 || preview.isPending}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-ink shadow-sm transition-colors hover:bg-brand-hover disabled:opacity-60"
              >
                {preview.isPending ? "Previewing…" : "Preview matches"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-5">
              <p className="text-sm text-ink">
                <span className="font-semibold">{preview.data.length}</span> transaction
                {preview.data.length === 1 ? "" : "s"} will be matched.
              </p>

              {preview.data.length > 0 ? (
                <ul className="mt-3 max-h-64 divide-y divide-line overflow-y-auto rounded-lg border border-line">
                  {preview.data.map((row) => (
                    <li key={row.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                      <span className="min-w-0">
                        <span className="block truncate text-ink">{row.sender_name ?? "—"}</span>
                        <span className="text-xs text-muted">
                          {formatDate(row.entry_date)} · → {row.company_name}
                        </span>
                      </span>
                      <span className="shrink-0 font-medium text-ink">{formatGel(row.amount)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-lg border border-line bg-card-hover px-3 py-6 text-center text-sm text-muted">
                  No unmatched transactions to match in the selected months.
                </p>
              )}

              {run.isError && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">{(run.error as Error).message}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-line p-4">
              <button type="button" onClick={() => preview.reset()} className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-card-hover">
                Back
              </button>
              <button
                type="button"
                onClick={doSave}
                disabled={preview.data.length === 0 || run.isPending}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-ink shadow-sm transition-colors hover:bg-brand-hover disabled:opacity-60"
              >
                {run.isPending ? "Saving…" : `Save ${preview.data.length} match${preview.data.length === 1 ? "" : "es"}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
