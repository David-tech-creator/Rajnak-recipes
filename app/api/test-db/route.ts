import { NextResponse } from "next/server"
import { createServerSupabaseClient, sampleRecipes } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Test the connection with a simple query
    const { data, error } = await supabase.from("recipes").select("count()", { count: "exact" })

    if (error) {
      console.error("Database connection test error:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          fallback: "Using sample recipes",
          sampleCount: sampleRecipes.length,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      count: data[0].count,
      supabaseUrl: process.env.SUPABASE_URL ? "Set" : "Not set",
      supabaseKeySet: process.env.SUPABASE_KEY ? "Yes" : "No",
    })
  } catch (error) {
    console.error("Error in database test:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        fallback: "Using sample recipes",
        sampleCount: sampleRecipes.length,
      },
      { status: 500 },
    )
  }
}
