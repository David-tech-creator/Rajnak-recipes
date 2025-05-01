import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    // Check environment variables
    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
      SUPABASE_KEY: process.env.SUPABASE_KEY ? "Set" : "Not set",
      SUPABASE_URL: process.env.SUPABASE_URL ? "Set" : "Not set",
      DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Not set",
    }

    // Test database connection
    let dbStatus = "Unknown"
    let recipeCount = 0
    let error = null

    try {
      const supabase = createServerSupabaseClient()
      const { count, error: dbError } = await supabase.from("recipes").select("count()", { count: "exact", head: true })

      if (dbError) {
        dbStatus = "Error"
        error = dbError.message
      } else {
        dbStatus = "Connected"
        recipeCount = count || 0
      }
    } catch (e) {
      dbStatus = "Error"
      error = e instanceof Error ? e.message : "Unknown error"
    }

    return NextResponse.json({
      envStatus,
      dbStatus,
      recipeCount,
      error,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
