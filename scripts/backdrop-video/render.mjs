/**
 * Renders the generated backdrop videos (scene.html) to public/videos.
 *
 *   node scripts/backdrop-video/render.mjs            # all scenes
 *   node scripts/backdrop-video/render.mjs night-masjid
 *
 * Needs Playwright's Chromium and ffmpeg. Frames are drawn on a canvas,
 * screenshotted, and encoded to a silent H.264 MP4 (+ a WebP poster).
 */
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const out = path.join(root, "public/videos");
const FPS = 25;
const scenes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["night-masjid", "geometry-light", "geometry-dark"];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto("file://" + path.join(here, "scene.html"));
const loop = await page.evaluate(() => window.LOOP);

for (const scene of scenes) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `bd-${scene}-`));
  const frames = loop * FPS;
  for (let i = 0; i < frames; i++) {
    await page.evaluate(([s, t]) => window.draw(s, t), [scene, i / FPS]);
    await page.locator("#c").screenshot({ path: path.join(dir, `f${String(i).padStart(4, "0")}.png`) });
  }
  const mp4 = path.join(out, `bg-${scene}.mp4`);
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-framerate", String(FPS), "-i", path.join(dir, "f%04d.png"),
    "-c:v", "libx264", "-preset", "slow", "-crf", "28", "-pix_fmt", "yuv420p",
    "-profile:v", "high", "-movflags", "+faststart", "-an", mp4,
  ]);
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", path.join(dir, "f0000.png"),
    "-c:v", "libwebp", "-quality", "70", path.join(out, `bg-${scene}-poster.webp`),
  ]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`${scene}: ${frames} frames -> ${(fs.statSync(mp4).size / 1024).toFixed(0)} KB`);
}

await browser.close();
