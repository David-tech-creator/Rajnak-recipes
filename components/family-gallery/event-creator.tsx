"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { FamilyEvent } from "@/lib/types/family"

interface EventCreatorProps {
  event?: FamilyEvent
  isEditing?: boolean
}

const labelClass =
  "block font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-2"
const inputClass =
  "w-full bg-cream border border-rule-soft px-4 py-3 font-serif text-[18px] text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-ink"

export function EventCreator({ event, isEditing = false }: EventCreatorProps) {
  const [title, setTitle] = useState(event?.title || "")
  const [date, setDate] = useState(
    event?.date ? new Date(event.date).toISOString().split("T")[0] : ""
  )
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
    <div className="max-w-2xl mx-auto bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-12">
      <div className="text-center mb-8">
        <div className="eyebrow eyebrow--lingon">
          {isEditing ? "Edit event" : "New event"}
        </div>
        <h2 className="editorial-h3 mt-2 font-normal">
          {isEditing ? "Update event details" : "Create a new family event"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="title" className={labelClass}>
            Event title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Summer Reunion 2023"
            className={inputClass}
            required
          />
        </div>

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
            placeholder="Describe the event, who attended, special memories&hellip;"
            className={inputClass}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button type="button" onClick={() => router.back()} className="btn btn--link">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn">
            {isSubmitting
              ? isEditing
                ? "Updating…"
                : "Creating…"
              : isEditing
              ? "Update event"
              : "Create event"}
          </button>
        </div>
      </form>
    </div>
  )
}
