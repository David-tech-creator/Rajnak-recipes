'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'
import { SprigDivider } from '@/components/sprig-divider'

interface UserStats {
  recipeCount: number
  eventCount: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchStats = async () => {
      try {
        const [recipesResponse, eventsResponse] = await Promise.all([
          supabase
            .from('recipes')
            .select('id', { count: 'exact' })
            .eq('created_by', user.id),
          supabase
            .from('family_events')
            .select('id', { count: 'exact' })
            .eq('created_by', user.id)
        ])

        setStats({
          recipeCount: recipesResponse.count || 0,
          eventCount: eventsResponse.count || 0
        })
      } catch (error) {
        console.error('Error fetching user stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [user, router])

  if (!user) return null

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">Your kitchen</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          Welcome <em className="italic" style={{ color: "var(--lingon-deep)" }}>back</em>
        </h1>
        <p className="lede">A small ledger of what you&rsquo;ve cooked up and gathered around.</p>
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="font-serif italic text-ink-muted text-lg">Loading…</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          <div className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8">
            <div className="eyebrow eyebrow--lingon mb-3">Your recipes</div>
            <p className="display-2 num">{stats?.recipeCount ?? 0}</p>
            <p className="text-ink-muted italic mt-2">Recipes you&rsquo;ve contributed</p>
            <button
              onClick={() => router.push('/recipes/create-new')}
              className="btn mt-6"
            >
              Add a new recipe
            </button>
          </div>

          <div className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8">
            <div className="eyebrow eyebrow--lingon mb-3">Family events</div>
            <p className="display-2 num">{stats?.eventCount ?? 0}</p>
            <p className="text-ink-muted italic mt-2">Gatherings you&rsquo;ve organized</p>
            <button
              onClick={() => router.push('/about/family-events/create')}
              className="btn mt-6"
            >
              Create a new event
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
