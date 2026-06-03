/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https', 
        hostname: 'via.placeholder.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

// In production, if sentry config is set up, wrap with Sentry
const { withSentryConfig } = require("@sentry/nextjs")

module.exports = withSentryConfig(
  nextConfig,
  {
    // Sentry webpack plugin options
    silent: true,
    telemetry: false,
    widenClientFileUpload: true,
    reactComponentAnnotation: { enabled: true },
    sourcemaps: {
      deleteSourcemapsAfterUpload: true,
    },
  },
  {
    // Hides source maps from being uploaded to Sentry in dev
    hideSourceMaps: process.env.NODE_ENV === "development",
  }
)
