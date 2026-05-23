/**
 * Closed allowlist of email addresses permitted to sign in to the
 * private family site. Anyone signing in with another email is
 * immediately signed out by middleware.
 *
 * Stored as a constant rather than an env var so it's reviewable in
 * git history and survives env mishaps. Add or remove names by
 * committing a change to this file.
 */
export const ADMIN_EMAILS = new Set<string>([
  "antal.rajnak@bluewin.ch",
  "antal.rajnak@gmail.com",
  "viktoria.rajnak@gmail.com",
  "julia.rajnak@gmail.com",
  "susanna.rajnak@gmail.com",
  "davidvinkenroye@gmail.com",
])

export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.has(email.trim().toLowerCase())
}
