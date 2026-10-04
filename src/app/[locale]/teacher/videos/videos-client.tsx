"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Video,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Inbox,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { YouTubeEmbed } from "@/components/shared/youtube-embed";
import { VideoShareButtons } from "@/components/video/video-share-buttons";

type VideoItem = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  status: string;
  adminNotes: string | null;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
};

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-500", label: "Pending Review" },
  approved: { icon: CheckCircle, color: "text-emerald-500", label: "Approved" },
  rejected: { icon: XCircle, color: "text-red-500", label: "Rejected" },
};

const MAX_VIDEOS = 10;

export function VideosClient({
  videos: initialVideos,
  teacherName,
}: {
  videos: VideoItem[];
  teacherName: string;
}) {
  const t = useTranslations("teacher");
  const [videos, setVideos] = useState(initialVideos);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const atLimit = videos.length >= MAX_VIDEOS;

  async function handleAdd() {
    if (!title.trim() || !videoUrl.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/videos/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          videoUrl: videoUrl.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not add the video.");
        setSubmitting(false);
        return;
      }
      setVideos((prev) => [
        {
          id: data.videoId,
          title: title.trim(),
          description: description.trim() || null,
          // The embed parses any YouTube form; store what was entered.
          videoUrl: videoUrl.trim(),
          thumbnailUrl: null,
          duration: null,
          status: "pending",
          adminNotes: null,
          isPublic: false,
          viewCount: 0,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setShowForm(false);
    } catch {
      setError("Could not add the video. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Video className="w-6 h-6 text-emerald-600" />
            {t("sidebarVideos")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add tilawat and intro videos as YouTube links ({videos.length}/{MAX_VIDEOS}).
            An admin reviews each one before it shows on the home page.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} disabled={atLimit}>
          <Plus className="w-4 h-4 me-2" />
          Add Video
        </Button>
      </div>

      {atLimit && !showForm && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          You have reached the maximum of {MAX_VIDEOS} videos. Remove one to add another.
        </p>
      )}

      {/* Add-by-link form */}
      {showForm && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Surah Al-Baqarah Tilawat"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              YouTube link *
            </label>
            <input
              type="url"
              inputMode="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="https://www.youtube.com/watch?v=…  (or a Short)"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Keep it to about 10 minutes — the admin checks the length when approving.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={2}
              placeholder="Optional description..."
            />
          </div>

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={submitting || !title.trim() || !videoUrl.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add video"
              )}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Videos list */}
      {videos.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No videos yet. Add your first YouTube link!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const cfg = statusConfig[video.status] ?? statusConfig.pending;
            const StatusIcon = cfg.icon;
            return (
              <div key={video.id} className="rounded-xl border bg-card overflow-hidden">
                <div className="relative">
                  <YouTubeEmbed url={video.videoUrl} title={video.title} />
                  <span
                    className={`absolute top-2 end-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-background/90 backdrop-blur-sm ${cfg.color}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-1">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {video.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      {video.status === "approved" && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.viewCount}
                        </span>
                      )}
                      {video.status === "approved" && (
                        <VideoShareButtons
                          videoId={video.id}
                          title={video.title}
                          teacherName={teacherName}
                        />
                      )}
                    </div>
                  </div>

                  {video.status === "rejected" && video.adminNotes && (
                    <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-950 text-xs text-red-600 dark:text-red-400">
                      {video.adminNotes}
                    </div>
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
