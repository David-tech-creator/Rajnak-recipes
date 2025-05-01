import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    // Use service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Using service role key for admin operations
    )

    // Check if the table exists by attempting to query it
    const { error: tableCheckError } = await supabase.from("family_photos").select("id").limit(1)

    // If we get an error that includes "does not exist", the table doesn't exist
    const tableExists = !tableCheckError || !tableCheckError.message.includes("does not exist")

    // If table doesn't exist, create it
    if (!tableExists) {
      // Create the family_photos table using RPC
      const { error: createTableError } = await supabase.rpc("create_family_photos_table", {})

      // If RPC fails (likely because it doesn't exist), try direct SQL via functions API
      if (createTableError) {
        console.log("RPC failed, attempting alternative method:", createTableError.message)

        // Try to create the table using a simple insert to force table creation
        const { error: insertError } = await supabase.from("family_photos").insert({
          id: "00000000-0000-0000-0000-000000000000", // Dummy ID
          url: "https://example.com/placeholder.jpg",
          caption: "Initialization placeholder",
          date: new Date().toISOString(),
          event_type: "other",
          created_by: "00000000-0000-0000-0000-000000000000", // Dummy user ID
        })

        // If insert fails with something other than "already exists", it's a real error
        if (insertError && !insertError.message.includes("already exists")) {
          throw new Error(`Failed to create family_photos table: ${insertError.message}`)
        }

        // If we successfully created the table, delete the dummy row
        if (!insertError || insertError.message.includes("already exists")) {
          await supabase.from("family_photos").delete().eq("id", "00000000-0000-0000-0000-000000000000")
        }
      }
    }

    // Create the storage bucket if it doesn't exist
    const { error: storageError } = await supabase.storage.createBucket("family", {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
    })

    // Ignore error if bucket already exists
    if (storageError && !storageError.message.includes("already exists")) {
      console.error("Error creating storage bucket:", storageError)
    }

    return NextResponse.json({ success: true, tableCreated: !tableExists })
  } catch (error) {
    console.error("Error initializing family photos:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
