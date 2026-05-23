import { signIn } from "./actions"

// Never cache the login page at the CDN — it needs to read fresh searchParams
// (?error=, ?redirectTo=) and Vercel was happily HIT-ing a stale shell.
export const dynamic = "force-dynamic"

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed":
    "This site is for the Rajnak family. Sign in with one of the registered family email addresses.",
  invalid: "That email or password didn't work. Try again.",
  missing: "Please enter both email and password.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string }>
}) {
  const sp = await searchParams
  const errorMessage = sp.error ? ERROR_MESSAGES[sp.error] ?? null : null
  const redirectTo = sp.redirectTo ?? "/"

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <div className="eyebrow eyebrow--lingon">The Rajnak Family</div>
          <h1 className="editorial-h1 mt-3 mb-3 font-normal">
            Welcome{" "}
            <em className="italic" style={{ color: "var(--lingon-deep)" }}>
              home.
            </em>
          </h1>
          <p className="lede">A private collection. Sign in with your family email.</p>
        </div>

        {errorMessage && (
          <div className="mb-6 bg-lingon-soft/30 border border-lingon text-lingon-deep px-5 py-4 font-serif italic">
            {errorMessage}
          </div>
        )}

        <form
          action={signIn}
          className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-10 space-y-6"
        >
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div>
            <label
              htmlFor="email"
              className="block font-serif-sc uppercase tracking-[0.22em] text-[12px] text-ink-muted mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full bg-cream border border-rule-soft px-4 py-3 font-serif text-[18px] text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-ink"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-serif-sc uppercase tracking-[0.22em] text-[12px] text-ink-muted mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full bg-cream border border-rule-soft px-4 py-3 font-serif text-[18px] text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-ink"
            />
          </div>

          <button type="submit" className="btn w-full justify-center">
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center font-serif italic text-ink-muted text-[15px]">
          Forgot your password? Ask David to reset it.
        </p>
      </div>
    </div>
  )
}
