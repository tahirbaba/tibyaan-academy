/**
 * YouTube URL parsing — pure, no React — so both the client embed and
 * server-side routes (validating a pasted link) can use it.
 *
 * `isShort` matters for layout: a Short is filmed vertically (9:16); forced into
 * a 16:9 box it shows pillarboxed. The caller picks the aspect ratio from this.
 */
export type ParsedYouTube = { id: string; isShort: boolean };

/**
 * Accepts the forms people actually paste:
 *   https://www.youtube.com/watch?v=ID
 *   https://youtu.be/ID
 *   https://www.youtube.com/shorts/ID     <- vertical
 *   https://www.youtube.com/embed/ID
 *   a bare 11-character video ID
 * Returns null for anything else, so a typo is rejected rather than stored as a
 * link that embeds nothing.
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
