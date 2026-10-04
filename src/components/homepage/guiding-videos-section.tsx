"use client";

import { useTranslations } from "next-intl";
import { YouTubeEmbed, parseYouTubeUrl } from "@/components/shared/youtube-embed";

/**
 * Two short guiding videos — one for students, one for teachers — shown on the
 * home page and again on the signup page.
 *
 * Each video is its own NEXT_PUBLIC_ variable, baked in at build time (changing
 * either one needs a redeploy). The rule the brief sets: an unset or blank
 * variable means that card does NOT render — no empty box, no broken frame. A
 * missing video is invisible, not visible-and-broken. parseYouTubeUrl returns
 * null for empty or malformed input, so an unset var simply drops its card; if
 * both are unset the whole section is absent.
 *
 * The player itself is the existing Phase 4 YouTubeEmbed (Shorts-aware,
 * click-to-play) — not a second player.
 */
const STUDENT_LINK = process.env.NEXT_PUBLIC_SIGNUP_GUIDING_VIDEO_LINK_STUDENT;
const TEACHER_LINK = process.env.NEXT_PUBLIC_SIGNUP_GUIDING_VIDEO_LINK_TEACHER;

export function GuidingVideosSection() {
  const t = useTranslations("guidingVideos");

  const hasStudent = parseYouTubeUrl(STUDENT_LINK) !== null;
  const hasTeacher = parseYouTubeUrl(TEACHER_LINK) !== null;

  // Both unset → the section does not exist on the page at all.
  if (!hasStudent && !hasTeacher) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10">
          {t("heading")}
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          {hasStudent && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground text-center">
                {t("studentTitle")}
              </h3>
              <YouTubeEmbed url={STUDENT_LINK} title={t("studentTitle")} />
            </div>
          )}
          {hasTeacher && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground text-center">
                {t("teacherTitle")}
              </h3>
              <YouTubeEmbed url={TEACHER_LINK} title={t("teacherTitle")} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
