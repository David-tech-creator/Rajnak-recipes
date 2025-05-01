import { SupabaseTest } from "@/components/supabase-test"

export default function TestSupabasePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <SupabaseTest />
    </div>
  )
}
