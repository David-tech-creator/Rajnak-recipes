"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function AccountPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user) {
      setEmail(user.email || "")
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign out",
        variant: "destructive",
      })
      setIsSigningOut(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <p className="font-serif italic text-ink-muted">Loading…</p>
      </div>
    )
  }

  if (!user) return null

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
              <dt className="block font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-2">
                Email
              </dt>
              <dd className="font-serif text-[18px] text-ink break-all">{email}</dd>
            </div>

            {memberSince && (
              <div className="pt-6 border-t border-dotted border-rule-soft">
                <dt className="block font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-2">
                  Member since
                </dt>
                <dd className="font-serif text-[18px] text-ink">{memberSince}</dd>
              </div>
            )}
          </dl>

          <div className="mt-10 pt-8 border-t border-rule-soft flex flex-col sm:flex-row gap-4">
            <Link href="/reset-password" className="btn btn--ghost flex-1 justify-center">
              Change password
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="btn flex-1 justify-center"
            >
              {isSigningOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
