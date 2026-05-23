import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { signOut } from "@/app/login/actions"

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Middleware should keep us out if not signed in, but belt-and-braces.
  if (!user) redirect("/login")

  const email = user.email ?? ""
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <div className="eyebrow eyebrow--lingon">No. — · Account</div>
          <h1 className="editorial-h1 mt-3 mb-3 font-normal">
            My <em className="italic" style={{ color: "var(--lingon-deep)" }}>account</em>
          </h1>
          <p className="lede">A quiet shelf for your details.</p>
        </div>

        <div className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-10">
          <dl className="space-y-6">
            <div>
              <dt className="block font-serif-sc uppercase tracking-[0.22em] text-[12px] text-ink-muted mb-2">
                Email
              </dt>
              <dd className="font-serif text-[18px] text-ink break-all">{email}</dd>
            </div>

            {memberSince && (
              <div className="pt-6 border-t border-dotted border-rule-soft">
                <dt className="block font-serif-sc uppercase tracking-[0.22em] text-[12px] text-ink-muted mb-2">
                  Member since
                </dt>
                <dd className="font-serif text-[18px] text-ink">{memberSince}</dd>
              </div>
            )}
          </dl>

          <form action={signOut} className="mt-10 pt-8 border-t border-rule-soft">
            <button type="submit" className="btn w-full justify-center">
              Sign out
            </button>
            <p className="mt-4 text-center font-serif italic text-ink-muted text-[14px]">
              Forgot your password? Ask David to reset it.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
