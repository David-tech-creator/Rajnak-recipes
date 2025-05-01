import Link from "next/link"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">Goda Favoriter</span>
        </Link>
        <div className="flex items-center justify-end flex-1 space-x-4">
          <nav className="flex items-center space-x-2">
            <Link href="/recipes" className="text-sm font-medium transition-colors hover:text-primary">
              Alla Recept
            </Link>
            <Link href="/categories" className="text-sm font-medium transition-colors hover:text-primary">
              Kategorier
            </Link>
          </nav>
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
