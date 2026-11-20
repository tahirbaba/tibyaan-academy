import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getDashboardPath } from "@/lib/auth/get-dashboard-path";
import { getUserById } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const locale = searchParams.get("locale") || "ur";
  // Only one follow-on page is allowed, by name — never a URL from the query
  // string, which would make this an open redirect.
  const next = searchParams.get("next") === "reset-password" ? "reset-password" : null;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && next === "reset-password") {
        return NextResponse.redirect(new URL(`/${locale}/reset-password`, origin));
      }

      if (user) {
        const metadataRole = user.user_metadata?.role as string | undefined;

        // Check if user exists in our DB (completed onboarding)
        const dbUser = await getUserById(user.id).catch(() => null);

        if (!dbUser && user.user_metadata?.needs_onboarding !== false) {
          // New user — send to onboarding
          return NextResponse.redirect(
            new URL(`/${locale}/onboarding`, origin)
          );
        }

        // Sync role from Neon DB to Supabase metadata (same as login)
        const dbRole = dbUser?.role;
        if (dbRole && dbRole !== metadataRole) {
          await supabase.auth.updateUser({
            data: { role: dbRole, needs_onboarding: false },
          });
        } else if (user.user_metadata?.needs_onboarding !== false) {
          await supabase.auth.updateUser({
            data: { needs_onboarding: false },
          });
        }

        const dashboardPath = await getDashboardPath(
          user.id,
          locale,
          dbRole || metadataRole
        );
        return NextResponse.redirect(new URL(dashboardPath, origin));
      }
    }
  }

  // Auth error — redirect to login
  return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
}
