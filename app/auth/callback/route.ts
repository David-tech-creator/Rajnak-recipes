import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      'https://fbuwyojoibwjcugeuvnz.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidXd5b2pvaWJ3amN1Z2V1dm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxMzgwMjEsImV4cCI6MjA2MDcxNDAyMX0.6dCGTQOPGQ2wG5OeIOGpoHiKFbSjZ5Zm5Ksf5_4ugR4',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: { path: string; maxAge: number }) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: { path: string }) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', request.url))
} 