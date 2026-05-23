'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase-browser'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (password !== confirmPassword) {
      setErrorMessage('Please make sure your passwords match.')
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setSuccessMessage('Your password has been updated.')
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.',
      })

      router.push('/login')
    } catch (error) {
      console.error('Update password error:', error)
      const message = error instanceof Error ? error.message : 'Failed to update password'
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
            Choose a new <em className="italic" style={{ color: "var(--lingon-deep)" }}>password.</em>
          </h1>
          <p className="lede">Six characters or more, written down somewhere safe.</p>
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
              htmlFor="password"
              className="block font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-2"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full bg-cream border border-rule-soft px-4 py-3 font-serif text-[18px] text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-ink"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-2"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full bg-cream border border-rule-soft px-4 py-3 font-serif text-[18px] text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-ink"
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn w-full justify-center">
            {isLoading ? 'Updating password…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
