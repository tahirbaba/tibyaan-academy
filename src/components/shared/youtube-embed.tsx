"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * A YouTube URL, parsed.
 *
 * `isShort` matters for layout: a Short is filmed vertically (9:16) and an
 * embed forced into a 16:9 box shows it pillarboxed with black bars down both
 * sides. The caller uses this to pick the aspect ratio rather than guessing.
 */
export type ParsedYouTube = { id: string; isShort: boolean };

/**
 * Accepts the forms people actually paste:
 *   https://www.youtube.com/watch?v=ID
 *   https://youtu.be/ID
 *   https://www.youtube.com/shorts/ID     <- vertical
 *   https://www.youtube.com/embed/ID
 *   a bare 11-character video ID
 * Returns null for anything else, so a typo renders the empty state rather
 * than an iframe pointing at nothing.
 */
export function parseYouTubeUrl(input: string | undefined | null): ParsedYouTube | null {
  const raw = input?.trim();
  if (!raw) return null;

  const ID = /^[A-Za-z0-9_-]{11}$/;
  if (ID.test(raw)) return { id: raw, isShort: false };

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") {
    const id = parts[0];
    return id && ID.test(id) ? { id, isShort: false } : null;
  }

  if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "youtube-nocookie.com") {
    return null;
  }

  if (parts[0] === "watch") {
    const id = url.searchParams.get("v");
    return id && ID.test(id) ? { id, isShort: false } : null;
  }

  if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "v") {
    const id = parts[1];
    if (!id || !ID.test(id)) return null;
    return { id, isShort: parts[0] === "shorts" };
  }

  return null;
}

type Props = {
  /** Any YouTube URL, or a bare video ID. Invalid input renders nothing. */
  url: string | undefined | null;
  title: string;
  className?: string;
  /** Render the player immediately instead of behind a click-to-play poster. */
  autoLoad?: boolean;
};

/**
 * Click-to-play by default: the poster is a single ~15KB thumbnail, and the
 * YouTube iframe (which pulls well over a megabyte of player JS) is only
 * mounted once the visitor actually asks for the video. That keeps a video on
 * the home page from costing every visitor who never presses play.
 */
export function YouTubeEmbed({ url, title, className = "", autoLoad = false }: Props) {
  const video = parseYouTubeUrl(url);
  const [playing, setPlaying] = useState(autoLoad);

  if (!video) return null;

  const aspect = video.isShort ? "aspect-[9/16]" : "aspect-video";
  const frame = `relative w-full ${aspect} overflow-hidden rounded-2xl bg-black ${className}`;

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={title}
        className={`${frame} group cursor-pointer`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <span className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Play className="w-7 h-7 text-[#1B4332] translate-x-0.5" fill="currentColor" />
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className={frame}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}
