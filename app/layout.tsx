import type React from "react"
import { Suspense } from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Cormorant_Garamond, Cormorant_SC, Caveat } from "next/font/google"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
})

const cormorantSc = Cormorant_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant-sc",
  display: "swap",
})

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-caveat",
  display: "swap",
})

const siteUrl = "https://www.rajnak.com"
const siteName = "The Rajnak Family Recipe Collection"
const siteDescription = "Hemlagad mat med kärlek • Homemade food with love"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: "%s | Rajnak",
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: siteName,
    description: siteDescription,
    siteName,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "A long, warmly lit family dining table",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/og-image.jpg"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${cormorantSc.variable} ${caveat.variable}`}
    >
      <head>
        <link rel="icon" href="/images/rajnak-family-logo.png" type="image/png" />
      </head>
      <body>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center text-gray-400 text-sm tracking-wider">
              Loading…
            </div>
          }
        >
          <AuthProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <Toaster />
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}
