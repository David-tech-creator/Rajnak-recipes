import { NextResponse } from "next/server"

export async function GET() {
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return NextResponse.json({
    status: "ok",
    hasSupabaseUrl,
    hasSupabaseKey,
    allEnvVarsPresent: hasSupabaseUrl && hasSupabaseKey,
  })
}
