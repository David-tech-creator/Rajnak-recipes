import Link from "next/link"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="mb-8">We couldn't find the page you were looking for.</p>
      <Link href="/" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
        Return Home
      </Link>
    </div>
  )
}
