'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M11.52 5.66L5.86 0L5.16 0.71L10.31 5.86H0V6.86H10.31L5.16 12.02L5.86 12.73L11.52 7.07L12.23 6.36L11.52 5.66Z" fill="currentColor"/>
    </svg>
  )
}

const STARS = [
  { left:'9%',  top:'64%', w:3,  blur:2, dur:5,   del:0    },
  { left:'13%', top:'78%', w:5,  blur:7, dur:7,   del:2.4  },
  { left:'15%', top:'40%', w:4,  blur:4, dur:4.5, del:1.1  },
  { left:'27%', top:'56%', w:7,  blur:3, dur:6,   del:3.6  },
  { left:'5%',  top:'30%', w:2,  blur:1, dur:4,   del:0.5  },
  { left:'22%', top:'72%', w:4,  blur:5, dur:6.5, del:4.8  },
  { left:'18%', top:'22%', w:3,  blur:3, dur:5.5, del:2    },
  { left:'8%',  top:'50%', w:6,  blur:5, dur:7,   del:1.5  },
  { left:'30%', top:'38%', w:2,  blur:2, dur:4.5, del:3.2  },
  { left:'12%', top:'90%', w:3,  blur:4, dur:6,   del:0.3  },
  { left:'68%', top:'34%', w:5,  blur:7, dur:5.5, del:0.8  },
  { left:'72%', top:'47%', w:3,  blur:2, dur:4,   del:4.2  },
  { left:'71%', top:'82%', w:11, blur:3, dur:6.5, del:1.8  },
  { left:'89%', top:'60%', w:7,  blur:6, dur:7.5, del:3    },
  { left:'95%', top:'35%', w:2,  blur:1, dur:4.5, del:1.2  },
  { left:'78%', top:'24%', w:4,  blur:4, dur:5,   del:3.8  },
  { left:'83%', top:'70%', w:3,  blur:3, dur:6,   del:0.6  },
  { left:'65%', top:'55%', w:5,  blur:6, dur:7,   del:2.8  },
  { left:'92%', top:'80%', w:6,  blur:5, dur:5.5, del:4.5  },
  { left:'75%', top:'15%', w:2,  blur:2, dur:4,   del:1.8  },
]

function Banner() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    try { if (!localStorage.getItem('sen-banner-v6')) setShow(true) }
    catch { setShow(true) }
  }, [])
  const dismiss = () => {
    setShow(false)
    try { localStorage.setItem('sen-banner-v6', '1') } catch {}
  }
  if (!show) return null
  return (
    <div role="region" aria-label="Site announcement" style={{
      position: 'relative', width: '100%', zIndex: 60,
      background: 'linear-gradient(90deg, #00EF8B 0%, #02D87E 50%, #37DDDF 100%)',
    }}>
      <div className="hidden md:flex" style={{ height: 52, alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 48px' }}>
        <p style={{ color: '#FAF8F5', fontSize: '0.9375rem', fontWeight: 500, margin: 0 }}>
          Boosted FLOW rewards on Flow Sentinel Pools!
        </p>
        <Link href="/vaults" style={{
          flexShrink: 0, borderRadius: 9999, background: 'rgba(0,0,0,0.30)',
          padding: '7px 20px', fontSize: '0.9375rem', fontWeight: 500,
          letterSpacing: '0.04em', color: '#FAF8F5', textDecoration: 'none',
          transition: 'background 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.30)')}
        >Find out more</Link>
        <button onClick={dismiss} aria-label="Close announcement" style={{
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(250,248,245,0.8)', padding: 6,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M13 1L1 13M1 1l12 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="flex md:hidden" style={{ height: 52, alignItems: 'center', padding: '0 16px', gap: 8 }}>
        <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(250,248,245,0.8)', padding: 6, flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M11 1L1 11M1 1l10 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
        </button>
        <Link href="/vaults" style={{ display: 'flex', flex: 1, alignItems: 'center', color: '#FAF8F5', textDecoration: 'none' }}>
          <span style={{ fontSize: '0.9375rem', fontWeight: 500, flex: 1, textAlign: 'center', lineHeight: 1.2 }}>
            Boosted SEN rewards on Flow Sentinel Pools!
          </span>
        </Link>
      </div>
    </div>
  )
}

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const mascotRef = useRef<HTMLDivElement>(null)
  const mascotImgRef = useRef<HTMLImageElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const auroraRef = useRef<HTMLDivElement>(null)
  const fogRef = useRef<HTMLDivElement>(null)
  const vignetteRef = useRef<HTMLDivElement>(null)
  const starsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const mascot = mascotRef.current
    const mascotImg = mascotImgRef.current
    const text = textRef.current
    const aurora = auroraRef.current
    const fog = fogRef.current
    const vignette = vignetteRef.current
    const stars = starsRef.current
    if (!section || !mascot || !mascotImg || !text || !aurora || !fog || !vignette || !stars) return

    /*
      CINEMATIC ATMOSPHERIC REVEAL — 3 stages synchronized to scroll
      
      STAGE 1 (0% → 40% scroll): Environment dominates
        - Aurora: bright (0.55) → dims
        - Fog: heavy (0.8) → clears
        - Stars: visible → fade
        - Mascot: submerged (translateY 18% → 10%, scale 0.92 → 1.0)
        - Text: full opacity → starts fading
      
      STAGE 2 (40% → 70% scroll): Transition
        - Aurora: dims to 0.2
        - Fog: clears to 0.2
        - Mascot: emerges (scale 1.0 → 1.06, moves up)
        - Text: fades out
      
      STAGE 3 (70% → 100% scroll): Subject focus
        - Aurora: near gone (0.1)
        - Fog: gone (0)
        - Mascot: primary focal point (scale 1.06 → 1.1, translateY -60px)
        - Vignette: darkens edges
    */

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.8, // heavy, cinematic scrub
      }
    })

    // ── AURORA: starts bright, dims as mascot emerges ──
    tl.fromTo(aurora,
      { opacity: 1.0 },
      { opacity: 0.08, ease: 'none' },
      0
    )

    // ── FOG: heavy at start, clears progressively ──
    tl.fromTo(fog,
      { opacity: 0.4 },
      { opacity: 0, ease: 'none' },
      0
    )

    // ── STARS: fade as environment clears ──
    tl.fromTo(stars,
      { opacity: 1 },
      { opacity: 0.2, ease: 'none' },
      0
    )

    // ── TEXT: scrolls up and fades ──
    tl.fromTo(text,
      { y: 0, opacity: 1 },
      { y: -100, opacity: 0, ease: 'none' },
      0
    )

    // ── MASCOT: emerges from atmosphere ──
    // Stage 1: submerged (translateY 18% is baked into img style)
    // We animate the container upward and scale up
    tl.fromTo(mascot,
      { y: 0, scale: 0.94 },
      { y: -70, scale: 1.06, ease: 'none' },
      0
    )

    // ── VIGNETTE: darkens edges as mascot becomes focal point ──
    tl.fromTo(vignette,
      { opacity: 0 },
      { opacity: 0.6, ease: 'none' },
      0.4 // starts at 40% scroll
    )

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <>
      <Banner />

      {/*
        Walrus exact structure:
        - section: relative, black bg, no fixed height
        - aurora: position absolute, inset 0, height 100% via explicit h-full
        - stars: inside aurora container
        - text: relative z-10
        - mascot: relative z-10, translate-y-[18%]
        - bottom label: absolute bottom
        
        The strip gap was caused by aurora container having no height.
        Fix: give the aurora container an explicit height matching the section.
        We use a wrapper div with minHeight 100svh to anchor the absolute aurora.
      */}
      <section
        ref={sectionRef}
        style={{
          position: 'relative',
          background: '#000',
          minHeight: '100svh',
        }}
      >
        {/* ── Layer 1: Aurora — starts at 0.55, dims to 0.08 on scroll ── */}
        <div
          ref={auroraRef}
          id="hero-aurora"
          style={{ position: 'absolute', inset: 0, opacity: 1.0, pointerEvents: 'none', willChange: 'opacity' }}
          aria-hidden="true"
        >
          <picture>
            <source srcSet="/images/aurora-home.CAK82OYC_Z1ganUr.avif 640w, /images/aurora-home.CAK82OYC_1Hdl8R.avif 1280w, /images/aurora-home.CAK82OYC_2twG8F.avif 1920w, /images/aurora-home.CAK82OYC_Z2nPxdc.avif 2560w" type="image/avif" sizes="100vw" />
            <source srcSet="/images/aurora-home.CAK82OYC_Z24swop.webp 640wc, /images/aurora-home.CAK82OYC_24YKvy.webp 1280w, /images/aurora-home.CAK82OYC_Z1bWPLM.webp 1920w, /images/aurora-home.CAK82OYC_ZY8VjI.webp 2560w" type="image/webp" sizes="100vw" />
            <img src="/images/aurora-home.CAK82OYC_1iwbQ2.webp" alt="" fetchPriority="high"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block', filter: 'hue-rotate(-60deg) saturate(1.3)' }}
              draggable={false}
            />
          </picture>
        </div>

        {/* ── Layer 2: Stars — fade as environment clears ── */}
        <div ref={starsRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', willChange: 'opacity' }} aria-hidden="true">
          {STARS.map((s, i) => (
            <div key={i} className="hero-star" style={{
              position: 'absolute', left: s.left, top: s.top,
              width: s.w, height: s.w, borderRadius: '50%', background: '#fff',
              filter: `blur(${s.blur}px)`,
              '--star-dur': `${s.dur}s`, '--star-del': `${s.del}s`,
            } as React.CSSProperties} />
          ))}
        </div>

        {/* ── Layer 3: Atmospheric fog — heavy at start, clears on scroll ── */}
        <div
          ref={fogRef}
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            /* Radial fog — dense center, dark edges */
            background: 'radial-gradient(ellipse 80% 60% at 50% 70%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.85) 100%)',
            opacity: 0.75,
            pointerEvents: 'none',
            zIndex: 4,
            willChange: 'opacity',
          }}
        />

        {/* Top vignette — always present */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '30%',
          background: 'linear-gradient(to bottom, #000 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 5,
        }} aria-hidden="true" />

        {/* Bottom vignette — covers scroll gap */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
          background: 'linear-gradient(to top, #000 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 5,
        }} aria-hidden="true" />

        {/* ── Layer 4: Typography ── */}
        <div
          ref={textRef}
          style={{
            position: 'relative', zIndex: 10,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center',
            paddingTop: 'clamp(40px, 5vw, 80px)',
            willChange: 'transform, opacity',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }} className="mt-10 md:mt-20">
            <motion.h1
              initial={{ opacity: 0, filter: 'blur(12px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                fontSize: 'clamp(3.5rem, 9vw, 7.5rem)',
                fontWeight: 500, lineHeight: 0.8, letterSpacing: '-0.03em',
                color: '#FAF8F5', marginBottom: 16,
              }}
            >
              Deploy Once<br />Grow Forever
            </motion.h1>

            <div style={{ maxWidth: '25rem', margin: '0 auto' }} className="md:max-w-[35rem] lg:max-w-[58rem]">
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', lineHeight: 1.6,
                  color: 'rgba(250,248,245,0.55)', textAlign: 'center', marginBottom: 32,
                }}
              >
                Flow Sentinel is a Provable Wealth Platform for AI and onchain finance.{' '}
                <strong style={{ color: '#FAF8F5', fontWeight: 600 }}>Secure</strong>,{' '}
                <strong style={{ color: '#FAF8F5', fontWeight: 600 }}>programmable</strong>, and{' '}
                <strong style={{ color: '#FAF8F5', fontWeight: 600 }}>radically fast</strong>,{' '}
                infrastructure built for the next era of capital.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <GlowButton href="/dashboard">Start building <Arrow /></GlowButton>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Layer 5: Mascot — emerges from atmosphere on scroll ── */}
        <div
          ref={mascotRef}
          style={{
            position: 'relative', zIndex: 10,
            display: 'flex', justifyContent: 'center',
            willChange: 'transform',
            /* Initial state: slightly submerged (scale 0.94 set by GSAP fromTo) */
          }}
          aria-hidden="true"
        >
          <picture>
            <img
              ref={mascotImgRef}
              src="/landing/hero.png"
              alt=""
              style={{
                width: '100%', maxWidth: 'min(565px, 74vw)',
                height: 'auto', display: 'block', margin: '0 auto',
                userSelect: 'none', pointerEvents: 'none',
              }}
              draggable={false}
            />
          </picture>

          {/* Bottom cinematic fade */}
          <div aria-hidden="true" style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
            background: 'linear-gradient(180deg, transparent 0%, #000 80%)',
            pointerEvents: 'none', zIndex: 2,
          }} />
        </div>

        {/* ── Layer 6: Edge vignette — darkens as mascot becomes focal point ── */}
        <div
          ref={vignetteRef}
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 8,
            willChange: 'opacity',
          }}
        />

        {/* ── Section bottom fade — covers aurora bottom edge, eliminates strip ── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '12rem',
            background: 'linear-gradient(180deg, transparent 0%, #000 100%)',
            pointerEvents: 'none',
            zIndex: 15,
          }}
        />

        {/* Bottom label */}
        <div style={{
          position: 'absolute', bottom: 20, left: 0, right: 0,
          zIndex: 20, display: 'flex', justifyContent: 'center',
        }} aria-hidden="true">
          <p style={{
            fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'rgba(250,248,245,0.22)', margin: 0,
          }}>
            Your Verifiable Wealth Platform
          </p>
        </div>
      </section>

      <style>{`
        .hero-star {
          animation: star-fade var(--star-dur) var(--star-del) ease-in-out infinite;
          opacity: 0;
        }
        @keyframes star-fade {
          0%, 100% { opacity: 0; }
          50%       { opacity: 1; }
        }
      `}</style>
    </>
  )
}

export function GlowButton({
  href,
  children,
  large,
}: {
  href: string
  children: React.ReactNode
  large?: boolean
}) {
  return (
    <Link
      href={href}
      style={{
        position: 'relative', display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 26, padding: 2, overflow: 'hidden',
        textDecoration: 'none',
        transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <span style={{
        position: 'absolute', inset: '-200%',
        background: 'conic-gradient(from 0deg, transparent 20%, #FAF8F5 45%, rgba(250,248,245,0.5) 55%, transparent 80%)',
        animation: 'glowSpin 3s linear infinite',
        zIndex: 0,
      }} />
      <span style={{
        position: 'relative', zIndex: 1,
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: large ? '16px 40px' : '13px 30px',
        borderRadius: 24, background: '#000', color: '#FAF8F5',
        fontSize: large ? '1.125rem' : '1rem',
        fontWeight: 500, letterSpacing: '0.045em', whiteSpace: 'nowrap',
      }}>
        {children}
      </span>
      <style>{`@keyframes glowSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
    </Link>
  )
}
