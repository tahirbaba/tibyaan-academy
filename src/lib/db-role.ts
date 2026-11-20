import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireUser } from "@/lib/api-auth";

/**
 * Role guards that read the role from the `users` table.
 *
 * `requireAdmin` in api-auth.ts trusts `user_metadata.role`, which a signed-in
 * user can rewrite for themselves with `supabase.auth.updateUser`. Anything
 * that moves money or sets prices is guarded by the database role instead.
 */
type DbGuard =
  | { ok: true; user: { id: string; email?: string; role: string } }
  | { ok: false; response: NextResponse };

export async function requireDbRole(
  allowed: Array<"admin" | "teacher" | "student">
): Promise<DbGuard> {
  const session = await requireUser();
  if (!session.ok) return session;

  const db = getDb();
  const [row] = await db
    .select({ role: users.role, isBanned: users.isBanned })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!row || row.isBanned || !allowed.includes(row.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    ok: true,
    user: { id: session.user.id, email: session.user.email, role: row.role },
  };
}

export const requireDbAdmin = () => requireDbRole(["admin"]);
