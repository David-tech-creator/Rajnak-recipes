"use client"

import type React from "react"
import Image from "next/image"
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
    <header className="relative border-b border-rule-soft bg-parchment/0">
      <div className="container mx-auto px-4 pt-6 pb-3">
        <div className="flex flex-col items-center relative">
          {/* Logo */}
          <Link href="/" className="block mb-3">
            <Image
              src="/images/rajnak-family-logo-new.png"
              alt="The Rajnak family recipe collection"
              width={180}
              height={90}
              priority
            />
          </Link>

          <div
            className="font-serif-sc uppercase tracking-[0.3em] text-[10px] text-ink-muted mb-4"
            aria-hidden
          >
            Hemlagad mat med kärlek
          </div>

          {/* Search and User Icons */}
          <div className="absolute right-0 top-0 flex items-center gap-5">
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
                    <Link href="/account" className={dropdownItemClass}>
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="font-serif-sc uppercase tracking-[0.22em] text-[10px] text-ink-muted">
                    Administration
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard" className={dropdownItemClass}>
                        Dashboard
                      </Link>
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
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex justify-center items-center gap-10 pt-2">
            <Link href="/" className={navLinkClass}>
              Home
            </Link>

            <div className="relative group">
              <button className={`${navLinkClass} flex items-center gap-1`}>
                Recipes <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-56 bg-cream border border-rule-soft shadow-[var(--paper-shadow)] z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                <div className="py-2">
                  <Link href="/recipes" className={dropdownItemClass}>
                    All Recipes
                  </Link>
                  <Link href="/categories" className={dropdownItemClass}>
                    Categories
                  </Link>
                  <Link href="/search" className={dropdownItemClass}>
                    Search
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative group">
              <button className={`${navLinkClass} flex items-center gap-1`}>
                Categories <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-64 bg-cream border border-rule-soft shadow-[var(--paper-shadow)] z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                <div className="py-2">
                  <Link href="/categories" className={dropdownItemClass}>
                    All Categories
                  </Link>
                  <div className="my-1 border-t border-rule-soft"></div>
                  {RECIPE_CATEGORIES.map((cat) => (
                    <Link key={cat.slug} href={`/categories/${cat.slug}`} className={dropdownItemClass}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative group">
              <button className={`${navLinkClass} flex items-center gap-1`}>
                About <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-56 bg-cream border border-rule-soft shadow-[var(--paper-shadow)] z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                <div className="py-2">
                  <Link href="/about" className={dropdownItemClass}>
                    Our Story
                  </Link>
                  <Link href="/about/family-events" className={dropdownItemClass}>
                    Family Events
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden w-full py-6 space-y-4 text-center border-t border-rule-soft mt-4">
              <Link href="/" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <div></div>
              <Link href="/recipes" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                All Recipes
              </Link>
              <div></div>
              <Link href="/search" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                Search
              </Link>
              <div></div>
              <Link href="/categories" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                Categories
              </Link>
              {RECIPE_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="block font-serif text-ink-soft italic hover:text-lingon-deep text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <div></div>
              <Link href="/about" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                About
              </Link>
              <Link
                href="/about/family-events"
                className="block font-serif text-ink-soft italic hover:text-lingon-deep text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                Family Events
              </Link>
            </nav>
          )}

          {/* Search overlay */}
          {searchOpen && (
            <div className="absolute top-14 right-0 w-72 bg-cream border border-rule-soft shadow-[var(--paper-shadow)] z-30">
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
      </div>
    </header>
  )
}
