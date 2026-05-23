import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { isAllowedAdmin } from "@/lib/admin-allowlist"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 60

// JSON Schema for the recipe draft Claude must produce. Structured outputs
// guarantee the response matches this shape exactly.
const RECIPE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "category",
    "prepTime",
    "cookTime",
    "servings",
    "difficulty",
    "ingredients",
    "instructions",
    "kitchenNote",
    "signoff",
    "story",
  ],
  properties: {
    category: {
      type: "string",
      enum: ["Family Recipes", "Found Recipes", "Quick & Easy", "Christmas & Easter"],
      description:
        "Family Recipes = our family heritage dishes (Swedish/Hungarian/Swiss). Found Recipes = anything from elsewhere we've picked up. Quick & Easy = under 30-min weeknight cooking. Christmas & Easter = holiday-specific.",
    },
    prepTime: {
      type: "string",
      description: "Hands-on prep time, formatted like '20 mins' or '1 h 30 m'.",
    },
    cookTime: {
      type: "string",
      description: "Cooking time, formatted like '30 mins' or '1 h 30 m'.",
    },
    servings: {
      type: "integer",
      description: "Number of people the recipe serves.",
    },
    difficulty: {
      type: "string",
      enum: ["Easy", "Medium", "Showpiece"],
      description:
        "Easy = under 45 min, no special technique. Medium = 45 min - 2 h, some technique (yeast, sauce, layering). Showpiece = multi-step, multi-hour, or specialty technique (sushi, croissants, Sachertorte, Christmas ham).",
    },
    ingredients: {
      type: "array",
      items: { type: "string" },
      description:
        "Each item is one ingredient line, quantity FIRST, then ingredient, then prep note. Use metric units (g, kg, ml, dl, l, tsp, tbsp). Examples: '800 g beef chuck, cut into 3-cm cubes', '3 large yellow onions, sliced thin', '1 tsp salt'. Typical 5-15 items.",
    },
    instructions: {
      type: "array",
      items: { type: "string" },
      description:
        "Numbered steps in imperative voice ('Heat the oil...', 'Stir the eggs...'). Each step is one complete sentence (or two short ones). 3-10 steps. The recipe page numbers them automatically — do NOT prefix '1.' yourself.",
    },
    kitchenNote: {
      type: "string",
      description:
        "ONE short, authentic technique tip in the cookbook's margin voice, 4-12 words. Real culinary rules only — no invented family quotes, no 'Mormor said...', no folksy filler. Examples: 'Better the next day.', 'Add paprika off the heat, never on it.', 'Rest as long as you cooked it.', 'Squeeze the potato dry.', 'Don't open the oven.', 'Onion to meat — one-to-one by weight.'.",
    },
    signoff: {
      type: "string",
      enum: [
        "Smaklig måltid.",
        "Jó étvágyat.",
        "En guete.",
        "Bon appétit.",
        "Buon appetito.",
        "Buen provecho.",
        "Guten Appetit.",
        "Tuck in.",
        "God jul.",
        "Boldog karácsonyt.",
      ],
      description:
        "Cuisine-appropriate enjoyment phrase. Swedish dishes -> 'Smaklig måltid.'; Hungarian -> 'Jó étvágyat.'; Swiss German (rösti, fondue, raclette) -> 'En guete.'; French -> 'Bon appétit.'; Italian -> 'Buon appetito.'; Spanish/Mexican -> 'Buen provecho.'; German -> 'Guten Appetit.'; Christmas + Swedish -> 'God jul.'; Christmas + Hungarian -> 'Boldog karácsonyt.'; anything else (fusion, American, Japanese, generic) -> 'Tuck in.'.",
    },
    story: {
      type: "string",
      description:
        "1-3 paragraphs (60-180 words) of authentic cultural / historical / technical context. Plain prose, no markdown headers, no exclamation marks. Cover where the dish comes from, when it's eaten, what makes the technique work. Real cultural facts only — NEVER invent personal family history, named relatives, specific dates, or 'in our family we...' anecdotes. Separate paragraphs with a blank line.",
    },
  },
} as const

const SYSTEM_PROMPT = `You're filling in a recipe entry for the Rajnak family cookbook — a private heirloom-style site that collects Swedish, Hungarian, and Swiss family recipes plus dishes the family has picked up from travel and friends. The voice of the site is quiet, well-worn, editorial — the recipes read like marginalia in a vellum-bound cookbook, not like a food blog.

Given a recipe title (and optionally a photo of the finished dish), produce a complete recipe that matches the schema exactly.

Rules of the voice — non-negotiable:
- Speak as the cookbook itself, not as a person. No "I always...", no "my mother taught me...", no fake grandmother quotes, no invented family stories.
- For recipes with real cultural heritage (Pörkölt, Kanelbullar, Risotto, Sachertorte, etc.), use authentic technique and tradition. Cite real history if you know it. Stay accurate.
- The kitchen note is a margin pencil scribble — one technique rule, terse and authoritative. Not folksy.
- Ingredients use metric units and quantity-first format.
- Instructions are imperative ("Heat the butter…"), not narrative ("You'll want to heat the butter…").
- Match the dish's cultural origin to the right signoff phrase from the enum.
- The story is plain prose, 1-3 short paragraphs, anchored in real culinary or cultural fact. Skip the fluff. If you genuinely don't know a real story, write one tight paragraph on technique or use, never invented heritage.

If a photo is attached, look at it: confirm portion size, garnishes, plating style, and adjust the recipe to match what the family actually made.`

async function getUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

// Per-user rate limit: 10 Claude draft calls per rolling hour. Best-effort —
// Vercel serverless instances are ephemeral so two cold starts could each
// allow 10. Real protection would need Vercel KV; for a six-person family
// site this is enough to stop a runaway browser tab from racking up bills.
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

export async function POST(req: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  if (!isAllowedAdmin(user.email))
    return NextResponse.json({ error: "Not authorised" }, { status: 403 })

  const rate = checkRateLimit(user.id)
  if (!rate.ok) {
    return NextResponse.json(
      { error: `Slow down — you've hit the hourly draft limit. Try again in ${Math.ceil(rate.retryAfter / 60)} min.` },
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

  // Accept multipart (with optional photo) or plain JSON
  let title = ""
  let imageBlock: Anthropic.ImageBlockParam | null = null

  try {
    const ct = req.headers.get("content-type") ?? ""
    if (ct.startsWith("multipart/form-data")) {
      const form = await req.formData()
      title = String(form.get("title") ?? "").trim()
      const file = form.get("image")
      if (file instanceof File && file.size > 0) {
        const buf = Buffer.from(await file.arrayBuffer())
        const mediaType: "image/png" | "image/jpeg" =
          file.type === "image/png" ? "image/png" : "image/jpeg"
        imageBlock = {
          type: "image",
          source: { type: "base64", media_type: mediaType, data: buf.toString("base64") },
        }
      }
    } else {
      const body = await req.json()
      title = String(body.title ?? "").trim()
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!title) return NextResponse.json({ error: "Recipe title is required" }, { status: 400 })

  const userContent: Anthropic.ContentBlockParam[] = []
  if (imageBlock) userContent.push(imageBlock)
  userContent.push({
    type: "text",
    text: `Recipe title: "${title}"\n\nFill in the complete recipe per the schema.`,
  })

  const client = new Anthropic()

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4000,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          // Cache the (stable) system prompt so repeated draft calls are cheap.
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userContent }],
      output_config: {
        format: { type: "json_schema", schema: RECIPE_SCHEMA },
      },
    })

    // With output_config the model returns a single text block whose body
    // is the validated JSON object.
    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text")
    if (!textBlock) {
      return NextResponse.json({ error: "Claude returned no content" }, { status: 502 })
    }

    let draft: unknown
    try {
      draft = JSON.parse(textBlock.text)
    } catch {
      return NextResponse.json(
        { error: "Claude returned unparseable JSON", raw: textBlock.text },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true, draft })
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
