import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_ONLY_COOKIE, forSession } from "./remember";

export async function updateSession(request: NextRequest, response: NextResponse) {
  const sessionOnly = request.cookies.get(SESSION_ONLY_COOKIE)?.value === "1";
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, forSession(options, sessionOnly));
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, supabase, response };
}
