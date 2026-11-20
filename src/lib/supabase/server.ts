import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SESSION_ONLY_COOKIE, forSession } from "./remember";

export async function createClient() {
  const cookieStore = await cookies();
  const sessionOnly = cookieStore.get(SESSION_ONLY_COOKIE)?.value === "1";

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, forSession(options, sessionOnly))
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
