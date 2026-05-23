import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { isAllowedAdmin } from "@/lib/admin-allowlist"

async function getUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const cookieStore = await cookies()
  const sb = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {
        /* read-only */
      },
    },
  })
  const {
    data: { user },
  } = await sb.auth.getUser()
  return user
}

export async function POST() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  if (!isAllowedAdmin(user.email))
    return NextResponse.json({ error: "Not authorised" }, { status: 403 })

  try {
    const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasServiceKey = Boolean(secretKey)
    // Use the secret key when available; otherwise fall back to publishable for no-op checks
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (secretKey ?? publishableKey)!,
    )

    // Check if the table exists by attempting to query it
    const { error: tableCheckError } = await supabase.from("family_photos").select("id").limit(1)

    // Table exists if we don't get a "does not exist" error
    const tableExists = !tableCheckError || !tableCheckError.message.includes("does not exist")

    // Only attempt storage mutations if service role key is present
    if (hasServiceKey) {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      if (!listError) {
        const bucketExists = buckets?.some(bucket => bucket.name === "family-photos")
        if (!bucketExists) {
          const { error: storageError } = await supabase.storage.createBucket("family-photos", {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
          })
          if (storageError && !storageError.message.includes("already exists")) {
            console.error("Error creating storage bucket:", storageError)
          }
        }
      }
    }

    return NextResponse.json({ success: true, tableCreated: !tableExists, storageInitialized: hasServiceKey })
  } catch (error) {
    console.error("Error initializing family photos:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
