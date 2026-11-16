import { ImageResponse } from "next/og";

/**
 * The picture shown when any page of the site is shared — on WhatsApp,
 * Facebook, X, LinkedIn, iMessage.
 *
 * Until now there was none. The root layout pointed at /og-image.png, a file
 * that does not exist, and every page that set its own Open Graph title
 * dropped even that reference, so a shared link showed a bare title with no
 * image. For an academy that grows by parents forwarding links to each other
 * on WhatsApp, that is the single most visible gap.
 *
 * One branded card for the whole site, drawn here (no image file to keep in
 * sync, no network request). The wording is Latin-script on every locale on
 * purpose: the renderer cannot shape Arabic or Urdu correctly (see
 * docs/dars-poster-arabic.md), and a broken ayah-style line on the academy's
 * own share card would be worse than an English one.
 */
export const alt = "Tibyaan Academy — Online Quran & Islamic Education";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function star(cx: number, cy: number, outer: number, inner: number): string {
  const points: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 8) * i - Math.PI / 2;
    points.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return points.join(" ");
}

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          background: "linear-gradient(135deg, #0F2922 0%, #1B4332 55%, #143528 100%)",
          color: "#FFFFFF",
          position: "relative",
        }}
      >
        <svg
          width="560"
          height="560"
          viewBox="0 0 560 560"
          style={{ position: "absolute", right: -90, top: 35 }}
        >
          <polygon points={star(280, 280, 270, 210)} fill="none" stroke="#C9A84C" strokeOpacity="0.35" strokeWidth="2" />
          <polygon points={star(280, 280, 200, 150)} fill="none" stroke="#C9A84C" strokeOpacity="0.55" strokeWidth="2" />
          <polygon points={star(280, 280, 120, 84)} fill="#C9A84C" fillOpacity="0.08" stroke="#C9A84C" strokeOpacity="0.9" strokeWidth="2.5" />
        </svg>

        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            border: "2px solid rgba(201,168,76,0.55)",
            borderRadius: 999,
            padding: "10px 26px",
            fontSize: 24,
            letterSpacing: 6,
            color: "#E3CE8A",
          }}
        >
          ONLINE ISLAMIC ACADEMY
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 780 }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 700, lineHeight: 1.05 }}>
            Tibyaan Academy
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 38, color: "rgba(255,255,255,0.86)", lineHeight: 1.3 }}>
            Quran, Hifz, Arabic & Islamic Sciences — live teachers with an AI Ustaz
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", fontSize: 28, color: "#E3CE8A" }}>
          <div style={{ display: "flex", width: 64, height: 3, background: "#C9A84C", marginRight: 20 }} />
          tibyaanacademy.com · 5-day free trial · 5 languages
        </div>
      </div>
    ),
    size
  );
}
