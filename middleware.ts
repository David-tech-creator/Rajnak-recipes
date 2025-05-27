import { createServerClient } from '@supabase/ssr'
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const supabaseUrl = 'https://fbuwyojoibwjcugeuvnz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidXd5b2pvaWJ3amN1Z2V1dm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxMzgwMjEsImV4cCI6MjA2MDcxNDAyMX0.6dCGTQOPGQ2wG5OeIOGpoHiKFbSjZ5Zm5Ksf5_4ugR4'

const protectedPaths = [
  '/dashboard',
  '/account',
  '/recipes/create-new',
  '/my-recipes',
  '/admin',
  '/admin/dashboard',
  '/admin/recipes',
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // If accessing protected route without auth, redirect to login
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If already logged in and trying to access login/signup pages, redirect to dashboard
  if ((req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup') && session) {
    const redirectTo = req.nextUrl.searchParams.get('redirectTo')
    if (redirectTo) {
      return NextResponse.redirect(new URL(decodeURIComponent(redirectTo), req.url))
    }
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/dashboard/:path*',
    '/account/:path*',
    '/recipes/create-new',
    '/my-recipes',
    '/admin/:path*',
  ]
}
