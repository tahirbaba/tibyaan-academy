"use client";

import { createBrowserClient } from "@supabase/ssr";
import { parse, serialize } from "cookie";
import { SESSION_ONLY_COOKIE, forSession } from "./remember";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // The same cookies Supabase writes by default, except that when the
      // person did not tick "Remember me" the refreshed session cookies are
      // written without a lifetime (see ./remember.ts).
      cookies: {
        getAll() {
          const all = parse(document.cookie);
          return Object.entries(all).map(([name, value]) => ({
            name,
            value: value ?? "",
          }));
        },
        setAll(cookiesToSet) {
          const sessionOnly = parse(document.cookie)[SESSION_ONLY_COOKIE] === "1";
          for (const { name, value, options } of cookiesToSet) {
            document.cookie = serialize(name, value, forSession(options, sessionOnly));
          }
        },
      },
    }
  );
}
