"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { signIn, signUp } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const redirectTo = searchParams.get("redirectTo") || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.")
      return
    }

    setIsLoading(true)
    try {
      if (mode === "signin") {
        await signIn(email, password)
      } else {
        await signUp(email, password)
        setSuccessMessage("Account created. Please check your email to verify your account.")
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        })
      }
    } catch (error) {
      console.error("Auth error:", error)
      const message = error instanceof Error ? error.message : "An error occurred"
      setErrorMessage(message)
      toast({
        title: "Authentication error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isSignIn = mode === "signin"

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <div className="eyebrow eyebrow--lingon">No. — · Account</div>
          <h1 className="editorial-h1 mt-3 mb-3 font-normal">
            {isSignIn ? (
              <>
                Welcome <em className="italic" style={{ color: "var(--lingon-deep)" }}>back.</em>
              </>
            ) : (
              <>
                Pull up a <em className="italic" style={{ color: "var(--lingon-deep)" }}>chair.</em>
              </>
            )}
          </h1>
          <p className="lede">
            {isSignIn
              ? "Sign in to share family memories and save the dishes you love."
              : "Create an account to gather recipes alongside the family."}
          </p>
        </div>

        <div className="flex border-b border-rule-soft mb-8">
          <button
            type="button"
            onClick={() => {
              setMode("signin")
              setErrorMessage(null)
              setSuccessMessage(null)
            }}
            className={`flex-1 pb-3 font-serif-sc uppercase tracking-[0.22em] text-[12px] transition-colors ${
              isSignIn
                ? "text-ink border-b-2 border-ink -mb-px"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup")
              setErrorMessage(null)
              setSuccessMessage(null)
            }}
            className={`flex-1 pb-3 font-serif-sc uppercase tracking-[0.22em] text-[12px] transition-colors ${
              !isSignIn
                ? "text-ink border-b-2 border-ink -mb-px"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Create account
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 bg-lingon-soft/30 border border-lingon text-lingon-deep px-5 py-4 font-serif italic">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-sage/10 border border-sage text-forest px-5 py-4 font-serif italic">
            {successMessage}
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
              minLength={isSignIn ? undefined : 6}
              autoComplete={isSignIn ? "current-password" : "new-password"}
              className="w-full bg-cream border border-rule-soft px-4 py-3 font-serif text-[18px] text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-ink"
            />
          </div>

          {isSignIn && (
            <div className="text-right">
              <Link
                href="/reset-password"
                className="font-serif italic text-ink-muted hover:text-lingon-deep underline decoration-1 underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="btn w-full justify-center">
            {isLoading
              ? isSignIn
                ? "Signing in…"
                : "Creating account…"
              : isSignIn
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center font-serif italic text-ink-muted">
          {isSignIn ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup")
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className="text-lingon-deep underline decoration-1 underline-offset-4"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin")
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className="text-lingon-deep underline decoration-1 underline-offset-4"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
