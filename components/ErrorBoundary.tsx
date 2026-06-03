'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import { errorReporter } from '@/lib/sentry-wrapper'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorReporter.captureException(error, { component: 'ErrorBoundary', action: 'componentDidCatch' })
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          className="w-card p-8"
          style={{ border: '1px solid rgba(248,113,113,0.15)' }}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <span
              className="text-label-sm"
              style={{ color: 'rgba(248,113,113,0.6)' }}
            >
              Error
            </span>
            <p
              className="text-body-s"
              style={{ color: 'rgba(250,248,245,0.55)' }}
            >
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="w-btn-outline"
              style={{ fontSize: '0.8125rem', padding: '8px 20px' }}
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
