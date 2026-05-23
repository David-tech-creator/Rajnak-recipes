"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { PhotoUploader } from "./photo-uploader"
import { PhotoGrid } from "./photo-grid"
import { SprigDivider } from "@/components/sprig-divider"
import { format } from "date-fns"
import type { FamilyEvent, FamilyPhoto } from "@/lib/types/family"

interface EventGalleryProps {
  eventId: string
}

export function EventGallery({ eventId }: EventGalleryProps) {
  const [event, setEvent] = useState<FamilyEvent | null>(null)
  const [photos, setPhotos] = useState<FamilyPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchEventAndPhotos() {
      setIsLoading(true)
      try {
        const { data: eventData, error: eventError } = await supabase
          .from("family_events")
          .select("*")
          .eq("id", eventId)
          .single()

        if (eventError) throw eventError

        setEvent(eventData)

        const { data: photoData, error: photoError } = await supabase
          .from("family_photos")
          .select("*")
          .eq("event_id", eventId)
          .order("date", { ascending: false })

        if (photoError) throw photoError

        setPhotos(photoData || [])
      } catch (error) {
        console.error("Error fetching event data:", error)
        toast({
          title: "Error",
          description: "Failed to load event data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventAndPhotos()
  }, [eventId, toast])

  const handlePhotoUploaded = async () => {
    const { data, error } = await supabase
      .from("family_photos")
      .select("*")
      .eq("event_id", eventId)
      .order("date", { ascending: false })

    if (error) {
      console.error("Error refreshing photos:", error)
      return
    }

    setPhotos(data || [])
    setShowUploader(false)
  }

  const handleDeleteEvent = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return
    }

    setIsDeleting(true)

    try {
      if (photos.length > 0) {
        const filePaths = photos
          .map((photo) => {
            const url = photo.url
            const fileName = url.split("/").pop()
            return fileName
          })
          .filter((p): p is string => Boolean(p))

        const { error: storageError } = await supabase.storage
          .from("family-photos")
          .remove(filePaths)

        if (storageError) {
          console.error("Error deleting photo files:", storageError)
        }

        const { error: photoDeleteError } = await supabase
          .from("family_photos")
          .delete()
          .eq("event_id", eventId)

        if (photoDeleteError) throw photoDeleteError
      }

      const { error: eventDeleteError } = await supabase
        .from("family_events")
        .delete()
        .eq("id", eventId)

      if (eventDeleteError) throw eventDeleteError

      toast({
        title: "Event deleted",
        description: "The event and all associated photos have been deleted",
      })

      router.push("/about/family-events")
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete the event",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <p className="text-center font-serif italic text-ink-muted text-lg py-12">
        Loading event&hellip;
      </p>
    )
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="eyebrow eyebrow--lingon">Album not found</div>
        <h2 className="editorial-h2 mt-3 mb-4 font-normal">
          We can&apos;t find that event.
        </h2>
        <p className="lede mb-8">
          It may have been removed, or the link is from another season.
        </p>
        <Link href="/about/family-events" className="btn">
          Back to events
        </Link>
      </div>
    )
  }

  const formattedDate = format(new Date(event.date), "PPP")

  return (
    <div className="space-y-12">
      <div className="text-center">
        <div className="eyebrow eyebrow--lingon">Family album</div>
        <h1 className="editorial-h1 mt-3 mb-3 font-normal">{event.title}</h1>
        <div className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted flex flex-wrap justify-center gap-x-6 gap-y-2">
          <span>{formattedDate}</span>
          {event.location && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{event.location}</span>
            </>
          )}
        </div>
        {event.description && (
          <p className="lede mt-6 max-w-2xl mx-auto">{event.description}</p>
        )}
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      {user && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link
            href={`/about/family-events/${eventId}/edit`}
            className="btn btn--ghost"
          >
            Edit event
          </Link>
          <button
            onClick={handleDeleteEvent}
            disabled={isDeleting}
            className="btn btn--lingon"
          >
            {isDeleting ? "Deleting…" : "Delete event"}
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <div className="eyebrow eyebrow--lingon">The photographs</div>
          <h2 className="editorial-h3 mt-2 font-normal">Photos</h2>
        </div>
        {user && (
          <button onClick={() => setShowUploader(!showUploader)} className="btn">
            {showUploader ? "Cancel" : "Add photos"}
          </button>
        )}
      </div>

      {showUploader && (
        <PhotoUploader onPhotoUploaded={handlePhotoUploaded} eventId={eventId} />
      )}

      {photos.length > 0 ? (
        <PhotoGrid photos={photos} />
      ) : (
        <div className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-12 text-center">
          <p className="font-serif italic text-ink-muted text-lg">
            No photographs have been added to this event yet.
          </p>
          {user && !showUploader && (
            <button
              onClick={() => setShowUploader(true)}
              className="btn btn--ghost mt-6"
            >
              Add the first photo
            </button>
          )}
        </div>
      )}
    </div>
  )
}
