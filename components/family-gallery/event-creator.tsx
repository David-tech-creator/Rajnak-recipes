"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { FamilyEvent } from "@/lib/types/family"

interface EventCreatorProps {
  event?: FamilyEvent
  isEditing?: boolean
}

export function EventCreator({ event, isEditing = false }: EventCreatorProps) {
  const [title, setTitle] = useState(event?.title || "")
  const [date, setDate] = useState(event?.date ? new Date(event.date).toISOString().split("T")[0] : "")
  const [location, setLocation] = useState(event?.location || "")
  const [description, setDescription] = useState(event?.description || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create an event",
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

    setIsSubmitting(true)

    try {
      if (isEditing && event) {
        // Update existing event
        const { error } = await supabase
          .from("family_events")
          .update({
            title,
            date,
            location,
            description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", event.id)

        if (error) throw error

        toast({
          title: "Event updated",
          description: "The event has been updated successfully",
        })

        router.push(`/about/family-events/${event.id}`)
      } else {
        // Create new event
        const { data, error } = await supabase
          .from("family_events")
          .insert([
            {
              title,
              date,
              location,
              description,
              created_by: user.id,
              created_at: new Date().toISOString(),
            },
          ])
          .select()

        if (error) throw error

        toast({
          title: "Event created",
          description: "Your event has been created successfully",
        })

        // Redirect to the new event page
        router.push(`/about/family-events/${data[0].id}`)
      }
    } catch (error) {
      console.error("Error saving event:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Event" : "Create New Family Event"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Reunion 2023"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Event Date *</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Grandma's House, Stockholm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the event, who attended, special memories, etc."
              className="min-h-[150px]"
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditing ? "Update Event" : "Create Event"}</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
