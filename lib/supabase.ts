// Backwards-compat shim. New code should import { createClient } from
// "@/lib/supabase/client" (browser) or "@/lib/supabase/server" (server)
// directly. This singleton exists so existing client components that do
// `import { supabase } from "@/lib/supabase"` keep working.
import { createClient } from "@/lib/supabase/client"

export const supabase = createClient()
