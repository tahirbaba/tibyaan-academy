import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client with the service-role key, for admin auth
 * operations (reading/writing a user's auth metadata). Never import this into
 * anything that reaches the browser.
 */
function adminAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Mirror the disabled flag into the user's Supabase auth metadata.
 *
 * The middleware reads user_metadata on every request with no database query,
 * so mirroring is_banned here is what lets a disabled account be blocked at the
 * edge for an already-open session — not only at the next login. Best-effort:
 * a failure here must not fail the ban itself (the DB flag is the source of
 * truth and the login check reads it directly), so it is reported, not thrown.
 */
export async function setAuthDisabledFlag(userId: string, disabled: boolean): Promise<boolean> {
  try {
    const supabase = adminAuthClient();
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { disabled },
    });
    if (error) {
      console.error(`[admin] could not set disabled=${disabled} on auth metadata for ${userId}:`, error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[admin] setAuthDisabledFlag failed:", e);
    return false;
  }
}
