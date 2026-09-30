import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users, studentProfiles, parentReports } from "@/lib/db/schema";
import { eq, isNotNull } from "drizzle-orm";
import { generateWeeklyReport } from "@/lib/whatsapp/generate-report";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send-message";
import { withCron } from "@/lib/cron-auth";

// Cron endpoint: GET /api/parent-reports/weekly
// Runs every Sunday at 8 AM UTC
/**
 * Off unless PARENT_REPORTS_ENABLED is exactly "true".
 *
 * These reports send WhatsApp messages to real parents. Silent for four
 * months (the project-wide dashboard toggle); before they resume, the report
 * content and the recipient list need review — a wrong message to a parent
 * costs more than a week of silence. An env flag rather than the dashboard
 * toggle, which is project-wide. Unset means "does not send".
 * Takes effect only after the deploy whose build sees the variable.
 */
function reportsEnabled(): boolean {
  return process.env.PARENT_REPORTS_ENABLED === "true";
}

async function runWeeklyParentReports() {
  try {
    if (!reportsEnabled()) {
      return NextResponse.json({
        paused: true,
        message:
          "Weekly parent reports are paused. Set PARENT_REPORTS_ENABLED=true and redeploy to send.",
        sent: 0,
      });
    }

    const db = getDb();

    // Find all students with parent whatsapp numbers
    const students = await db
      .select({
        userId: studentProfiles.userId,
        parentWhatsapp: studentProfiles.parentWhatsapp,
      })
      .from(studentProfiles)
      .innerJoin(users, eq(studentProfiles.userId, users.id))
      .where(isNotNull(studentProfiles.parentWhatsapp));

    let sent = 0;
    let failed = 0;

    for (const student of students) {
      if (!student.parentWhatsapp) continue;

      try {
        const { reportData } = await generateWeeklyReport(student.userId);

        const sendResult = await sendWhatsAppMessage(
          student.parentWhatsapp,
          reportData.summary
        );

        await db.insert(parentReports).values({
          studentId: student.userId,
          parentWhatsapp: student.parentWhatsapp,
          reportData,
          status: sendResult.success ? "sent" : "failed",
          sentAt: sendResult.success ? new Date() : null,
        });

        if (sendResult.success) {
          sent++;
        } else {
          failed++;
        }
      } catch (err) {
        console.error(
          `Failed to send report for student ${student.userId}:`,
          err
        );
        failed++;
      }
    }

    return NextResponse.json({
      totalStudents: students.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error("Weekly reports cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withCron("/api/parent-reports/weekly", runWeeklyParentReports);
