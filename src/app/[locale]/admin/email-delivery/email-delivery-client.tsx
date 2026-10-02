"use client";

import { useState } from "react";
import { Mail, Inbox, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

type EmailEvent = {
  id: string;
  recipient: string;
  type: string;
  status: string;
  detail: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS: Record<string, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  sent: { label: "Sent", cls: "text-blue-600 bg-blue-100 dark:bg-blue-900/30", Icon: Clock },
  delivered: { label: "Delivered", cls: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30", Icon: CheckCircle2 },
  bounced: { label: "Bounced", cls: "text-red-600 bg-red-100 dark:bg-red-900/30", Icon: AlertTriangle },
  complained: { label: "Marked spam", cls: "text-amber-600 bg-amber-100 dark:bg-amber-900/30", Icon: AlertTriangle },
  rejected: { label: "Rejected", cls: "text-red-600 bg-red-100 dark:bg-red-900/30", Icon: XCircle },
};

export function EmailDeliveryClient({ events }: { events: EmailEvent[] }) {
  const [filter, setFilter] = useState<"all" | "problem">("all");

  // "problem" = anything the recipient did not receive, which is the whole
  // point of this page: find the students who did not get their email.
  const problems = events.filter((e) => ["bounced", "complained", "rejected"].includes(e.status));
  const shown = filter === "all" ? events : problems;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground leading-tight">Email Delivery</h1>
          <p className="text-xs text-muted-foreground">
            Verification and reset emails — who received them, who did not.
          </p>
        </div>
      </header>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === "all" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}
        >
          All ({events.length})
        </button>
        <button
          onClick={() => setFilter("problem")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === "problem" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}
        >
          Did not arrive ({problems.length})
        </button>
      </div>

      {shown.length === 0 ? (
        <div className="py-20 text-center">
          <Inbox className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {filter === "problem" ? "No delivery problems. Every email arrived." : "No emails sent yet."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {shown.map((e) => {
            const s = STATUS[e.status] ?? STATUS.sent;
            return (
              <li key={e.id} className="rounded-xl border bg-card px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{e.recipient}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {e.type.replace(/_/g, " ")} · {new Date(e.createdAt).toLocaleString()}
                    </p>
                    {e.detail && ["bounced", "complained", "rejected"].includes(e.status) && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 break-words">{e.detail}</p>
                    )}
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>
                    <s.Icon className="w-3 h-3" />
                    {s.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
