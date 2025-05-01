import Link from "next/link"
import { UserMenu } from "./user-menu"

export function NavBar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold">
            Family Recipes
          </Link>
          <div className="space-x-6">
            <Link href="/recipes">Recipes</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/about/family-events">Family Events</Link>
          </div>
        </div>
        <UserMenu />
      </div>
    </nav>
  )
} 