'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export function StackSection() {
  return (
    <section
      style={{
        background: '#000',
        position: 'relative',
        borderRadius: '36px 36px 0 0',
        /* Negative margin pulls this section UP over the mascot bottom */
        marginTop: '-12rem',
      }}
      className="sm:rounded-tl-[48px] sm:rounded-tr-[48px] sm:-mt-[12rem] lg:-mt-[15rem]"
    >
      {/*
        Frost blur strip at the very top — blends the cream→black transition.
        Walrus uses backdrop-blur-[12px] + dark gradient overlay.
        Height matches --frost-h: 9rem
      */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '9rem',
          borderRadius: '36px 36px 0 0',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 2,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.60) 0%, #000000 80%)',
        }} />
      </div>

      {/* Solid black fill below the frost strip */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '9rem', left: 0, right: 0, bottom: 0,
          background: '#000',
          zIndex: 1,
        }}
      />

      {/* Content — sits above both frost + fill layers */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: 'clamp(100px, 12vw, 160px) 24px 0',
        }}>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
              fontSize: 'clamp(2.8rem, 6vw, 5rem)',
              fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.03em',
              color: '#FAF8F5', textAlign: 'center', marginBottom: 20,
            }}
          >
            Part of the<br />Flow Stack
          </motion.h2>

          {/* Subtext */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ maxWidth: '55.625rem', margin: '0 auto 64px' }}
          >
            <p style={{
              fontSize: '1.125rem', lineHeight: 1.6,
              color: 'rgba(250,248,245,0.55)',
              textAlign: 'center',
            }}>
              Flow Sentinel integrates seamlessly with the Flow ecosystem, providing
              verifiable data and storage for{' '}
              <strong style={{ color: '#FAF8F5', fontWeight: 600 }}>Flow applications</strong>{' '}
              on top of{' '}
              <strong style={{ color: '#FAF8F5', fontWeight: 600 }}>Flow Ledger</strong>.
            </p>
          </motion.div>

          {/* Stack diagram — new branded image with labels baked in */}
          <div style={{ maxWidth: '56.5625rem', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src="/images/flow-stack.png"
                alt="Flow Sentinel Stack Diagram"
                style={{ width: '100%', height: 'auto', display: 'block' }}
                draggable={false}
              />
            </motion.div>

            {/* Explore CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ display: 'flex', justifyContent: 'center', marginTop: 48, paddingBottom: 80 }}
            >
              <Link
                href="/dashboard"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 12,
                  padding: '12px 32px', borderRadius: 26,
                  border: '1px solid rgba(250,248,245,0.20)',
                  background: 'transparent', color: '#FAF8F5',
                  fontSize: '1.125rem', fontWeight: 430, letterSpacing: '0.04em',
                  textDecoration: 'none', transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(250,248,245,0.55)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(250,248,245,0.20)')}
              >
                Explore on Flow
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M9 0.00427246H0V1.00427H9V0.00427246Z" fill="currentColor"/>
                  <path d="M8.29674 9.13222e-06L0.00238037 8.29437L0.709487 9.00148L9.00385 0.707116L8.29674 9.13222e-06Z" fill="currentColor"/>
                  <path d="M9 0.00427246H8V9.00427H9V0.00427246Z" fill="currentColor"/>
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
