import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <h1 style={{
          fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
          fontSize: 'clamp(3.5rem, 8vw, 7rem)', fontWeight: 900,
          letterSpacing: '-0.03em', lineHeight: 0.95,
          color: '#FAF8F5', margin: '0 0 8px',
        }}>
          404
        </h1>
        <p style={{
          fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: 'rgba(250,248,245,0.4)',
          marginBottom: 24,
        }}>
          Sector Not Found
        </p>
        <p style={{
          fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.6,
          color: 'rgba(250,248,245,0.55)', marginBottom: 40,
        }}>
          This coordinate does not exist in known space. The vault you&apos;re looking for may have been evacuated, never initialized, or the signal was lost in transit.
        </p>
        <Link
          href="/"
          className="w-btn-outline"
          style={{ textDecoration: 'none', display: 'inline-flex' }}
        >
          Return to Command Center
        </Link>
      </div>
    </div>
  )
}
