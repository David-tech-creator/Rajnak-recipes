"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CalendarIcon, MapPin, ArrowLeft } from "lucide-react"
import { EVENT_TYPES } from "@/lib/types/family"

export default function EditEventPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [eventType, setEventType] = useState("other")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const params = useParams()
  const eventId = params.id as string
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Redirect if not logged in
    if (user === null) {
      router.push("/login?redirect=/about/family-events/" + eventId + "/edit")
      return
    }

    fetchEventDetails()
  }, [eventId, user, router])

  const fetchEventDetails = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("family_events").select("*").eq("id", eventId).single()

      if (error) throw error

      // Check if user is the creator
      if (user && data.created_by !== user.id) {
        toast({
          title: "Permission denied",
          description: "You can only edit events you created",
          variant: "destructive",
        })
        router.push(`/about/family-events/${eventId}`)
        return
      }

      setTitle(data.title)
      setDescription(data.description || "")
      setDate(data.date)
      setEventType(data.event_type)
      setLocation(data.location || "")
    } catch (error) {
      console.error("Error fetching event:", error)
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive",
      })
      router.push("/about/family-events")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update an event",
        variant: "destructive",
      })
      return
    }

    if (!title || !date) {
      toast({
        title: "Missing information",
        description: "Please provide a title and date for the event",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("family_events")
        .update({
          title,
          description,
          date,
          event_type: eventType,
          location,
        })
        .eq("id", eventId)
        .eq("created_by", user.id)

      if (error) throw error

      toast({
        title: "Event updated",
        description: "Your family event has been updated successfully",
      })

      router.push(`/about/family-events/${eventId}`)
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update event",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href={`/about/family-events/${eventId}`}
        className="text-gray-500 hover:text-gray-700 flex items-center mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Event
      </Link>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Edit Event</h1>

        <Card>
          <CardHeader>
            <CardTitle>Update Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title*</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Christmas Dinner 2023"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Event Date*</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-type">Event Type</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger id="event-type">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Grandma's House, Stockholm"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Event Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the event, who was there, and any special memories..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.push(`/about/family-events/${eventId}`)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
