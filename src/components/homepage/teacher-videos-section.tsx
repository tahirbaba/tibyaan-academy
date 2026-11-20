"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Video, Eye, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoShareButtons } from "@/components/video/video-share-buttons";
import { SectionHeading } from "./primitives";

interface TeacherVideo {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  viewCount: number;
  teacherId: string;
  teacherName: string;
  teacherCode: string;
  courseCategory: string | null;
}

export function TeacherVideosSection() {
  const t = useTranslations("teacherVideos");
  const locale = useLocale();
  const [videos, setVideos] = useState<TeacherVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/videos/public")
      .then((res) => res.json())
      .then((data) => setVideos(data.videos ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Don't render null when empty — show placeholder below

  return (
    <section className="bg-muted/40 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <div className="h-12" aria-hidden />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border bg-card overflow-hidden animate-pulse">
                <div className="aspect-video bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Video className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t("comingSoon")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map((video, i) => {
              const isPlaying = playing[video.id];
              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Video / thumbnail area */}
                  <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden">
                    {isPlaying ? (
                      <video
                        src={video.videoUrl}
                        className="w-full h-full object-contain bg-black"
                        controls
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <>
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                            <Video className="w-10 h-10" />
                          </div>
                        )}

                        {/* Play button overlay */}
                        {video.videoUrl && (
                          <button
                            onClick={() => setPlaying((p) => ({ ...p, [video.id]: true }))}
                            className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors"
                          >
                            <div className="w-12 h-12 bg-white/90 dark:bg-black/70 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200">
                              <Play className="w-5 h-5 text-emerald-600 ms-0.5" />
                            </div>
                          </button>
                        )}

                        {/* View count badge */}
                        <div className="absolute bottom-2 end-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                          <Eye className="w-3 h-3" />
                          <span>{video.viewCount}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-4">
                    {video.courseCategory && (
                      <span className="inline-block text-xs font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5 mb-1">
                        {video.courseCategory}
                      </span>
                    )}
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                      {video.title}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-foreground">{video.teacherName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{video.teacherCode}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Share button */}
                        <VideoShareButtons
                          videoId={video.id}
                          title={video.title}
                          teacherName={video.teacherName}
                        />
                        <Link href={`/teachers/${video.teacherId}` as Parameters<typeof Link>[0]["href"]}>
                          <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
                            {t("viewProfile")}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
