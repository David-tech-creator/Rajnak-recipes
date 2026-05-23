"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Only allow same-origin relative paths so ?redirectTo=https://evil.com can't
// turn the login page into a phishing redirector. `//evil.com` is rejected too
// because browsers treat it as protocol-relative.
function safeRedirect(raw: string | null | undefined): string {
  if (!raw) return "/account"
  let candidate = raw
  try {
    candidate = decodeURIComponent(raw)
  } catch {
    return "/account"
  }
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return "/account"
  return candidate
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          return
        }

        setUser(session?.user ?? null)

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          setUser(session?.user ?? null)

          if (event === 'SIGNED_IN') {
            const target = safeRedirect(searchParams.get("redirectTo"))
            router.push(target)
            router.refresh()
          }

          if (event === 'SIGNED_OUT') {
            router.push('/login')
            router.refresh()
          }
        })

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Error checking auth session:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [router, searchParams])

  // Navigation is intentionally NOT done here — onAuthStateChange('SIGNED_IN')
  // owns the redirect so we don't fire two router.push calls in a row.
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.user) {
        setUser(data.user)
        toast({ title: "Welcome back!", description: "Successfully signed in." })
      }
    } catch (error) {
      console.error("Signin error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      })
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/login')
    } catch (error) {
      console.error("Signout error:", error)
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

