import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Test the connection by getting the count of recipes
    const { count, error } = await supabase.from("recipes").select("*", { count: "exact", head: true })

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: `Supabase error: ${error.message}`,
          details: error,
          environment: {
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            // Don't expose the full key, just the first few characters
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + "...",
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
            SUPABASE_KEY: process.env.SUPABASE_KEY ? "Set" : "Not set",
          },
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "success",
      message: "Supabase connection successful",
      recipeCount: count,
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        // Don't expose the full key, just the first few characters
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + "...",
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
        SUPABASE_KEY: process.env.SUPABASE_KEY ? "Set" : "Not set",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
        environment: {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
          // Don't expose the full key, just the first few characters
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + "...",
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
          SUPABASE_KEY: process.env.SUPABASE_KEY ? "Set" : "Not set",
        },
      },
      { status: 500 },
    )
  }
}
