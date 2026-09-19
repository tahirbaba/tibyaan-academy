import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { classRecordings } from "@/lib/db/schema";
import { and, eq, lte } from "drizzle-orm";
import { deleteFromStorage } from "@/lib/r2/client";
import { withCron } from "@/lib/cron-auth";

/**
 * GET /api/recordings/cleanup — Vercel Cron, daily at midnight UTC.
 *
 * PAUSED BY DEFAULT. The deletion is destructive: it removes the file from
 * Supabase Storage permanently and there is no backup of that bucket. Teacher
 * uploads were unreachable by students until the recordings pages were merged,
 * so recordings were being destroyed 30 days after a session that the student
 * was never able to watch.
 *
 * While paused the job still runs and still reports what it WOULD delete, so
 * the expiry backlog stays visible. It simply deletes nothing.
 *
 * To turn deletion back on:
 *   1. Set RECORDINGS_CLEANUP_ENABLED=true in Vercel (Production).
 *   2. Redeploy — a function keeps the environment it was deployed with, so the
 *      variable does not take effect until the next deployment.
 * To pause it again, set it to anything else, or remove it.
 */

function deletionEnabled(): boolean {
  return process.env.RECORDINGS_CLEANUP_ENABLED === "true";
}

async function runRecordingsCleanup() {
  const db = getDb();
  const now = new Date();

  const expired = await db
    .select()
    .from(classRecordings)
    .where(
      and(
        lte(classRecordings.expiresAt, now),
        eq(classRecordings.isDeletedBySystem, false)
      )
    );

  if (!deletionEnabled()) {
    // Paused: report the backlog, destroy nothing, change nothing.
    console.warn(
      `[recordings-cleanup] PAUSED — ${expired.length} recording(s) are past their ` +
        `expiry and would have been deleted. Set RECORDINGS_CLEANUP_ENABLED=true ` +
        `and redeploy to resume.`
    );
    return NextResponse.json({
      paused: true,
      wouldDelete: expired.length,
      deleted: 0,
      message:
        "Deletion is paused. Set RECORDINGS_CLEANUP_ENABLED=true and redeploy to resume.",
    });
  }

  let deletedCount = 0;
  const errors: string[] = [];

  for (const recording of expired) {
    try {
      const url = new URL(recording.recordingUrl);
      const pathParts = url.pathname.split("/storage/v1/object/public/recordings/");
      const key = pathParts[1] || url.pathname.replace(/^\//, "");

      if (key) {
        await deleteFromStorage(key, "recordings");
      }

      await db
        .update(classRecordings)
        .set({ isDeletedBySystem: true })
        .where(eq(classRecordings.id, recording.id));

      deletedCount++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      errors.push(`${recording.id}: ${msg}`);
      // NOTE: previously the row was marked deleted even when the storage delete
      // failed, which hid the failure and made the row unrecoverable in the UI
      // while the file was still present. Leave the row alone and report instead.
    }
  }

  return NextResponse.json({
    paused: false,
    found: expired.length,
    deleted: deletedCount,
    errors: errors.length > 0 ? errors : undefined,
  });
}

export const GET = withCron("/api/recordings/cleanup", runRecordingsCleanup);
