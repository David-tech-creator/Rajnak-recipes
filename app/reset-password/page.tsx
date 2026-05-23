'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase-browser'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) throw error

      setSuccessMessage('Check your email — we have sent you a password reset link.')
      toast({
        title: 'Check your email',
        description: 'We have sent you a password reset link.',
      })
    } catch (error) {
      console.error('Reset password error:', error)
      const message = error instanceof Error ? error.message : 'Failed to send reset link'
      setErrorMessage(message)
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <div className="eyebrow eyebrow--lingon">No. — · Account</div>
          <h1 className="editorial-h1 mt-3 mb-3 font-normal">
            Reset your <em className="italic" style={{ color: "var(--lingon-deep)" }}>password.</em>
          </h1>
          <p className="lede">
            Tell us your email and we will send a link to set a new one.
          </p>
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

          <button type="submit" disabled={isLoading} className="btn w-full justify-center">
            {isLoading ? 'Sending reset link…' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-6 text-center font-serif italic text-ink-muted">
          Remembered it?{' '}
          <Link
            href="/login"
            className="text-lingon-deep underline decoration-1 underline-offset-4"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
