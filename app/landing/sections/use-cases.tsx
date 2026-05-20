'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const CASES = [
  {
    category: 'Wealth Markets',
    categoryColor: '#00EF8B',
    subtitle: 'Your assets. Your terms. No middleman.',
    body: 'Build open, verifiable wealth marketplaces where creators and businesses can allocate assets and get paid — without intermediaries.',
    href: '/docs',
  },
  {
    category: 'DeFi',
    categoryColor: '#00EF8B',
    subtitle: 'Real-time protection for the digital economy.',
    body: 'Provide users with always-on services and shield online transactions from bad actors by authenticating interactions in real time.',
    href: '/vaults',
  },
  {
    category: 'AI',
    categoryColor: '#00EF8B',
    subtitle: 'Safe data in. Reliable AI platforms out.',
    body: 'AI is only as good as the transactions it trains on. Flow Sentinel allows AI agents to authenticate and verify workloads, preventing corrupted results.',
    href: '/docs',
  },
]

/* Dot indicator */
function Dot({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Go to slide"
      style={{
        position: 'relative',
        height: 3,
        width: '4.75rem',
        borderRadius: 9999,
        cursor: 'pointer',
        border: 'none',
        background: active ? '#FAF8F5' : '#222',
        transition: 'background 0.3s',
        padding: 0,
      }}
    />
  )
}

export function UseCasesSection() {
  const [active, setActive] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState({ on: false, startX: 0, scrollLeft: 0 })

  const scrollToCard = (idx: number) => {
    const track = trackRef.current
    if (!track) return
    const cards = track.querySelectorAll<HTMLElement>('[data-card]')
    if (!cards[idx]) return
    const card = cards[idx]
    const trackLeft = track.getBoundingClientRect().left
    const cardLeft = card.getBoundingClientRect().left
    const offset = cardLeft - trackLeft - (track.clientWidth / 2) + (card.offsetWidth / 2)
    track.scrollBy({ left: offset, behavior: 'smooth' })
  }

  const handleDotClick = (idx: number) => {
    setActive(idx)
    scrollToCard(idx)
  }

  const onDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return
    setDrag({ on: true, startX: e.pageX - trackRef.current.offsetLeft, scrollLeft: trackRef.current.scrollLeft })
  }
  const onMove = (e: React.MouseEvent) => {
    if (!drag.on || !trackRef.current) return
    e.preventDefault()
    trackRef.current.scrollLeft = drag.scrollLeft - (e.pageX - trackRef.current.offsetLeft - drag.startX)
  }
  const onUp = () => setDrag(d => ({ ...d, on: false }))

  return (
    <section style={{ background: '#000', padding: '120px 0 100px', overflow: 'hidden', position: 'relative', zIndex: 10 }}>

      {/* Badge + Heading */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', marginBottom: 64 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 4, padding: '8px 12px',
            background: 'linear-gradient(77deg, rgba(26,31,39,0.3) 0%, rgba(26,31,39,0.85) 100%)',
            color: '#FAF8F5',
          }}>
            <p style={{ fontSize: 14, lineHeight: 1, fontWeight: 400, letterSpacing: '0.7px', textTransform: 'uppercase', margin: 0 }}>
              Use cases
            </p>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.025em',
            color: '#FAF8F5', textAlign: 'center', margin: 0,
          }}
        >
          The future runs on Flow Sentinel
        </motion.h2>
      </div>

      {/* Swiper — full bleed with side fades */}
      <div style={{ position: 'relative' }}>
        {/* Left fade */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: 0,
          width: '20%', zIndex: 10, pointerEvents: 'none',
          background: 'linear-gradient(to right, #000 0%, transparent 100%)',
        }} />
        {/* Right fade */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, right: 0,
          width: '20%', zIndex: 10, pointerEvents: 'none',
          background: 'linear-gradient(to left, #000 0%, transparent 100%)',
        }} />

        <div
          ref={trackRef}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            paddingLeft: 'max(24px, calc((100vw - 1200px) / 2 + 24px))',
            paddingRight: 'max(24px, calc((100vw - 1200px) / 2 + 24px))',
            paddingBottom: 4,
            cursor: drag.on ? 'grabbing' : 'grab',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            userSelect: 'none',
          }}
        >
          {CASES.map((c, i) => (
            <motion.div
              key={i}
              data-card
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.65, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              style={{
                flexShrink: 0,
                width: 'clamp(300px, 80vw, 640px)',
                borderRadius: 48,
                background: 'rgba(161,200,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 'clamp(32px, 4vw, 64px)',
                textAlign: 'center',
                minHeight: 400,
              }}
            >
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em',
                  color: '#FAF8F5',
                  marginBottom: 'clamp(0.75rem, 1.1vw, 1rem)',
                }}>
                  <span style={{ color: c.categoryColor }}>{c.category}</span>
                  <br />
                  <span>{c.subtitle}</span>
                </h3>
                <p style={{
                  fontSize: '1.125rem', lineHeight: 1.6,
                  color: 'rgba(250,248,245,0.55)',
                  marginBottom: 'clamp(1rem, 1.65vw, 1.5rem)',
                }}>
                  {c.body}
                </p>
                <Link
                  href={c.href}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    color: '#FAF8F5', fontSize: '1rem', fontWeight: 500,
                    letterSpacing: '0.04em', textDecoration: 'none',
                    borderBottom: '1px solid currentColor',
                    paddingBottom: 2,
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'transparent')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'currentColor')}
                >
                  Learn more
                </Link>
              </div>

              {/* Partner logos row at bottom — removed, walrus doesn't have this */}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
        {CASES.map((_, i) => (
          <Dot key={i} active={i === active} onClick={() => handleDotClick(i)} />
        ))}
      </div>
    </section>
  )
}
