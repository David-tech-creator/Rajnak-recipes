import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase"

export default async function DebugPage() {
  let dbStatus = "Unknown"
  let error = null
  let recipeCount = 0
  const envVars = {
    SUPABASE_URL: process.env.SUPABASE_URL ? "Set" : "Not set",
    SUPABASE_KEY: process.env.SUPABASE_KEY
      ? "Set (first 5 chars: " + process.env.SUPABASE_KEY.substring(0, 5) + "...)"
      : "Not set",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "Set (first 5 chars: " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5) + "...)"
      : "Not set",
    DATABASE_URL: process.env.DATABASE_URL
      ? "Set (first 5 chars: " + process.env.DATABASE_URL.substring(0, 5) + "...)"
      : "Not set",
  }

  try {
    const supabase = createServerSupabaseClient()
    const { data, error: dbError } = await supabase.from("recipes").select("count()", { count: "exact" })

    if (dbError) {
      dbStatus = "Error"
      error = dbError.message
    } else {
      dbStatus = "Connected"
      recipeCount = data[0].count
    }
  } catch (e) {
    dbStatus = "Error"
    error = e instanceof Error ? e.message : "Unknown error"
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Debug Information</h1>

      <div className="grid gap-6">
        <div className="p-6 bg-card rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Database Status</h2>
          <div className="space-y-2">
            <p>
              <strong>Status:</strong>{" "}
              <span className={dbStatus === "Connected" ? "text-green-600" : "text-red-600"}>{dbStatus}</span>
            </p>
            {error && (
              <p>
                <strong>Error:</strong> <span className="text-red-600">{error}</span>
              </p>
            )}
            {dbStatus === "Connected" && (
              <p>
                <strong>Recipe Count:</strong> {recipeCount}
              </p>
            )}
          </div>
        </div>

        <div className="p-6 bg-card rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">{JSON.stringify(envVars, null, 2)}</pre>
        </div>

        <div className="p-6 bg-card rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <div>
              <Link
                href="/api/test-db"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Test Database Connection
              </Link>
            </div>
            <div>
              <Link
                href="/"
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
