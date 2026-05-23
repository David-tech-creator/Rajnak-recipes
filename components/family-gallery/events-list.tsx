"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import type { FamilyEvent } from "@/lib/types/family"

export function EventsList() {
  const [events, setEvents] = useState<FamilyEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("family_events")
          .select("*")
          .order("date", { ascending: false })

        if (error) throw error

        setEvents(data || [])
      } catch (err) {
        console.error("Error fetching events:", err)
        setError(err instanceof Error ? err.message : "Failed to load events")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleCreateEvent = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create an event",
        variant: "destructive",
      })
      return
    }
    router.push("/about/family-events/create")
  }

  if (isLoading) {
    return (
      <p className="text-center font-serif italic text-ink-muted text-lg py-12">
        Gathering the events&hellip;
      </p>
    )
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div className="eyebrow eyebrow--lingon">The Albums</div>
        <button onClick={handleCreateEvent} className="btn">
          Create event
        </button>
      </div>

      {error ? (
        <p className="text-center font-serif italic text-ink-muted text-lg py-12">
          The albums are resting. Check back shortly.
        </p>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-cream border border-rule-soft shadow-[var(--paper-shadow)] px-6">
          <p className="font-serif italic text-ink-muted text-lg">
            No events yet. The family is still gathering.
          </p>
          {user && (
            <button onClick={handleCreateEvent} className="btn btn--ghost mt-8">
              Start the first album
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/about/family-events/${event.id}`}
              className="recipe-card block"
            >
              <div className="aspect-[4/5] relative overflow-hidden bg-parchment-deep flex items-center justify-center">
                <span className="font-serif italic text-ink-muted text-base px-6 text-center">
                  {event.location || format(new Date(event.date), "MMMM yyyy")}
                </span>
              </div>
              <div className="py-5 text-center px-4">
                <div className="font-serif-sc uppercase tracking-[0.26em] text-[10px] text-ink-muted mb-1">
                  {event.event_type ? event.event_type.replace(/-/g, " ") : format(new Date(event.date), "PPP")}
                </div>
                <h3 className="recipe-card-title">{event.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
