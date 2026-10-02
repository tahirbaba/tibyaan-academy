import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users, emailEvents } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { EmailDeliveryClient } from "./email-delivery-client";

/**
 * Who got their verification email, and who didn't. The admin can see delivery
 * at a glance here rather than inferring it from a student's silence.
 */
export default async function EmailDeliveryPage({
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

  const db = getDb();
  const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  if (!dbUser || dbUser.role !== "admin") redirect(`/${locale}`);

  // Not wrapped in a swallowing try/catch: if this query fails the page should
  // error (and the error boundary show), not render a false "nothing to see".
  const rows = await db
    .select({
      id: emailEvents.id,
      recipient: emailEvents.recipient,
      type: emailEvents.type,
      status: emailEvents.status,
      detail: emailEvents.detail,
      createdAt: emailEvents.createdAt,
      updatedAt: emailEvents.updatedAt,
    })
    .from(emailEvents)
    .orderBy(desc(emailEvents.createdAt))
    .limit(200);

  const events = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return <EmailDeliveryClient events={events} />;
}
