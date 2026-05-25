"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EventDescriptionFieldProps {
  /** Current description text. */
  value: string
  onChange: (value: string) => void
  /** Event context Claude draws on when generating. */
  title: string
  eventType: string
  location: string
  date: string
  /** Disable the whole field (e.g. while the form is saving). */
  disabled?: boolean
  labelClass: string
  inputClass: string
}

/**
 * Description textarea plus a "Generate with Claude" button. Claude takes
 * whatever the user has typed as a seed and expands it into a short, warm
 * description, taking the event's title, type, location, and date into account.
 */
export function EventDescriptionField({
  value,
  onChange,
  title,
  eventType,
  location,
  date,
  disabled,
  labelClass,
  inputClass,
}: EventDescriptionFieldProps) {
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  const generate = async () => {
    if (!title.trim()) {
      toast({
        title: "Add a title first",
        description: "Claude needs at least the event name to work from.",
        variant: "destructive",
      })
      return
    }

    setGenerating(true)
    try {
      const res = await fetch("/api/admin/events/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          eventType,
          location: location.trim(),
          date,
          notes: value.trim(),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Generation failed")

      onChange(json.description as string)
      toast({
        title: "Description drafted",
        description: "Claude wrote a draft from your notes. Edit it before saving.",
      })
    } catch (err) {
      toast({
        title: "Could not generate",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <label htmlFor="description" className={labelClass}>
        Description
      </label>
      <textarea
        id="description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="Jot down who was there, what you ate, the moment you want to remember — then let Claude shape it."
        disabled={disabled || generating}
        className={inputClass}
      />

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[15px] italic text-ink-muted">
          Type a few words, then let Claude write it up from your notes and the event details.
        </p>
        <button
          type="button"
          onClick={generate}
          disabled={disabled || generating || !title.trim()}
          className="inline-flex items-center justify-center gap-2 border border-lingon bg-lingon-soft/15 text-lingon-deep px-4 py-2.5 font-serif-sc uppercase tracking-[0.18em] text-[11px] hover:bg-lingon-soft/30 transition-colors disabled:opacity-50 shrink-0"
        >
          <Sparkles size={14} strokeWidth={1.6} aria-hidden />
          {generating ? "Claude is writing…" : value.trim() ? "Rewrite with Claude" : "Generate with Claude"}
        </button>
      </div>
    </div>
  )
}
