import { NextResponse } from "next/server"

export async function GET() {
  // Only return partial keys for security
  const envStatus = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10)}...`
      : "Not set",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "Set (starts with " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5) + "...)"
      : "Not set",
    NODE_ENV: process.env.NODE_ENV || "Not set",
  }

  return NextResponse.json({
    status: "ok",
    environment: envStatus,
    timestamp: new Date().toISOString(),
  })
}
