"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { EVENT_TYPES } from "@/lib/types/family"
import { SprigDivider } from "@/components/sprig-divider"

const labelClass =
  "block font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-2"
const inputClass =
  "w-full bg-cream border border-rule-soft px-4 py-3 font-serif text-[18px] text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-ink"

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
    if (user === null) {
      router.push("/login?redirect=/about/family-events/" + eventId + "/edit")
      return
    }

    const fetchEventDetails = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("family_events")
          .select("*")
          .eq("id", eventId)
          .single()

        if (error) throw error

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

    fetchEventDetails()
  }, [eventId, user, router, toast])

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
      <div className="container mx-auto px-6 py-16">
        <p className="text-center font-serif italic text-ink-muted text-lg py-12">
          Loading event&hellip;
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">Edit album</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          Update the{" "}
          <em className="italic" style={{ color: "var(--lingon-deep)" }}>
            event
          </em>
        </h1>
        <p className="lede">Fix a date, refine a title, add the story you remembered later.</p>
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      <div className="max-w-2xl mx-auto bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="title" className={labelClass}>
              Event title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Christmas Dinner 2023"
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className={labelClass}>
                Event date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="event-type" className={labelClass}>
                Event type
              </label>
              <select
                id="event-type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className={inputClass}
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="location" className={labelClass}>
              Location
            </label>
            <input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Grandma's house, Stockholm"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe the event, who was there, and any special memories…"
              className={inputClass}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <Link href={`/about/family-events/${eventId}`} className="btn btn--link">
              Cancel
            </Link>
            <button type="submit" disabled={isSaving} className="btn">
              {isSaving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
