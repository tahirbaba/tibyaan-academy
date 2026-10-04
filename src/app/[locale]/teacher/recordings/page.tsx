import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTeacherRecordings } from "@/lib/db/teacher-queries";
import { isRecordingPlayable } from "@/lib/recordings";
import { RecordingsClient } from "./recordings-client";

export default async function TeacherRecordingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  let recordings: Array<{
    id: string;
    studentName: string;
    available: boolean;
    duration: number | null;
    sessionDate: string;
    expiresAt: string;
  }> = [];

  try {
    const raw = await getTeacherRecordings(user.id);
    recordings = raw.map((r) => ({
      id: r.recording.id,
      studentName: r.student.fullName,
      // No raw key leaves here; playback goes through the play route. Available
      // until a few hours before the 3-day deletion.
      available: isRecordingPlayable(r.recording.expiresAt),
      duration: r.recording.duration,
      sessionDate: r.recording.sessionDate.toISOString(),
      expiresAt: r.recording.expiresAt.toISOString(),
    }));
  } catch (err) {
    console.error("Failed to load recordings:", err);
  }

  return <RecordingsClient recordings={recordings} />;
}
