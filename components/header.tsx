"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Search, Menu, X, User, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"

const RECIPE_CATEGORIES = [
  { name: "Family Recipes", slug: "family-recipes" },
  { name: "Found Recipes", slug: "found-recipes" },
  { name: "Quick & Easy", slug: "quick-and-easy" },
  { name: "Christmas & Easter", slug: "christmas-and-easter" },
]

const navLinkClass =
  "font-serif-sc uppercase tracking-[0.22em] text-[12px] text-ink-soft hover:text-lingon-deep transition-colors"
const dropdownItemClass =
  "block px-4 py-2 font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-soft hover:text-lingon-deep hover:bg-parchment-deep/40"

function SprigMark() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      className="w-7 h-7 md:w-8 md:h-8 text-oliveleaf flex-shrink-0"
      aria-hidden
    >
      <path d="M32 8 Q32 32 32 56" />
      <path d="M32 20 Q22 18 18 24 Q26 26 32 24" fill="currentColor" fillOpacity=".15" />
      <path d="M32 24 Q42 22 46 28 Q38 30 32 28" fill="currentColor" fillOpacity=".15" />
      <path d="M32 36 Q22 34 18 40 Q26 42 32 40" fill="currentColor" fillOpacity=".15" />
      <path d="M32 40 Q42 38 46 44 Q38 46 32 44" fill="currentColor" fillOpacity=".15" />
      <circle cx="28" cy="50" r="2.4" fill="var(--lingon)" />
      <circle cx="34" cy="52" r="2.6" fill="var(--lingon)" />
      <circle cx="30" cy="55" r="2" fill="var(--lingon)" />
    </svg>
  )
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { user, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    await signOut()
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    })
    router.refresh()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-rule-soft bg-parchment/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between gap-4 h-14 md:h-16 relative">
          {/* Wordmark — sprig + name on a single horizontal line */}
          <Link href="/" className="flex items-center gap-3 group z-10">
            <SprigMark />
            <span className="font-serif text-ink text-[18px] md:text-[20px] leading-none group-hover:text-lingon-deep transition-colors whitespace-nowrap">
              Rajnak<span className="hidden sm:inline italic text-ink-soft"> · recipes</span>
            </span>
          </Link>

          {/* Desktop nav — Recipes + About, with logo serving as Home */}
          <nav className="hidden md:flex items-center gap-10 lg:gap-14 absolute left-1/2 -translate-x-1/2">
            <div className="relative group">
              <Link href="/recipes" className={`${navLinkClass} flex items-center gap-1.5`}>
                Recipes <ChevronDown className="h-3 w-3" />
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 pt-3 w-56 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                <div className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] py-2">
                  <Link href="/recipes" className={dropdownItemClass}>All Recipes</Link>
                  <Link href="/categories" className={dropdownItemClass}>By Category</Link>
                  <Link href="/search" className={dropdownItemClass}>Search</Link>
                </div>
              </div>
            </div>

            <div className="relative group">
              <Link href="/about" className={`${navLinkClass} flex items-center gap-1.5`}>
                About <ChevronDown className="h-3 w-3" />
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 pt-3 w-56 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                <div className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] py-2">
                  <Link href="/about" className={dropdownItemClass}>Our Story</Link>
                  <Link href="/about/family-events" className={dropdownItemClass}>Family Events</Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-4 md:gap-5 z-10">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-ink-muted hover:text-lingon-deep transition-colors"
              aria-label="Search"
            >
              <Search size={18} strokeWidth={1.4} />
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-ink-muted hover:text-lingon-deep transition-colors">
                  <User size={18} strokeWidth={1.4} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-cream border-rule-soft">
                  <DropdownMenuLabel className="font-serif-sc uppercase tracking-[0.22em] text-[10px] text-ink-muted">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className={dropdownItemClass}>Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="font-serif-sc uppercase tracking-[0.22em] text-[10px] text-ink-muted">
                    Family Admin
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/recipes" className={dropdownItemClass}>Manage Recipes</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/recipes/new" className={dropdownItemClass}>Add a Recipe</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-soft hover:text-lingon-deep cursor-pointer"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="text-ink-muted hover:text-lingon-deep transition-colors"
                aria-label="Sign in"
              >
                <User size={18} strokeWidth={1.4} />
              </Link>
            )}

            <button
              className="md:hidden text-ink-muted hover:text-lingon-deep transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {isMenuOpen && (
          <nav className="md:hidden border-t border-rule-soft py-5 space-y-3 text-center">
            <Link href="/" className={`block ${navLinkClass}`} onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link href="/recipes" className={`block ${navLinkClass}`} onClick={() => setIsMenuOpen(false)}>All Recipes</Link>
            <Link href="/categories" className={`block ${navLinkClass}`} onClick={() => setIsMenuOpen(false)}>Categories</Link>
            <Link href="/search" className={`block ${navLinkClass}`} onClick={() => setIsMenuOpen(false)}>Search</Link>
            <Link href="/about" className={`block ${navLinkClass}`} onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link
              href="/about/family-events"
              className="block font-serif italic text-ink-soft hover:text-lingon-deep text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              Family Events
            </Link>
          </nav>
        )}

        {/* Search overlay */}
        {searchOpen && (
          <div className="absolute top-full right-4 md:right-6 mt-2 w-80 bg-cream border border-rule-soft shadow-[var(--paper-shadow)] z-30">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search recipes…"
                className="w-full py-2 px-4 bg-transparent text-ink placeholder:text-ink-muted/60 focus:outline-none font-serif italic text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="px-4 text-ink-muted hover:text-lingon-deep"
                aria-label="Submit search"
              >
                <Search size={18} strokeWidth={1.4} />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
