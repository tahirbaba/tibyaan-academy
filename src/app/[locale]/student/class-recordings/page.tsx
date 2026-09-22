"use client";

import { useState, useEffect } from "react";
import { Video, Inbox, ExternalLink, Clock, UploadCloud, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * One page for both recording sources. Teacher uploads were previously rendered
 * only by /student/recordings, which nothing linked to, so students never saw
 * them. See src/app/api/student/class-recordings/route.ts.
 */

type Recording = {
  id: string;
  source: "teacher_upload" | "admin_link";
  title: string;
  recordingUrl: string;
  date: string;
  teacherName: string | null;
  durationMinutes: number | null;
  expiresAt: string | null;
  notes: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Days until expiry, or null when the recording does not expire. */
function daysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

export default function StudentClassRecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/class-recordings")
      .then((r) => r.json())
      .then((d) => setRecordings(d.recordings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
          <Video className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Class Recordings</h1>
          <p className="text-sm text-muted-foreground">
            Recordings of your classes, from your teacher and from the academy
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : recordings.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No class recordings available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recordings.map((rec) => {
            const left = daysLeft(rec.expiresAt);
            const fromTeacher = rec.source === "teacher_upload";
            return (
              <div
                key={`${rec.source}:${rec.id}`}
                className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 h-32 flex items-center justify-center">
                  <Video className="w-12 h-12 text-white/80" />
                </div>
                <div className="p-4 space-y-2 flex flex-col flex-1">
                  {/* Where this recording came from */}
                  <span
                    className={`self-start inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      fromTeacher
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {fromTeacher ? (
                      <>
                        <UploadCloud className="w-3 h-3" />
                        Uploaded by your teacher
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3 h-3" />
                        Shared by the academy
                      </>
                    )}
                  </span>

                  <h3 className="font-semibold text-foreground text-sm line-clamp-1">
                    {rec.title}
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    {formatDate(rec.date)}
                    {rec.durationMinutes ? ` · ${rec.durationMinutes} min` : ""}
                  </p>

                  {rec.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{rec.notes}</p>
                  )}

                  {/* Only teacher uploads expire; admin links have no expiry. */}
                  {left !== null && (
                    <p
                      className={`text-xs flex items-center gap-1 ${
                        left <= 3 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                      }`}
                    >
                      <Clock className="w-3 h-3 shrink-0" />
                      {left > 0
                        ? `Available for ${left} more day${left === 1 ? "" : "s"}`
                        : "Expired"}
                    </p>
                  )}

                  <a
                    href={rec.recordingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto pt-2"
                  >
                    <Button
                      size="sm"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <ExternalLink className="w-3.5 h-3.5 me-1.5" />
                      Watch Recording
                    </Button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
