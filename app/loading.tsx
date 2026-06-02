export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 48, height: 48, margin: '0 auto 24px' }}>
          <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(250,248,245,0.06)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, border: '2px solid transparent', borderTopColor: '#00EF8B', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
        <p
          className="animate-pulse"
          style={{
            fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'rgba(250,248,245,0.4)',
          }}
        >
          Establishing Secure Link
        </p>
      </div>
    </div>
  )
}
