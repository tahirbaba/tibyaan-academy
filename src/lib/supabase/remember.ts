/**
 * "Remember me".
 *
 * Supabase keeps a signed-in session in cookies that live for 400 days, and
 * it always sets that lifetime itself — its cookieOptions cannot shorten it.
 * When a person signs in WITHOUT ticking "Remember me", a small marker cookie
 * is set, and every place that writes the session cookies (server actions,
 * the middleware that refreshes the session, and the browser client) drops
 * the lifetime from them. Cookies with no lifetime are "session cookies": the
 * browser deletes them when it is closed, so the person is signed out.
 *
 * The marker is itself a session cookie, so it disappears at the same moment.
 */
export const SESSION_ONLY_COOKIE = "tb_session_only";

type CookieOpts = { maxAge?: number; expires?: Date | number | string } & Record<
  string,
  unknown
>;

/** Remove the lifetime from a cookie's options when the session is not remembered. */
export function forSession<T extends CookieOpts | undefined>(
  options: T,
  sessionOnly: boolean
): T {
  if (!sessionOnly || !options) return options;
  // A cookie being deleted (maxAge 0) must keep its maxAge, or it would not be deleted.
  if (options.maxAge === 0) return options;
  const rest = { ...options };
  delete rest.maxAge;
  delete rest.expires;
  return rest as T;
}
