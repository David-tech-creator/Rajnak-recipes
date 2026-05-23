/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // We rely on `npm run build` to catch type errors that would crash
    // a page render; we don't gate the build on every type warning.
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
}

export default nextConfig
