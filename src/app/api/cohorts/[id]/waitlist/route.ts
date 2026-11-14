import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { sendFailureAlert } from "@/lib/alerts";
import { joinWaitlist, leaveWaitlist } from "@/lib/cohorts/queries";

/** POST /api/cohorts/[id]/waitlist — join the waitlist of a full cohort. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  try {
    const result = await joinWaitlist(id, auth.user.id);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason },
        { status: result.reason === "not_found" ? 404 : 409 }
      );
    }
    return NextResponse.json({ position: result.position });
  } catch (error) {
    await sendFailureAlert({
      source: "/api/cohorts/[id]/waitlist POST",
      summary: "A student could not join a group class waitlist.",
      error,
      context: { cohortId: id, studentId: auth.user.id },
    });
    return NextResponse.json({ error: "waitlist_failed" }, { status: 500 });
  }
}

/** DELETE /api/cohorts/[id]/waitlist — leave the waitlist. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  try {
    const left = await leaveWaitlist(id, auth.user.id);
    if (!left) {
      return NextResponse.json({ error: "not_waitlisted" }, { status: 404 });
    }
    return NextResponse.json({ left: true });
  } catch (error) {
    await sendFailureAlert({
      source: "/api/cohorts/[id]/waitlist DELETE",
      summary: "A student could not leave a group class waitlist.",
      error,
      context: { cohortId: id, studentId: auth.user.id },
    });
    return NextResponse.json({ error: "waitlist_failed" }, { status: 500 });
  }
}
