import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users, teacherVideos } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AdminVideosClient } from "./admin-videos-client";

export default async function AdminVideosPage({
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

  // Verify admin
  const db = getDb();
  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!dbUser[0] || dbUser[0].role !== "admin") redirect(`/${locale}`);

  let videos: Array<{
    id: string;
    title: string;
    description: string | null;
    videoUrl: string;
    status: string;
    adminNotes: string | null;
    isPublic: boolean;
    viewCount: number;
    createdAt: string;
    teacherName: string;
    teacherEmail: string;
  }> = [];

  try {
    const rows = await db
      .select({
        video: teacherVideos,
        teacher: users,
      })
      .from(teacherVideos)
      .innerJoin(users, eq(teacherVideos.teacherId, users.id))
      .orderBy(desc(teacherVideos.createdAt));

    videos = rows.map((r) => ({
      id: r.video.id,
      title: r.video.title,
      description: r.video.description,
      videoUrl: r.video.videoUrl,
      status: r.video.status,
      adminNotes: r.video.adminNotes,
      isPublic: r.video.isPublic,
      viewCount: r.video.viewCount,
      createdAt: r.video.createdAt.toISOString(),
      teacherName: r.teacher.fullName,
      teacherEmail: r.teacher.email,
    }));
  } catch (err) {
    console.error("Failed to load videos for admin:", err);
  }

  // Teachers for the add-by-link picker (admin adds a video on a teacher's behalf).
  let teachers: { id: string; fullName: string }[] = [];
  try {
    teachers = await db
      .select({ id: users.id, fullName: users.fullName })
      .from(users)
      .where(eq(users.role, "teacher"))
      .orderBy(users.fullName);
  } catch (err) {
    console.error("Failed to load teachers for admin video form:", err);
  }

  return <AdminVideosClient videos={videos} teachers={teachers} />;
}
