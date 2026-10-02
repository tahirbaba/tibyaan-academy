"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SITE_URL } from "@/lib/site-config";
import { getDashboardPath } from "@/lib/auth/get-dashboard-path";
import { getUserById } from "@/lib/db/queries";

export async function loginWithEmail(formData: FormData) {
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

export async function loginWithGoogle(locale: string) {
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
