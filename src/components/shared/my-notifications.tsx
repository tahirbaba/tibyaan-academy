"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Inbox, Check, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";

/** Broadcast so the header bell and this page stay in sync when either changes. */
export const NOTIFICATIONS_CHANGED = "notifications:changed";

type Notification = {
  id: string;
  type: string;
  titleEn: string;
  titleUr: string | null;
  titleAr: string | null;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/**
 * The full notifications page for a teacher or a student — their own
 * notifications only (the API scopes by the signed-in user), newest first.
 *
 * Until this existed the only way to see a notification was the header bell
 * dropdown, and anything that scrolled past its recent window was gone for
 * good. This is the durable list.
 */
export function MyNotifications({ heading }: { heading: string }) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setItems(Array.isArray(data.notifications) ? data.notifications : []);
    } catch {
      // A failed load is left as an empty list here, but the bell and this page
      // both read the same endpoint — if it is truly down the user sees it
      // everywhere, not a false "no notifications" on one screen only.
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Re-load when the bell (or another tab of this page) changes something.
    const onChange = () => load();
    window.addEventListener(NOTIFICATIONS_CHANGED, onChange);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED, onChange);
  }, [load]);

  const unread = items.filter((n) => !n.isRead).length;

  const markRead = async (id: string) => {
    setBusyId(id);
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      // Tell the header bell to drop its badge count.
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    const toMark = items.filter((n) => !n.isRead);
    await Promise.all(toMark.map((n) => fetch(`/api/notifications/${n.id}`, { method: "PATCH" })));
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground leading-tight">{heading}</h1>
          <p className="text-xs text-muted-foreground">
            {unread > 0 ? `${unread} unread` : "All caught up"}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="shrink-0 text-xs text-primary hover:underline"
          >
            Mark all read
          </button>
        )}
      </header>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <Inbox className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const body = (
              <div
                className={`rounded-xl border px-4 py-3 transition-colors ${
                  n.isRead ? "bg-card" : "bg-primary/5 border-s-2 border-s-primary"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.isRead ? "" : "font-semibold"} text-foreground`}>
                      {n.titleEn}
                    </p>
                    {n.message && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        markRead(n.id);
                      }}
                      disabled={busyId === n.id}
                      className="shrink-0 inline-flex items-center gap-1 text-[11px] text-primary hover:underline disabled:opacity-50"
                    >
                      {busyId === n.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            );

            // A notification with a link opens it (and marks read on the way);
            // one without is just a list row.
            return (
              <li key={n.id}>
                {n.link ? (
                  <Link
                    href={n.link}
                    onClick={() => {
                      if (!n.isRead) markRead(n.id);
                    }}
                    className="block"
                  >
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
