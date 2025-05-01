"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Search, Menu, X, User, ChevronDown } from "lucide-react"
import { CATEGORY_GROUPS } from "@/lib/categories"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Safely access auth context with try/catch
  const { user, signOut } = useAuth()

  const router = useRouter()
  const { toast } = useToast()
  const pathname = usePathname()

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
    <header className="py-3 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <div className="mb-4">
            <Link href="/">
              <Image
                src="/images/rajnak-family-logo-new.png"
                alt="The Rajnak family recipe collection"
                width={176}
                height={88}
                priority
                className="mt-2"
              />
            </Link>
          </div>

          {/* Thin line between logo and navigation */}
          <div className="w-full max-w-md border-t border-gray-200 mb-4"></div>

          {/* Search and User Icons - Absolute positioned */}
          <div className="absolute right-4 top-3 flex items-center space-x-6">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-gray-600 hover:text-gray-900 transition-colors">
                  <User size={20} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/recipes/create-new" className="cursor-pointer">
                      Add New Recipe
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-recipes" className="cursor-pointer">
                      My Recipes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Administration</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/test-connection" className="cursor-pointer">
                        Test Connection
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/recipes" className="cursor-pointer">
                        Manage Recipes
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                <User size={20} />
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex justify-center space-x-8">
            <Link href="/" className="text-gray-800 hover:text-gray-600 transition-colors px-2 py-1">
              Home
            </Link>
            <div className="relative group">
              <button className="text-gray-800 hover:text-gray-600 transition-colors px-2 py-1 flex items-center">
                Recipes <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute left-0 mt-2 w-64 bg-white shadow-md rounded-md overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="py-2">
                  <Link href="/recipes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                    All Recipes
                  </Link>
                  <Link
                    href="/categories"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Categories
                  </Link>
                  <Link
                    href="/recipes/create-new"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Add Recipe
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative group">
              <button className="text-gray-800 hover:text-gray-600 transition-colors px-2 py-1 flex items-center">
                Categories <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute left-0 mt-2 w-64 bg-white shadow-md rounded-md overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="max-h-96 overflow-y-auto py-2">
                  <Link
                    href="/categories"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    All Categories
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  {CATEGORY_GROUPS.map((group) => (
                    <div key={group.name}>
                      <Link
                        href={`/categories/${group.name.toLowerCase().replace(/\s+/g, "-")}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        {group.name}
                      </Link>
                      {group.subcategories?.map((subcat) => (
                        <Link
                          key={subcat}
                          href={`/categories/${subcat.toLowerCase().replace(/\s+/g, "-")}`}
                          className="block px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 pl-8"
                        >
                          {subcat}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative group">
              <button className="text-gray-800 hover:text-gray-600 transition-colors px-2 py-1 flex items-center">
                About <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute left-0 mt-2 w-64 bg-white shadow-md rounded-md overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="py-2">
                  <Link href="/about" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                    Our Story
                  </Link>
                  <Link
                    href="/about/family-events"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Family Events & Albums
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden w-full py-4 space-y-4 text-center">
              <Link
                href="/"
                className="block text-gray-800 hover:text-gray-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/recipes"
                className="block text-gray-800 hover:text-gray-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Recipes
              </Link>
              <Link
                href="/recipes/create-new"
                className="block text-gray-800 hover:text-gray-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Add Recipe
              </Link>
              <Link
                href="/categories"
                className="block text-gray-800 hover:text-gray-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/about"
                className="block text-gray-800 hover:text-gray-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/about/family-events"
                className="block text-gray-800 hover:text-gray-600 transition-colors pl-4 text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Family Events & Albums
              </Link>
            </nav>
          )}

          {/* Search Bar */}
          {searchOpen && (
            <div className="absolute top-12 right-4 w-64 bg-white shadow-md rounded-md overflow-hidden z-20">
              <form onSubmit={handleSearch} className="flex border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search recipes..."
                  className="w-full py-2 px-4 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="px-4 text-gray-600 hover:text-gray-900">
                  <Search size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
