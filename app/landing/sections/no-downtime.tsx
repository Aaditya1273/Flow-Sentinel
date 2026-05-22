'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function NoDowntimeSection() {
  return (
    <section
      style={{
        background: '#000',
        padding: '120px 0 140px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 4, padding: '8px 12px',
            background: 'rgba(0,239,139,0.08)',
            border: '1px solid rgba(0,239,139,0.20)',
            color: 'rgba(250,248,245,0.70)',
          }}>
            <p style={{
              fontSize: 14, lineHeight: 1, fontWeight: 400,
              letterSpacing: '0.7px', textTransform: 'uppercase', margin: 0,
            }}>
              Your Verifiable Wealth Platform
            </p>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.025em',
            color: '#FAF8F5', marginBottom: 32,
          }}
        >
          No downtime.<br />
          No compromises.<br />
          <span style={{ color: 'rgba(250,248,245,0.28)' }}>No limits.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: '1.0625rem', lineHeight: 1.65,
            color: 'rgba(250,248,245,0.55)',
            maxWidth: 560, margin: '0 auto 40px',
          }}
        >
          For too long, developers have built around infrastructure limits.{' '}
          <strong style={{ color: '#FAF8F5', fontWeight: 600 }}>Flow Sentinel removes them.</strong>{' '}
          Get secure storage, verifiable data, and full control while you build the next big thing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.14 }}
        >
          <Link
            href="/docs"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '12px 32px', borderRadius: 26,
              border: '1px solid rgba(250,248,245,0.20)',
              background: 'transparent', color: '#FAF8F5',
              fontSize: '1.125rem', fontWeight: 430, letterSpacing: '0.04em',
              textDecoration: 'none', transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(250,248,245,0.55)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(250,248,245,0.20)')}
          >
            Read the docs
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path d="M9 0.00427246H0V1.00427H9V0.00427246Z" fill="currentColor"/>
              <path d="M8.29674 9.13222e-06L0.00238037 8.29437L0.709487 9.00148L9.00385 0.707116L8.29674 9.13222e-06Z" fill="currentColor"/>
              <path d="M9 0.00427246H8V9.00427H9V0.00427246Z" fill="currentColor"/>
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
