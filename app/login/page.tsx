"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { signIn } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("error") === "not-allowed") {
      setErrorMessage("This site is for the Rajnak family. Sign in with one of the registered family email addresses.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.")
      return
    }

    setIsLoading(true)
    try {
      await signIn(email.trim().toLowerCase(), password)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign-in failed"
      setErrorMessage(message)
      toast({
        title: "Sign-in error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <div className="eyebrow eyebrow--lingon">The Rajnak Family</div>
          <h1 className="editorial-h1 mt-3 mb-3 font-normal">
            Welcome <em className="italic" style={{ color: "var(--lingon-deep)" }}>home.</em>
          </h1>
          <p className="lede">
            A private collection. Sign in with your family email.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 bg-lingon-soft/30 border border-lingon text-lingon-deep px-5 py-4 font-serif italic">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-10 space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="block font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-cream border border-rule-soft px-4 py-3 font-serif text-[18px] text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-ink"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-cream border border-rule-soft px-4 py-3 font-serif text-[18px] text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-ink"
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn w-full justify-center">
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center font-serif italic text-ink-muted text-[15px]">
          Forgot your password? Ask David to reset it.
        </p>
      </div>
    </div>
  )
}
