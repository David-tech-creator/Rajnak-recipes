import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { count, error } = await supabase.from("recipes").select("*", { count: "exact", head: true })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { success: false, error: error.message, count: 0 },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: count || 0,
    })
  } catch (error) {
    console.error("Error getting recipe count:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error", count: 0 },
      { status: 500 }
    )
  }
}
