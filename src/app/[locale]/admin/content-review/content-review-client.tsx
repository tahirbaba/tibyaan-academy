"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  FileCheck,
  Inbox,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type PostType = "dars" | "blog";

interface QueueItem {
  type: PostType;
  slug: string;
  title: string | null;
  category: string | null;
  status: string;
  sourceReference: string | null;
  reviewNote: string | null;
  createdAt: string;
}

interface DetailItem {
  slug: string;
  titleEn: string | null;
  contentEn: string | null;
  category?: string | null;
  sourceReference?: string | null;
  metaDescriptionEn?: string | null;
  keywords?: string[] | null;
  status: string;
  reviewNote: string | null;
  createdAt: string;
}

type Action = "approve" | "reject" | "request_revision";

const STATUS_STYLES: Record<string, string> = {
  pending_review: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  needs_revision: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

const STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending review",
  needs_revision: "Revision requested",
};

export function ContentReviewClient() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<QueueItem | null>(null);
  // A warning from the last approve — the item published but something (the
  // poster) did not. Held here so it stays visible on the queue rather than
  // vanishing with the detail view.
  const [actionWarning, setActionWarning] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content-review");
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  if (selected) {
    return (
      <ReviewDetail
        item={selected}
        onBack={() => setSelected(null)}
        onDone={(warning) => {
          setSelected(null);
          setActionWarning(warning ?? null);
          loadQueue();
        }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <FileCheck className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground leading-tight">
            Content Review
          </h1>
          <p className="text-xs text-muted-foreground">
            Nothing goes live until you approve it here.
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center justify-center min-w-8 h-8 px-2.5 rounded-full bg-accent text-white text-sm font-bold tabular-nums">
          {loading ? "—" : items.length}
        </span>
      </header>

      {actionWarning && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
          <span className="text-amber-700 dark:text-amber-300 text-sm flex-1">
            {actionWarning}
          </span>
          <button
            type="button"
            onClick={() => setActionWarning(null)}
            className="text-amber-700 dark:text-amber-300 shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <Inbox className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            The queue is empty. Nothing is waiting for review.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={`${item.type}:${item.slug}`}>
              <button
                type="button"
                onClick={() => setSelected(item)}
                className="w-full text-start rounded-xl border bg-card p-4 hover:bg-muted/40 active:bg-muted/60 transition-colors"
              >
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground uppercase tracking-wide">
                    {item.type}
                  </span>
                  {item.category && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 capitalize">
                      {item.category}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      STATUS_STYLES[item.status] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {STATUS_LABELS[item.status] ?? item.status}
                  </span>
                </div>
                <p className="font-semibold text-foreground text-[15px] leading-snug">
                  {item.title || item.slug}
                </p>
                {item.reviewNote && (
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    Your note: {item.reviewNote}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReviewDetail({
  item,
  onBack,
  onDone,
}: {
  item: QueueItem;
  onBack: () => void;
  onDone: (warning?: string) => void;
}) {
  const [detail, setDetail] = useState<DetailItem | null>(null);
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Action | null>(null);
  const [noteFor, setNoteFor] = useState<Exclude<Action, "approve"> | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/admin/content-review?type=${item.type}&slug=${encodeURIComponent(item.slug)}`
        );
        const data = await res.json();
        if (!active) return;
        setDetail(data.item ?? null);
        setHtml(data.renderedHtml ?? "");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [item.type, item.slug]);

  const submit = async (action: Action) => {
    if (action !== "approve" && !note.trim()) {
      setError(
        action === "reject" ? "Add a one-line reason." : "Add a note for the rewrite."
      );
      return;
    }
    setBusy(action);
    setError("");
    try {
      const res = await fetch("/api/admin/content-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: item.type,
          slug: item.slug,
          action,
          note: action === "approve" ? undefined : note.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      // A 200 can still carry a warning — the item published but a side effect
      // (e.g. the poster) failed. Pass it up so it is shown on the queue,
      // rather than dropped, which taught everyone the operation fully worked.
      onDone(typeof data.warning === "string" ? data.warning : undefined);
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    // pb-32 keeps the sticky action bar from covering the end of the article on a phone.
    <div className="max-w-3xl mx-auto px-4 py-6 pb-40 space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to queue
      </button>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !detail ? (
        <p className="text-sm text-muted-foreground">Could not load this item.</p>
      ) : (
        <>
          <article>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground uppercase tracking-wide">
                {item.type}
              </span>
              {detail.category && (
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 capitalize">
                  {detail.category}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {detail.titleEn || detail.slug}
            </h1>

            {/* Citations — the thing most worth checking before approving. */}
            {detail.sourceReference && (
              <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                    Citation
                  </p>
                  <p className="text-sm text-amber-900 dark:text-amber-200 break-words">
                    {detail.sourceReference}
                  </p>
                </div>
              </div>
            )}

            {detail.metaDescriptionEn && (
              <p className="mt-3 text-xs text-muted-foreground border-s-2 border-border ps-3">
                Meta: {detail.metaDescriptionEn}
              </p>
            )}

            <div
              className="mt-6 prose dark:prose-invert prose-emerald max-w-none
                prose-headings:text-foreground prose-h2:text-xl prose-h3:text-lg
                prose-p:text-foreground/85 prose-a:text-emerald-600 prose-a:underline
                prose-strong:text-foreground break-words"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </article>

          {/* Sticky action bar — thumb-reachable on mobile. */}
          <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="max-w-3xl mx-auto px-4 py-3 space-y-3">
              {noteFor && (
                <div className="space-y-2">
                  <textarea
                    autoFocus
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={
                      noteFor === "reject"
                        ? "Reason for rejecting (one line)"
                        : "What should be changed?"
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => submit(noteFor)}
                      disabled={busy !== null}
                      className="flex-1 h-11"
                    >
                      {busy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : noteFor === "reject" ? (
                        "Confirm reject"
                      ) : (
                        "Send back for revision"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11"
                      onClick={() => {
                        setNoteFor(null);
                        setNote("");
                        setError("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {error && <p className="text-xs text-red-600">{error}</p>}

              {!noteFor && (
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => submit("approve")}
                    disabled={busy !== null}
                    className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    {busy === "approve" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 me-1.5" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setNoteFor("request_revision")}
                    disabled={busy !== null}
                    className="h-12"
                  >
                    <RotateCcw className="w-4 h-4 me-1.5" />
                    Revise
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setNoteFor("reject")}
                    disabled={busy !== null}
                    className="h-12 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <X className="w-4 h-4 me-1.5" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
