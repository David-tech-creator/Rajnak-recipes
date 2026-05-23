"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-browser"
import { SprigDivider } from "@/components/sprig-divider"

interface DashboardStats {
  totalRecipes: number
  totalUsers: number
}

export default function AdminDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    async function fetchStats() {
      try {
        const [recipesCount, usersCount] = await Promise.all([
          supabase.from('recipes').select('*', { count: 'exact' }),
          supabase.from('users').select('*', { count: 'exact' })
        ])

        setStats({
          totalRecipes: recipesCount.count || 0,
          totalUsers: usersCount.count || 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user, loading, router])

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <p className="font-serif italic text-ink-muted text-lg">Loading…</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">Administration</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          Admin <em className="italic" style={{ color: "var(--lingon-deep)" }}>dashboard</em>
        </h1>
        <p className="lede">A quiet ledger of the cookbook&rsquo;s contents and contributors.</p>
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        <div className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8">
          <div className="eyebrow eyebrow--lingon mb-3">Total recipes</div>
          <p className="display-2 num">{stats?.totalRecipes ?? 0}</p>
          <p className="text-ink-muted italic mt-2">Across every drawer and category</p>
        </div>
        <div className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8">
          <div className="eyebrow eyebrow--lingon mb-3">Total users</div>
          <p className="display-2 num">{stats?.totalUsers ?? 0}</p>
          <p className="text-ink-muted italic mt-2">Family members with an account</p>
        </div>
      </div>
    </div>
  )
}
