// This file configures the initialization of Sentry on the client side.
// The DSN is injected at build time by the Sentry build plugin.

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,

  // Performance monitoring — sample rate for traces
  tracesSampleRate: 0.1,

  // Session replay (requires integration below)
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  // Send only errors with stack traces in production
  enabled: process.env.NODE_ENV === "production",

  // Denylist URLs we don't care about
  denyUrls: [
    /chrome-extension:\/\//i,
    /localhost:\d+\/_next\//i,
  ],

  // Release tracking
  release: `flow-sentinel@${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "dev"}`,

  // Environment
  environment: process.env.NODE_ENV || "development",
})
