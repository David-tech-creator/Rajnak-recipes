"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ArrowLeft, Calendar, MapPin } from "lucide-react"
import { format } from "date-fns"
import { PhotoGallery } from "@/components/family-gallery/photo-gallery"
import type { FamilyEvent } from "@/lib/types/family"

export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [event, setEvent] = useState<FamilyEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchEvent() {
      try {
        const { data, error } = await supabase
          .from("family_events")
          .select("*")
          .eq("id", params.id)
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-600 mb-4">Event not found</p>
            <Button
              onClick={() => router.push("/about/family-events")}
              className="bg-black hover:bg-black/90 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <Button
          onClick={() => router.push("/about/family-events")}
          variant="outline"
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
          <div className="flex items-center gap-6 text-gray-600 mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {format(new Date(event.date), "PPP")}
            </div>
            {event.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {event.location}
              </div>
            )}
          </div>
          {event.description && (
            <p className="text-gray-600">{event.description}</p>
          )}
        </div>

        <PhotoGallery eventId={event.id} />
      </div>
    </div>
  )
}
