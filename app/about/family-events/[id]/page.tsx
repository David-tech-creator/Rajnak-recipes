"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { PhotoGallery } from "@/components/family-gallery/photo-gallery"
import { SprigDivider } from "@/components/sprig-divider"
import type { FamilyEvent } from "@/lib/types/family"

export default function EventPage() {
  const params = useParams()
  const { toast } = useToast()
  const [event, setEvent] = useState<FamilyEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchEvent() {
      try {
        // The URL param is the event slug (e.g. "gravlax-sunday"); older links
        // may still carry the UUID, so fall back to id when it looks like one.
        const param = String(params.id)
        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param)
        const { data, error } = await supabase
          .from("family_events")
          .select("*")
          .eq(isUuid ? "id" : "slug", param)
          .single()

        if (error) throw error
        setEvent(data)
      } catch (error) {
        console.error("Error fetching event:", error)
        toast({
          title: "Error",
          description: "Failed to load event details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchEvent()
    }
  }, [params.id, toast])

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-16">
        <p className="text-center font-serif italic text-ink-muted text-lg py-12">
          Loading event&hellip;
        </p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="eyebrow eyebrow--lingon">Album not found</div>
          <h1 className="editorial-h1 mt-3 mb-4 font-normal">
            We can&apos;t find that event.
          </h1>
          <p className="lede">It may have been removed, or the link is from another season.</p>
          <SprigDivider variant="berry" className="!mt-10 !mb-8 max-w-sm mx-auto" />
          <Link href="/about/family-events" className="btn">
            Back to events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">
          {event.event_type ? event.event_type.replace(/-/g, " ") : "Family album"}
        </div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">{event.title}</h1>
        {event.description && (
          <p className="lede">{event.description}</p>
        )}

        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-6 font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted">
          <span>{format(new Date(event.date), "PPP")}</span>
          {event.location && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{event.location}</span>
            </>
          )}
        </div>

        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      <div className="max-w-5xl mx-auto flex items-center justify-between mb-8">
        <Link href="/about/family-events" className="btn btn--link">
          &larr; All events
        </Link>
        <Link
          href={`/about/family-events/${event.id}/edit`}
          className="btn btn--ghost"
        >
          Edit event
        </Link>
      </div>

      <div className="max-w-5xl mx-auto">
        <PhotoGallery eventId={event.id} />
      </div>
    </div>
  )
}
