import { NextResponse } from "next/server";
import { getUpcomingReminders, getCircleEnrolledStudents } from "@/lib/db/dars-circle-queries";
import { MAIL_FROM } from "@/lib/site-config";
import { withCron } from "@/lib/cron-auth";

/**
 * GET /api/dars-circles/reminders — Cron endpoint
 * Find circles starting within 1 hour and send email reminders to enrolled students.
 */
/**
 * Off unless DARS_CIRCLE_REMINDERS_ENABLED is exactly "true".
 *
 * These reminders send email to real students. The cron was disabled for four
 * months (the project-wide dashboard toggle), so before it sends again the
 * content and recipients need review. An env flag, not the dashboard toggle,
 * because the toggle is project-wide and would also stop dars and blog.
 * Unset means "does not send"; the job runs and reports that it is paused.
 * Takes effect only after the deploy whose build sees the variable.
 */
function remindersEnabled(): boolean {
  return process.env.DARS_CIRCLE_REMINDERS_ENABLED === "true";
}

async function runCircleReminders() {
  try {
    if (!remindersEnabled()) {
      return NextResponse.json({
        paused: true,
        message:
          "Dars-circle reminders are paused. Set DARS_CIRCLE_REMINDERS_ENABLED=true and redeploy to send.",
        count: 0,
      });
    }

    const upcomingCircles = await getUpcomingReminders();

    if (upcomingCircles.length === 0) {
      return NextResponse.json({
        message: "No upcoming circles",
        count: 0,
      });
    }

    const apiKey = process.env.RESEND_API_KEY;
    let emailsSent = 0;

    for (const { circle, teacher } of upcomingCircles) {
      const circleTitle = circle.titleEn || circle.titleUr || "Dars Circle";
      const scheduledTime = circle.scheduledAt.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      // Get enrolled students
      const students = await getCircleEnrolledStudents(circle.id);

      if (students.length === 0) continue;

      // Send email reminders via Resend
      if (apiKey) {
        for (const student of students) {
          try {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: MAIL_FROM,
                to: [student.email],
                subject: `Reminder: "${circleTitle}" starts soon`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #15803d;">Dars Circle Reminder</h2>
                    <p>Assalamu Alaikum ${student.fullName || "Student"},</p>
                    <p>Your dars circle <strong>"${circleTitle}"</strong> is starting soon!</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                      <tr>
                        <td style="padding: 8px; font-weight: bold; color: #666;">Teacher</td>
                        <td style="padding: 8px;">${teacher.fullName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; font-weight: bold; color: #666;">Time</td>
                        <td style="padding: 8px;">${scheduledTime}</td>
                      </tr>
                      ${circle.meetingLink ? `
                      <tr>
                        <td style="padding: 8px; font-weight: bold; color: #666;">Link</td>
                        <td style="padding: 8px;"><a href="${circle.meetingLink}" style="color: #15803d;">Join Meeting</a></td>
                      </tr>` : ""}
                    </table>
                    <p style="margin-top: 16px; color: #999; font-size: 12px;">
                      Tibyaan Academy — Modern Digital Madrasah
                    </p>
                  </div>
                `,
              }),
            });
            emailsSent++;
          } catch (emailErr) {
            console.error(`[dars-circle-reminders] Email failed for ${student.email}:`, emailErr);
          }
        }
      }

      console.log(
        `[dars-circle-reminders] Circle "${circleTitle}" — sent ${students.length} reminders`
      );
    }

    return NextResponse.json({
      message: `Processed ${upcomingCircles.length} circle(s), sent ${emailsSent} emails`,
      count: upcomingCircles.length,
      emailsSent,
      circles: upcomingCircles.map(({ circle, teacher }) => ({
        id: circle.id,
        title: circle.titleEn || circle.titleUr,
        teacher: teacher.fullName,
        scheduledAt: circle.scheduledAt.toISOString(),
        currentStudents: circle.currentStudents,
      })),
    });
  } catch (error) {
    console.error("[dars-circle-reminders] Error:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}

export const GET = withCron("/api/dars-circles/reminders", runCircleReminders);
