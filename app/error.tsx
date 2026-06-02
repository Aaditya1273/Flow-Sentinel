'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 48, height: 48, borderRadius: 24, background: 'rgba(248,113,113,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
          fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 700,
          letterSpacing: '-0.015em', lineHeight: 1.1,
          color: '#FAF8F5', margin: '0 0 8px',
        }}>
          System Anomaly
        </h1>
        <p style={{
          fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: 'rgba(248,113,113,0.5)',
          marginBottom: 24,
        }}>
          {error.digest ? `Error Ref: ${error.digest}` : 'Runtime Exception'}
        </p>
        <p style={{
          fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.6,
          color: 'rgba(250,248,245,0.55)', marginBottom: 40,
        }}>
          The protocol encountered an unexpected state. This has been logged for diagnostics. You can attempt to re-establish the connection.
        </p>
        <button
          onClick={reset}
          className="w-btn-outline"
          style={{ fontSize: '0.8125rem', padding: '12px 28px', cursor: 'pointer' }}
        >
          Re-establish Link
        </button>
      </div>
    </div>
  )
}
