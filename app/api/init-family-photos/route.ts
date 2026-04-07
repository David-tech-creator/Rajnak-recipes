import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
    // Use service role key when available; otherwise fall back to anon for no-op checks
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
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
