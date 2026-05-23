import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-gray-100 py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-sm uppercase tracking-wider mb-4">About</h3>
            <p className="text-gray-600 text-sm">
              A collection of recipes from the Rajnak family, friends, and around the world.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-sm uppercase tracking-wider mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/recipes" className="text-gray-600 hover:text-gray-900 transition-colors">
                  All Recipes
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-right">
            <h3 className="text-sm uppercase tracking-wider mb-4">Find a Recipe</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/about/family-events" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Family Events
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/rajnak-family-logo-new.png"
              alt="The Rajnak family recipe collection"
              width={112}
              height={112}
              className="w-28 h-28"
            />
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} The Rajnak Family Recipe Collection. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
