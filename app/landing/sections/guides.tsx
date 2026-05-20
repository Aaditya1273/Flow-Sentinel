'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const GUIDES = [
  {
    title: 'Learn how to get started on Flow Sentinel',
    button: 'Watch tutorials',
    href: '/docs',
    icon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="12" width="56" height="40" rx="6" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
        <path d="M30 26L48 36L30 46V26Z" fill="currentColor" opacity="0.8"/>
        <path d="M20 58H52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
  },
  {
    title: 'Learn how to get started on Flow Sentinel',
    button: 'Start building',
    href: '/docs',
    icon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="52" height="52" rx="8" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
        <path d="M10 28H62" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
        <path d="M28 28V62" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
        <rect x="18" y="18" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
      </svg>
    ),
  },
  {
    title: 'Learn how to get started on Flow Sentinel',
    button: 'Fully Transparent',
    href: '/docs',
    icon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="36" cy="36" r="26" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
        <circle cx="36" cy="36" r="16" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
        <circle cx="36" cy="36" r="4" fill="currentColor" opacity="0.8"/>
        <path d="M36 10V20M36 52V62M10 36H20M52 36H62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
  },
]

export function GuidesSection() {
  return (
    <section style={{ background: 'transparent', paddingTop: 'clamp(80px, 10vw, 140px)', paddingBottom: 'clamp(16px, 2vw, 24px)', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.025em',
            color: '#FAF8F5', textAlign: 'center',
            marginBottom: 'clamp(48px, 6vw, 80px)',
          }}
        >
          Get your data right
        </motion.h2>

        {/* 3-column grid — walrus exact: grid-cols-1 mobile, grid-cols-3 lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 24 }}>
          {GUIDES.map((g, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 36,
                background: 'rgba(161,200,255,0.1)',
                padding: '40px 32px 48px',
                textAlign: 'center',
                height: '100%',
              }}
            >
              {/* Icon */}
              <div style={{ color: '#FAF8F5', marginBottom: 24, width: 72, height: 72, flexShrink: 0 }}>
                {g.icon}
              </div>

              {/* Title */}
              <p style={{
                fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                fontSize: 'clamp(1.125rem, 1.8vw, 1.5rem)',
                fontWeight: 350, lineHeight: 1.3,
                color: '#FAF8F5',
                marginBottom: 32, flex: 1,
              }}>
                {g.title}
              </p>

              {/* Button */}
              <Link
                href={g.href}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  gap: 12, padding: '12px 32px', borderRadius: 26,
                  border: '1px solid rgba(250,248,245,0.20)',
                  background: 'transparent', color: '#FAF8F5',
                  fontSize: '1.125rem', fontWeight: 430, letterSpacing: '0.04em',
                  textDecoration: 'none', transition: 'border-color 0.2s',
                  marginTop: 'auto',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(250,248,245,0.55)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(250,248,245,0.20)')}
              >
                {g.button}
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M9 0.00427246H0V1.00427H9V0.00427246Z" fill="currentColor"/>
                  <path d="M8.29674 9.13222e-06L0.00238037 8.29437L0.709487 9.00148L9.00385 0.707116L8.29674 9.13222e-06Z" fill="currentColor"/>
                  <path d="M9 0.00427246H8V9.00427H9V0.00427246Z" fill="currentColor"/>
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
