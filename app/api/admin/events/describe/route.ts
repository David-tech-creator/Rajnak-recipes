import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { isAllowedAdmin } from "@/lib/admin-allowlist"
import { createClient } from "@/lib/supabase/server"
import { EVENT_TYPES } from "@/lib/types/family"

export const runtime = "nodejs"
export const maxDuration = 60

// Structured output: Claude returns exactly { description: string }.
const DESCRIPTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["description"],
  properties: {
    description: {
      type: "string",
      description:
        "A warm, brief description for this family-album event: 1-3 sentences, roughly 25-70 words. Plain prose, past tense, no markdown, no hashtags, no emoji, no exclamation marks.",
    },
  },
} as const

const SYSTEM_PROMPT = `You're writing a short description for an entry in the Rajnak family's photo album — a private heirloom-style site for a Swedish, Hungarian, and Swiss family. The voice is quiet, warm, and editorial: like a caption written in fountain pen beneath a photograph, not a social-media post.

Given an event's title, type, date, location, and the family's own rough notes, write a short description of the occasion.

Rules — non-negotiable:
- 1-3 sentences, roughly 25-70 words. Short is good; the photographs do most of the talking.
- If the family gave notes, build on them: keep their facts, names, and details and shape them into warm, readable prose. Never contradict them and never invent specifics they didn't mention (no new names, places, dishes, or happenings).
- If they gave no notes, write something gentle and general drawn only from the title, type, location, and date — evocative but never fabricating particular people or events.
- Plain prose. Past tense. No markdown, no headers, no hashtags, no emoji, no exclamation marks.
- Don't mechanically restate the date and location ("On 17 May 2026 in Stockholm, ..."). Weave them in only where they add warmth, or leave them out.`

async function getUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

// Per-user rate limit: 10 description drafts per rolling hour. Best-effort and
// in-memory (Vercel instances are ephemeral), but enough to stop a runaway tab
// from racking up bills on a six-person family site. Mirrors the recipe route.
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_MAX = 10
const draftCalls = new Map<string, number[]>()

function checkRateLimit(userId: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now()
  const recent = (draftCalls.get(userId) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (recent.length >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - recent[0])) / 1000)
    return { ok: false, retryAfter }
  }
  recent.push(now)
  draftCalls.set(userId, recent)
  return { ok: true }
}

function eventTypeLabel(value: string): string {
  return EVENT_TYPES.find((t) => t.value === value)?.label ?? "Other"
}

export async function POST(req: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  if (!isAllowedAdmin(user.email))
    return NextResponse.json({ error: "Not authorised" }, { status: 403 })

  const rate = checkRateLimit(user.id)
  if (!rate.ok) {
    return NextResponse.json(
      { error: `Slow down — you've hit the hourly limit. Try again in ${Math.ceil(rate.retryAfter / 60)} min.` },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    )
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Missing ANTHROPIC_API_KEY env var. Add it in Vercel Project Settings → Environment Variables.",
      },
      { status: 500 },
    )
  }

  let title = ""
  let eventType = "other"
  let location = ""
  let date = ""
  let notes = ""

  try {
    const body = await req.json()
    title = String(body.title ?? "").trim()
    eventType = String(body.eventType ?? "other").trim()
    location = String(body.location ?? "").trim()
    date = String(body.date ?? "").trim()
    notes = String(body.notes ?? "").trim()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!title) return NextResponse.json({ error: "Event title is required" }, { status: 400 })

  // Assemble the facts Claude is allowed to work from.
  const facts = [
    `Title: ${title}`,
    `Type: ${eventTypeLabel(eventType)}`,
    location ? `Location: ${location}` : null,
    date ? `Date: ${date}` : null,
    notes ? `The family's notes: ${notes}` : "The family left no notes.",
  ]
    .filter(Boolean)
    .join("\n")

  const client = new Anthropic()

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `${facts}\n\nWrite the description per the schema.`,
        },
      ],
      output_config: {
        format: { type: "json_schema", schema: DESCRIPTION_SCHEMA },
      },
    })

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text")
    if (!textBlock) {
      return NextResponse.json({ error: "Claude returned no content" }, { status: 502 })
    }

    let parsed: { description?: unknown }
    try {
      parsed = JSON.parse(textBlock.text)
    } catch {
      return NextResponse.json(
        { error: "Claude returned unparseable JSON", raw: textBlock.text },
        { status: 502 },
      )
    }

    const description = typeof parsed.description === "string" ? parsed.description.trim() : ""
    if (!description) {
      return NextResponse.json({ error: "Claude returned an empty description" }, { status: 502 })
    }

    return NextResponse.json({ ok: true, description })
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Claude is rate-limited right now — try again in a minute." },
        { status: 429 },
      )
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is invalid. Rotate it in Vercel." },
        { status: 500 },
      )
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `Claude API error: ${err.message}` }, { status: 502 })
    }
    const msg = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
