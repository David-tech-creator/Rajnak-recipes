'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'

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
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Recipes</CardTitle>
              <CardDescription>
                Manage your contributed recipes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">{stats?.recipeCount}</p>
              <Button onClick={() => router.push('/recipes/create-new')}>
                Add New Recipe
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Family Events</CardTitle>
              <CardDescription>
                Events you've organized
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">{stats?.eventCount}</p>
              <Button onClick={() => router.push('/about/family-events/create')}>
                Create New Event
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 