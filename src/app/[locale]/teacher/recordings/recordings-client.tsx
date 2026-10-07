"use client";

import { Disc, Inbox, Clock, User, Download } from "lucide-react";

type RecordingItem = {
  id: string;
  studentName: string;
  /** Private recordings play through /api/recordings/[id]/play; this says if the
   *  window is still open (hidden a few hours before the 3-day deletion). */
  available: boolean;
  duration: number | null;
  sessionDate: string;
  expiresAt: string;
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function daysRemaining(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export function RecordingsClient({ recordings }: { recordings: RecordingItem[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Disc className="w-6 h-6 text-emerald-600" />
          Class Recordings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Recordings are automatically deleted 3 days after the class
        </p>
      </div>

      {recordings.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No recordings yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((rec) => {
            const days = daysRemaining(rec.expiresAt);
            return (
              <div
                key={rec.id}
                className="rounded-xl border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground text-sm">
                      {rec.studentName}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      {new Date(rec.sessionDate).toLocaleDateString()} at{" "}
                      {new Date(rec.sessionDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>{formatDuration(rec.duration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      days <= 1
                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        : days <= 3
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {days}d left
                  </span>

                  {rec.available ? (
                    <a
                      href={`/api/recordings/${rec.id}/play`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      View
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
                      No longer available
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
