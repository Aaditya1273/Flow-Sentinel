'use client'

/**
 * Error monitoring wrapper — powered by @sentry/nextjs in production.
 * Gracefully degrades to structured console logging when Sentry is not configured.
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN

interface ErrorContext {
  component?: string
  action?: string
  vaultId?: string
  transactionId?: string
  [key: string]: unknown
}

class ErrorReporter {
  private sentryEnabled: boolean

  constructor() {
    this.sentryEnabled = !!(
      typeof window !== 'undefined' &&
      SENTRY_DSN &&
      SENTRY_DSN !== 'undefined'
    )
    if (typeof window !== 'undefined' && !SENTRY_DSN) {
      console.warn(
        '⚠️ SENTRY_DSN not set. ' +
        'Error monitoring falling back to console logging. ' +
        'Set SENTRY_DSN in .env.local to enable real Sentry tracking.'
      )
    }
  }

  /**
   * Capture an exception with structured context.
   * Sends to Sentry when configured; falls back to structured console logging.
   */
  captureException(error: unknown, context?: ErrorContext): void {
    if (this.sentryEnabled) {
      Sentry.captureException(error, {
        extra: context,
        tags: {
          component: context?.component,
          action: context?.action,
        },
      })
    } else {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(
        JSON.stringify({
          level: 'error',
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
          context,
          timestamp: new Date().toISOString(),
        })
      )
    }
  }

  /**
   * Capture a warning with context
   */
  captureWarning(message: string, context?: ErrorContext): void {
    if (this.sentryEnabled) {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: context,
      })
    } else {
      console.warn(JSON.stringify({ level: 'warning', message, context }))
    }
  }

  /**
   * Capture a breadcrumb for transaction tracing
   */
  addBreadcrumb(message: string, category?: string, data?: Record<string, unknown>): void {
    if (this.sentryEnabled) {
      Sentry.addBreadcrumb({ message, category, data, timestamp: Date.now() / 1000 })
    } else {
      // Fallback: store breadcrumbs in sessionStorage for diagnostic use
      const key = '__sentinel_breadcrumbs__'
      try {
        const existing = JSON.parse(window.sessionStorage.getItem(key) || '[]')
        const crumbs = Array.isArray(existing) ? existing : []
        crumbs.push({ message, category, timestamp: Date.now() })
        if (crumbs.length > 50) crumbs.shift()
        window.sessionStorage.setItem(key, JSON.stringify(crumbs))
      } catch {
        // Silently fail — breadcrumbs are non-critical
      }
    }
  }

  /**
   * Set the current user for Sentry scope
   */
  setUser(user: { id: string; address?: string } | null): void {
    if (this.sentryEnabled) {
      if (user) {
        Sentry.setUser({ id: user.id, walletAddress: user.address })
      } else {
        Sentry.setUser(null)
      }
    }
  }
}

export const errorReporter = new ErrorReporter()

/**
 * Higher-order function to wrap async operations with error reporting.
 * Replaces try/catch + console.error throughout the app.
 */
export function withErrorReporting<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T | null> {
  return fn().catch((error) => {
    errorReporter.captureException(error, context)
    return null
  })
}

/**
 * React error boundary hook — wraps error handling for component-level failures.
 */
export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred.'): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message)
  }
  return fallback
}

/**
 * Sentry ErrorBoundary wrapper for React client components.
 * Use this to wrap components that might throw during rendering.
 *
 * Usage:
 *   <SentryErrorBoundary fallback={<ErrorFallback />}>
 *     <YourComponent />
 *   </SentryErrorBoundary>
 */
export function SentryErrorBoundary({
  children,
  fallback,
  onError,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error) => void
}) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) =>
        fallback ? (
          <>{fallback}</>
        ) : (
          <div className="dash-card p-8 m-4 text-center">
            <p className="dash-label text-red-400 mb-2">Component Error</p>
            <p className="text-sm text-white/60">{String(error instanceof Error ? error.message : error)}</p>
          </div>
        )
      }
      onError={(error, _componentStack, _eventId) => onError?.(error instanceof Error ? error : new Error(String(error)))}
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}
