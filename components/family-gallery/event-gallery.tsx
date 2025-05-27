"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PhotoUploader } from "./photo-uploader"
import { PhotoGrid } from "./photo-grid"
import { Loader2, Calendar, MapPin, Edit, Trash2, Plus } from "lucide-react"
import type { FamilyEvent } from "@/lib/types/family"

interface EventGalleryProps {
  eventId: string
}

export function EventGallery({ eventId }: EventGalleryProps) {
  const [event, setEvent] = useState<FamilyEvent | null>(null)
  const [photos, setPhotos] = useState<any[]>([])
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
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from("family_events")
          .select("*")
          .eq("id", eventId)
          .single()

        if (eventError) throw eventError

        setEvent(eventData)

        // Fetch photos for this event
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
    // Refresh photos after upload
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
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)

    try {
      // Delete all photos associated with this event
      if (photos.length > 0) {
        // First, get the file paths from the URLs
        const filePaths = photos.map((photo) => {
          const url = photo.url
          const fileName = url.split("/").pop()
          return fileName
        }).filter(Boolean)

        // Delete files from storage
        const { error: storageError } = await supabase.storage.from("family-photos").remove(filePaths)

        if (storageError) {
          console.error("Error deleting photo files:", storageError)
        }

        // Delete photo records from database
        const { error: photoDeleteError } = await supabase.from("family_photos").delete().eq("event_id", eventId)

        if (photoDeleteError) throw photoDeleteError
      }

      // Delete the event
      const { error: eventDeleteError } = await supabase.from("family_events").delete().eq("id", eventId)

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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
        <p className="mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/about/family-events">Back to Events</Link>
        </Button>
      </div>
    )
  }

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            {user && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/about/family-events/${eventId}/edit`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeleteEvent} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {formattedDate}
          </div>
          {event.location && (
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {event.location}
            </div>
          )}
          {event.description && <p className="mt-4 text-gray-700">{event.description}</p>}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Photos</h2>
        {user && (
          <Button variant="outline" onClick={() => setShowUploader(!showUploader)}>
            {showUploader ? (
              "Cancel"
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" /> Add Photos
              </>
            )}
          </Button>
        )}
      </div>

      {showUploader && <PhotoUploader onPhotoUploaded={handlePhotoUploaded} eventId={eventId} />}

      {photos.length > 0 ? (
        <PhotoGrid photos={photos} />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No photos have been added to this event yet.</p>
          {user && !showUploader && (
            <Button variant="outline" className="mt-4" onClick={() => setShowUploader(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add the First Photo
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
