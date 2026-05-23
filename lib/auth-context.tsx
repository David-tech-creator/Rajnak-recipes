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

        // We only listen for SIGNED_OUT here. SIGNED_IN navigation is handled
        // by signIn() itself with a hard browser navigation so the cookies the
        // browser client just wrote are guaranteed to be sent on the next
        // request — router.push() can race ahead of the cookie commit.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          setUser(session?.user ?? null)

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
  }, [router])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.user) {
        setUser(data.user)
        toast({ title: "Welcome back!", description: "Successfully signed in." })
        // Hard navigation, not router.push. Forces a full page reload so the
        // session cookies just written by @supabase/ssr are sent on the next
        // request and middleware reads them. router.push doesn't wait for
        // document.cookie writes to commit and can race.
        const target = safeRedirect(searchParams.get("redirectTo"))
        window.location.href = target
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
      // Hard navigation so the cleared cookies stick on the next page load.
      window.location.href = '/login'
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

