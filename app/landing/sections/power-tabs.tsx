'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const TABS = [
  {
    id: 'availability',
    label: 'Availability',
    title: 'Always\navailable',
    body: 'With Flow Sentinel, transactions execute faster, are secured more efficiently, and stay active when it matters most.',
    img: '/images/aurora-4.aIb2xl0V_Z1BbJH0.webp',
    imgAvif: '/images/aurora-4.aIb2xl0V_Z1TBwdN.avif',
    icon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="36" cy="36" r="28" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
        <path d="M36 20V36L44 44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="36" cy="36" r="3" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'programmability',
    label: 'Programmability',
    title: 'Programmable\nat scale',
    body: 'Use smart contracts to control who can access wealth and what they can do with it. Apps and AI agents can then work entirely on their own.',
    img: '/images/aurora-5.D7pAFPrV_Z1S9G8Q.webp',
    imgAvif: '/images/aurora-5.D7pAFPrV_2f1Kct.avif',
    icon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="20" width="48" height="32" rx="6" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
        <path d="M24 32L30 38L24 44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M34 44H48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'verifiability',
    label: 'Verifiability',
    title: 'Verifiable\nand fast',
    body: 'Every vault gets a verifiable ID and tracked history, so you can always prove where yield came from.',
    img: '/images/aurora-8.BeOeOLpB_Z10k8Bf.webp',
    imgAvif: '/images/aurora-8.BeOeOLpB_1fSH91.avif',
    icon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M36 14L54 22V38C54 48 46 56 36 58C26 56 18 48 18 38V22L36 14Z" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
        <path d="M28 36L33 41L44 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'privacy',
    label: 'Privacy',
    title: 'Private\nby design',
    body: 'The only decentralized platform where you control exactly who can see your wealth.',
    img: '/images/aurora-4.aIb2xl0V_Z1BbJH0.webp',
    imgAvif: '/images/aurora-4.aIb2xl0V_18J5Sn.avif',
    icon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="32" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
        <path d="M28 32V26C28 21.6 31.6 18 36 18C40.4 18 44 21.6 44 26V32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="36" cy="44" r="3" fill="currentColor"/>
      </svg>
    ),
  },
]

export function PowerTabsSection() {
  const [activeIdx, setActiveIdx] = useState(0)
  const prev = (activeIdx - 1 + TABS.length) % TABS.length
  const next = (activeIdx + 1) % TABS.length

  return (
    <section style={{ background: '#000', padding: '120px 0 100px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* "Power to the builder" heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.025em',
            color: '#FAF8F5', textAlign: 'center', marginBottom: 48,
          }}
        >
          Power to the builder
        </motion.h2>

        {/* Tab pills */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, flexWrap: 'wrap', marginBottom: 48,
        }}>
          {TABS.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveIdx(i)}
              style={{
                padding: '8px 14px', borderRadius: 4,
                background: i === activeIdx ? '#FAF8F5' : 'rgba(161,200,255,0.1)',
                color: i === activeIdx ? '#000' : 'rgba(250,248,245,0.55)',
                fontSize: '0.9375rem', fontWeight: 430, letterSpacing: '0.04em',
                cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                border: 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3-column centered slider — full bleed with side fades */}
      <div style={{ position: 'relative' }}>
        {/* Left fade */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: 0,
          width: '25vw', zIndex: 10, pointerEvents: 'none',
          background: 'linear-gradient(to right, #000 0%, transparent 100%)',
        }} />
        {/* Right fade */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, right: 0,
          width: '25vw', zIndex: 10, pointerEvents: 'none',
          background: 'linear-gradient(to left, #000 0%, transparent 100%)',
        }} />

        <div style={{
          display: 'flex',
          gap: 'clamp(12px, 2vw, 24px)',
          alignItems: 'stretch',
          justifyContent: 'center',
          padding: '0 2rem',
          overflow: 'hidden',
        }}>
          <Slide tab={TABS[prev]} active={false} onClick={() => setActiveIdx(prev)} />
          <Slide tab={TABS[activeIdx]} active={true} onClick={() => {}} />
          <Slide tab={TABS[next]} active={false} onClick={() => setActiveIdx(next)} />
        </div>
      </div>

      {/* Whitepaper CTA */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          style={{ display: 'flex', justifyContent: 'center', marginTop: 56 }}
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
            Read the Whitepaper
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

function Slide({ tab, active, onClick }: { tab: typeof TABS[0]; active: boolean; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      animate={{ opacity: active ? 1 : 0.35 }}
      transition={{ duration: 0.3 }}
      style={{
        borderRadius: 48,
        background: 'rgba(161,200,255,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        width: active ? 'clamp(320px, 50vw, 600px)' : 'clamp(240px, 36vw, 440px)',
        flexShrink: 0,
        cursor: active ? 'default' : 'pointer',
        transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)',
        padding: 'clamp(24px, 3vw, 48px)',
        justifyContent: 'space-between',
        minHeight: 420,
      }}
    >
      {/* Icon */}
      <div style={{ color: '#FAF8F5', marginBottom: 48, width: 72, height: 72 }}>
        {tab.icon}
      </div>

      {/* Text */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em',
          color: '#FAF8F5', marginBottom: 16, whiteSpace: 'pre-line',
        }}>
          {tab.title}
        </h3>
        <p style={{
          fontSize: '1rem', lineHeight: 1.6,
          color: 'rgba(250,248,245,0.55)', margin: 0,
        }}>
          {tab.body}
        </p>
      </div>
    </motion.div>
  )
}
