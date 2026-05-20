'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export function TokenSection() {
  return (
    <section
      style={{
        background: '#FAF8F5',
        color: '#111',
        position: 'relative',
        borderRadius: '36px 36px 0 0',
        /* NO overflow:hidden — mascot must bleed below for Stack to cover */
      }}
      className="sm:rounded-tl-[48px] sm:rounded-tr-[48px]"
    >
      {/* Aurora — covers bottom 67% of section */}
      <div
        style={{
          position: 'absolute',
          top: '33%', right: 0, bottom: 0, left: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <picture>
          <source
            srcSet="/images/aurora-8.BeOeOLpB_1fSH91.avif 1920w, /images/aurora-8.BeOeOLpB_ZmgBdK.avif 2560w"
            type="image/avif" sizes="100vw"
          />
          <source
            srcSet="/images/aurora-8.BeOeOLpB_1yjtEO.webp 1920w, /images/aurora-8.BeOeOLpB_Z3POGW.webp 2560w"
            type="image/webp" sizes="100vw"
          />
          <img
            src="/images/aurora-8.BeOeOLpB_Z10k8Bf.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', filter: 'hue-rotate(-60deg) saturate(1.3)' }}
            draggable={false}
          />
        </picture>
      </div>

      {/* Text content */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1200, margin: '0 auto',
          padding: 'clamp(100px, 12vw, 160px) 24px 0',
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 4, padding: '8px 12px',
            background: 'linear-gradient(87deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.10) 100%)',
          }}>
            <p style={{
              fontSize: 14, lineHeight: 1, fontWeight: 400,
              letterSpacing: '0.7px', textTransform: 'uppercase',
              color: '#111', margin: 0,
            }}>
              The Art Of Flow Sentinel
            </p>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.03em',
            color: '#111', textAlign: 'center', marginBottom: 20,
          }}
        >
          The economic<br />heart of Sentinel
        </motion.h2>

        {/* Subtext + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            maxWidth: '35rem', margin: '0 auto',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}
        >
          <p style={{
            fontSize: '1.125rem', lineHeight: 1.6,
            color: '#555', textAlign: 'center', marginBottom: 28,
          }}>
            SEN is used to pay for security and secure the
            network through staking.
          </p>

          <Link
            href="/docs"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: 12, borderRadius: 26,
              border: '3px solid #00EF8B', background: '#00EF8B', color: '#000',
              padding: '10px 32px',
              fontSize: '1.125rem', fontWeight: 430, letterSpacing: '0.04em',
              textDecoration: 'none', transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#02D87E'
              e.currentTarget.style.borderColor = '#02D87E'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#00EF8B'
              e.currentTarget.style.borderColor = '#00EF8B'
            }}
          >
            Learn about SEN
          </Link>
        </motion.div>
      </div>

      {/*
        MASCOT — walrus exact behaviour:
        • pointer-events-none
        • Floats up slightly via animation (rotate -10deg, y offset)
        • The Stack section slides OVER the bottom ~45% of this image
        • NO "S" overlay — keep the W tile as-is
        • The Stack section's gradient fade handles the visual crop
      */}
      <motion.div
        initial={{ opacity: 0, y: 150 }}
        whileInView={{ opacity: 1, y: -40, rotate: -10 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        style={{
          pointerEvents: 'none',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center',
          marginTop: 20,
        }}
      >
        <picture>
        <img
            src="/landing/middle2.png"
            alt="SEN Token mascot"
            style={{
              /*
                middle2.png: 1948×3004 (aspect 0.648)
                original wal-wal: 1646×1402 (aspect 1.174)
                Original rendered at max-width clamp(260px, 34rem, 43rem) ≈ 544px → height ~463px
                New image at same 463px tall → width = 463 × (1948/3004) = ~300px
                So max-width ~300px keeps visual height identical.
              */
              display: 'block',
              margin: '0 auto',
              width: '100%',
              maxWidth: 'clamp(200px, 28rem, 36rem)',
              height: 'auto',
            }}
            draggable={false}
          />
        </picture>
      </motion.div>
    </section>
  )
}
