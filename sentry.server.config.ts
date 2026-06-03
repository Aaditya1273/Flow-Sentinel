// This file configures the initialization of Sentry on the server side.
// The DSN is read from SENTRY_DSN environment variable (not public).

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance monitoring — sample rate for server-side transactions
  tracesSampleRate: 0.2,

  // Send only errors in production
  enabled: process.env.NODE_ENV === "production",

  // Release tracking
  release: `flow-sentinel@${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "dev"}`,

  // Environment
  environment: process.env.NODE_ENV || "development",
})
