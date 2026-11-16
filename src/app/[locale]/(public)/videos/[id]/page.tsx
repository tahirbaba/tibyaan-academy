import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { teacherVideos, teacherProfiles, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { Link } from "@/i18n/navigation";
import { VideoShareButtons } from "@/components/video/video-share-buttons";
import { ArrowLeft, User, Eye, Calendar, BookOpen } from "lucide-react";

import { SITE_URL as BASE_URL, openGraphBase } from "@/lib/site-config";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

async function getVideo(videoId: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: teacherVideos.id,
      title: teacherVideos.title,
      description: teacherVideos.description,
      surahName: teacherVideos.surahName,
      surahNumber: teacherVideos.surahNumber,
      ayahFrom: teacherVideos.ayahFrom,
      ayahTo: teacherVideos.ayahTo,
      duration: teacherVideos.duration,
      videoUrl: teacherVideos.videoUrl,
      thumbnailUrl: teacherVideos.thumbnailUrl,
      viewCount: teacherVideos.viewCount,
      createdAt: teacherVideos.createdAt,
      status: teacherVideos.status,
      teacherId: teacherVideos.teacherId,
      teacherName: users.fullName,
      teacherBio: teacherProfiles.bio,
      teacherSpecializations: teacherProfiles.specializations,
      teacherYearsExperience: teacherProfiles.yearsExperience,
    })
    .from(teacherVideos)
    .innerJoin(users, eq(teacherVideos.teacherId, users.id))
    .leftJoin(teacherProfiles, eq(teacherProfiles.userId, users.id))
    .where(and(eq(teacherVideos.id, videoId), eq(teacherVideos.status, "approved")))
    .limit(1);

  return rows[0] ?? null;
}

type VideoRow = NonNullable<Awaited<ReturnType<typeof getVideo>>>;

/** "Surah Al-Mulk, ayah 1–12" — the recitation reference, if recorded. */
function recitationLabel(video: VideoRow): string | null {
  if (!video.surahName) return null;
  const surah = video.surahNumber
    ? `Surah ${video.surahName} (${video.surahNumber})`
    : `Surah ${video.surahName}`;
  if (video.ayahFrom && video.ayahTo && video.ayahFrom !== video.ayahTo) {
    return `${surah}, ayah ${video.ayahFrom}–${video.ayahTo}`;
  }
  if (video.ayahFrom) return `${surah}, ayah ${video.ayahFrom}`;
  return surah;
}

/** Seconds → ISO-8601 duration, which is what VideoObject expects. */
function isoDuration(seconds: number | null): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s ? `${s}S` : ""}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const video = await getVideo(id);

  if (!video) {
    return { title: "Video Not Found — Tibyaan Academy" };
  }

  const pageUrl = `${BASE_URL}/${locale}/videos/${id}`;
  const teacherName = video.teacherName || "Teacher";
  const recitation = recitationLabel(video);
  const description = [
    `Quran recitation by ${teacherName} on Tibyaan Academy`,
    recitation,
    video.description,
  ]
    .filter(Boolean)
    .join(" — ");

  return {
    title: `${video.title} — Tibyaan Academy`,
    description,
    openGraph: {
      ...openGraphBase(locale),
      title: video.title,
      description,
      url: pageUrl,
      siteName: "Tibyaan Academy",
      type: "video.other",
      ...(video.thumbnailUrl
        ? { images: [{ url: video.thumbnailUrl, width: 1280, height: 720, alt: video.title }] }
        : {}),
      videos: video.videoUrl
        ? [{ url: video.videoUrl, secureUrl: video.videoUrl, type: "video/mp4", width: 1280, height: 720 }]
        : undefined,
    },
    twitter: {
      card: video.thumbnailUrl ? "summary_large_image" : "summary",
      title: video.title,
      description,
      ...(video.thumbnailUrl ? { images: [video.thumbnailUrl] } : {}),
    },
    alternates: { canonical: pageUrl },
  };
}

export default async function VideoPage({ params }: Props) {
  const { locale, id } = await params;
  const video = await getVideo(id);

  if (!video) notFound();

  const teacherName = video.teacherName || "Teacher";
  const recitation = recitationLabel(video);
  const pageUrl = `${BASE_URL}/${locale}/videos/${id}`;

  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: [
      `Quran recitation by ${teacherName} on Tibyaan Academy`,
      recitation,
      video.description,
    ]
      .filter(Boolean)
      .join(" — "),
    thumbnailUrl: video.thumbnailUrl ? [video.thumbnailUrl] : undefined,
    uploadDate: video.createdAt.toISOString(),
    duration: isoDuration(video.duration),
    contentUrl: video.videoUrl,
    embedUrl: pageUrl,
    url: pageUrl,
    inLanguage: "ar",
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/WatchAction",
      userInteractionCount: video.viewCount,
    },
    creator: {
      "@type": "Person",
      name: teacherName,
    },
    publisher: {
      "@type": "Organization",
      name: "Tibyaan Academy",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icons/icon-512x512.svg`,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
      />
      {/* Top bar */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tibyaan Academy
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Video player */}
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
          <video
            src={video.videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full"
            preload="auto"
          />
        </div>

        {/* Info + share */}
        <div className="mt-6 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
              {video.title}
            </h1>
            {video.description && (
              <p className="mt-2 text-muted-foreground text-sm">{video.description}</p>
            )}
          </div>

          {/* Share button */}
          <VideoShareButtons
            videoId={id}
            title={video.title}
            teacherName={teacherName}
            className="shrink-0 mt-1"
          />
        </div>

        {/* Teacher + meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            {teacherName}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            {video.viewCount} views
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(video.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* What is being recited — real indexable text, not just a player. */}
        {recitation && (
          <div className="mt-6 flex items-start gap-3 p-4 rounded-xl border bg-muted/30">
            <BookOpen className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground">
                What is being recited
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{recitation}</p>
            </div>
          </div>
        )}

        {/* About the reciter */}
        <section className="mt-6 p-5 rounded-xl border bg-card">
          <h2 className="text-base font-semibold text-foreground">
            About {teacherName}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {video.teacherBio?.trim() ||
              `${teacherName} teaches Quran recitation and Tajweed with Tibyaan Academy, delivering live one-to-one lessons to students around the world.`}
          </p>

          {video.teacherYearsExperience ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {video.teacherYearsExperience} years of teaching experience.
            </p>
          ) : null}

          {video.teacherSpecializations && video.teacherSpecializations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {video.teacherSpecializations.map((spec) => (
                <span
                  key={spec}
                  className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          <Link
            href="/teachers"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            See all our teachers
          </Link>
        </section>

        {/* CTA */}
        <div className="mt-10 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-center">
          <p className="text-base font-semibold text-foreground">
            Learn Quran online with qualified teachers
          </p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Join Tibyaan Academy — 5-day free trial, no credit card required
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
