"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { EVENT_TYPES } from "@/lib/types/family"
import { SprigDivider } from "@/components/sprig-divider"
import { EventDescriptionField } from "@/components/family-gallery/event-description-field"

const labelClass =
  "block font-serif-sc uppercase tracking-[0.22em] text-[12px] text-ink-muted mb-2"
const inputClass =
  "w-full bg-cream border border-rule-soft px-4 py-3 font-serif text-[18px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink"

export default function CreateEventPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<string>("")
  const [eventType, setEventType] = useState("other")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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
        description: "Please provide at least a title and date",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("family_events")
        .insert([
          {
            title,
            description,
            date: format(new Date(date), "yyyy-MM-dd"),
            event_type: eventType,
            location,
            created_by: user.id,
          },
        ])

      if (error) throw error

      toast({
        title: "Event created",
        description: "Your family event has been created.",
      })

      router.push("/about/family-events")
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">A new album</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          Open a fresh{" "}
          <em className="italic" style={{ color: "var(--lingon-deep)" }}>
            event
          </em>
        </h1>
        <p className="lede">A date, a place, a title &mdash; the rest is photographs and memories.</p>
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      <div className="max-w-2xl mx-auto bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Reunion 2026"
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className={labelClass}>
                Date
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
              <label htmlFor="eventType" className={labelClass}>
                Event type
              </label>
              <select
                id="eventType"
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

          <EventDescriptionField
            value={description}
            onChange={setDescription}
            title={title}
            eventType={eventType}
            location={location}
            date={date}
            disabled={isLoading}
            labelClass={labelClass}
            inputClass={inputClass}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <Link href="/about/family-events" className="btn btn--link">
              Cancel
            </Link>
            <button type="submit" disabled={isLoading} className="btn">
              {isLoading ? "Creating…" : "Create event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
