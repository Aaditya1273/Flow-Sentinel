'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import { errorReporter } from 'lib/sentry-wrapper'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  name?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorReporter.captureException(error, {
      component: this.props.name || 'AppErrorBoundary',
      ...errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                background: 'rgba(248,113,113,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(248,113,113,0.6)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                fontWeight: 700,
                letterSpacing: '-0.015em',
                lineHeight: 1.1,
                color: '#FAF8F5',
                margin: '0 0 8px',
              }}
            >
              {this.props.name || 'System Anomaly'}
            </h1>
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'rgba(248,113,113,0.5)',
                marginBottom: 24,
              }}
            >
              Runtime Exception
            </p>
            <p
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                lineHeight: 1.6,
                color: 'rgba(250,248,245,0.55)',
                marginBottom: 40,
              }}
            >
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 28px',
                borderRadius: 26,
                border: '1px solid rgba(250,248,245,0.15)',
                background: 'transparent',
                color: '#FAF8F5',
                fontSize: '0.8125rem',
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(250,248,245,0.04)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
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
