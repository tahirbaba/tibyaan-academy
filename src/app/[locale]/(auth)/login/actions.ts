"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { SESSION_ONLY_COOKIE } from "@/lib/supabase/remember";
import { SITE_URL } from "@/lib/site-config";
import { getDashboardPath } from "@/lib/auth/get-dashboard-path";
import { getUserById } from "@/lib/db/queries";

/**
 * Record the "Remember me" choice BEFORE the session cookies are written, so
 * the client created afterwards writes them with or without a lifetime.
 */
async function setRemember(remember: boolean) {
  const store = await cookies();
  if (remember) {
    store.delete(SESSION_ONLY_COOKIE);
  } else {
    // No maxAge: this marker lives exactly as long as the browser session.
    store.set(SESSION_ONLY_COOKIE, "1", { path: "/", sameSite: "lax" });
  }
}

export async function loginWithEmail(formData: FormData) {
  await setRemember(formData.get("remember") === "on");
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const locale = formData.get("locale") as string;

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const dbUser = await getUserById(data.user.id).catch(() => null);

  // A disabled account cannot sign in. The flag was displayed and set for
  // months but enforced nowhere — "banned" users signed in normally. Enforced
  // here now: authenticate first (so we never reveal whether an email exists
  // to a wrong password), then refuse a banned account and drop the session.
  if (dbUser?.isBanned) {
    await supabase.auth.signOut();
    return {
      error:
        "This account has been disabled. If you think this is a mistake, please contact support.",
    };
  }

  // Sync role from Neon DB to Supabase metadata
  // This ensures proxy.ts always has the correct role
  const dbRole = dbUser?.role;
  const metadataRole = data.user.user_metadata?.role as string | undefined;

  if (dbRole && dbRole !== metadataRole) {
    await supabase.auth.updateUser({
      data: { role: dbRole, needs_onboarding: false },
    });
  } else if (data.user.user_metadata?.needs_onboarding !== false) {
    await supabase.auth.updateUser({
      data: { needs_onboarding: false },
    });
  }

  const dashboardPath = await getDashboardPath(
    data.user.id,
    locale,
    dbRole || metadataRole
  );
  redirect(dashboardPath);
}

export async function loginWithGoogle(locale: string, remember = true) {
  await setRemember(remember);
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || SITE_URL;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback?locale=${locale}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

/**
 * Send a password-reset email. The link in it comes back through
 * /api/auth/callback, which signs the person in and sends them to
 * /reset-password to choose a new password.
 *
 * The answer is the same whether or not the address has an account, so the
 * form cannot be used to find out who studies here. A failure to SEND is
 * still reported as a failure — never as "email sent".
 */
export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const locale = String(formData.get("locale") ?? "en");
  if (!email) return { error: "missing_email" as const };

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || SITE_URL;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/callback?locale=${locale}&next=reset-password`,
  });

  if (error) {
    // Supabase answers an unknown address without error; an error here is a
    // real failure (rate limit, mail provider), so say so.
    const rateLimited = /rate|too many|seconds/i.test(error.message);
    return { error: rateLimited ? ("rate_limited" as const) : ("send_failed" as const) };
  }
  return { ok: true as const };
}
