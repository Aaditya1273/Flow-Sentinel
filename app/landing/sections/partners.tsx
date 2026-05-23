'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import BlurText from 'components/ui/blur-text'

/* ── Scroll-reactive logo strip engine ── */
function ScrollLogoStrip() {
  const trackRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef({
    offset: 0,
    smoothVelocity: 0,
    lastScrollY: 0,
    rawVelocity: 0,
    raf: 0,
    singleWidth: 0,
  })

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const state = stateRef.current

    const measure = () => { state.singleWidth = track.scrollWidth / 2 }
    const t = setTimeout(measure, 400)

    const imgs = track.querySelectorAll('img')
    let loaded = 0
    imgs.forEach(img => {
      if ((img as HTMLImageElement).complete) { loaded++; if (loaded >= imgs.length) measure() }
      else img.addEventListener('load', () => { loaded++; if (loaded >= imgs.length) measure() })
    })

    state.lastScrollY = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      state.rawVelocity = y - state.lastScrollY
      state.lastScrollY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const tick = () => {
      /* lerp toward raw velocity — heavy inertia */
      state.smoothVelocity += (state.rawVelocity - state.smoothVelocity) * 0.08
      /* momentum decay */
      state.rawVelocity *= 0.85
      /* accumulate offset — right to left only (always negative delta) */
      state.offset -= Math.abs(state.smoothVelocity) * 0.5
      /* seamless loop */
      if (state.singleWidth > 0 && state.offset < -state.singleWidth) {
        state.offset += state.singleWidth
      }
      track.style.transform = `translate3d(${state.offset}px, 0, 0)`
      state.raf = requestAnimationFrame(tick)
    }
    state.raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(state.raf)
      window.removeEventListener('scroll', onScroll)
      clearTimeout(t)
    }
  }, [])

  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      {/* Left fade */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
        background: 'linear-gradient(to right, #000 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      {/* Right fade */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
        background: 'linear-gradient(to left, #000 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Desktop */}
      <div className="hidden md:block">
        <div
          ref={trackRef}
          style={{
            display: 'flex', alignItems: 'center', width: 'max-content',
            willChange: 'transform', transform: 'translate3d(0, 0, 0)',
          }}
        >
          {[0, 1].map(copy => (
            <div key={copy} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <span style={{
                fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                fontSize: 'clamp(3rem, 6vw, 5.5rem)',
                fontWeight: 700, letterSpacing: '-0.03em',
                color: 'rgba(250,248,245,0.55)',
                whiteSpace: 'nowrap', lineHeight: 1,
                paddingRight: '3rem',
              }}>Flow Sentinel</span>
              <span style={{
                width: 16, height: 16, borderRadius: '50%',
                background: 'rgba(250,248,245,0.55)',
                flexShrink: 0, display: 'inline-block',
                marginRight: '3rem',
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="block md:hidden">
        <MobileStrip />
      </div>
    </div>
  )
}

function MobileStrip() {
  const trackRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef({ offset: 0, smoothVelocity: 0, lastScrollY: 0, rawVelocity: 0, raf: 0, singleWidth: 0 })

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const state = stateRef.current
    const t = setTimeout(() => { state.singleWidth = track.scrollWidth / 2 }, 400)
    const onScroll = () => {
      const y = window.scrollY
      state.rawVelocity = y - state.lastScrollY
      state.lastScrollY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    const tick = () => {
      state.smoothVelocity += (state.rawVelocity - state.smoothVelocity) * 0.08
      state.rawVelocity *= 0.85
      state.offset -= Math.abs(state.smoothVelocity) * 0.5
      if (state.singleWidth > 0 && state.offset < -state.singleWidth) state.offset += state.singleWidth
      track.style.transform = `translate3d(${state.offset}px, 0, 0)`
      state.raf = requestAnimationFrame(tick)
    }
    state.raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(state.raf); window.removeEventListener('scroll', onScroll); clearTimeout(t) }
  }, [])

  return (
    <div
      ref={trackRef}
      style={{ display: 'flex', alignItems: 'center', width: 'max-content', willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
    >
      {[0, 1].map(copy => (
        <div key={copy} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 700, letterSpacing: '-0.03em',
            color: 'rgba(250,248,245,0.55)',
            whiteSpace: 'nowrap', lineHeight: 1,
            paddingRight: '2rem',
          }}>Flow Sentinel</span>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: 'rgba(250,248,245,0.55)',
            flexShrink: 0, display: 'inline-block',
            marginRight: '2rem',
          }} />
        </div>
      ))}
    </div>
  )
}

export function PartnersSection() {
  return (
    <section
      style={{
        background: '#000',
        padding: 'clamp(48px, 6vw, 80px) clamp(16px, 3vw, 40px) 0',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative' }}>

        {/*
          AURORA CARD — rounded corners, NO overflow:hidden
          The gradient fades out naturally at the bottom via an overlay.
          This prevents the sharp rectangular cut.
        */}
        <div
          style={{
            position: 'relative',
            borderRadius: 'clamp(24px, 3vw, 48px)',
            /* NO overflow:hidden — gradient overlay handles the fade */
            paddingBottom: 'clamp(160px, 22vw, 300px)',
          }}
        >
          {/* Aurora background image */}
          <picture>
            <source
              srcSet="/images/aurora-4.aIb2xl0V_Z2l5Ui2.avif 640w, /images/aurora-4.aIb2xl0V_1ydtei.avif 1280w, /images/aurora-4.aIb2xl0V_Z1TBwdN.avif 1920w, /images/aurora-4.aIb2xl0V_18J5Sn.avif 2560w"
              type="image/avif" sizes="100vw"
            />
            <source
              srcSet="/images/aurora-4.aIb2xl0V_Z11GUG8.webp 640w, /images/aurora-4.aIb2xl0V_1IO7qL.webp 1280w, /images/aurora-4.aIb2xl0V_Z1BbJH0.webp 1920w, /images/aurora-4.aIb2xl0V_1r9Rpb.webp 2560w"
              type="image/webp" sizes="100vw"
            />
            <img
              src="/images/aurora-4.aIb2xl0V_Z1BbJH0.webp"
              alt=""
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'top',
                borderRadius: 'clamp(24px, 3vw, 48px)',
                filter: 'hue-rotate(-60deg) saturate(1.3)',
              }}
              draggable={false}
            />
          </picture>

          {/* Badge */}
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: 'clamp(40px, 5vw, 64px) 24px 0' }}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 4, padding: '8px 12px',
                background: 'linear-gradient(87deg, rgba(25,31,40,0.10) 0%, rgba(25,31,40,0.35) 100%)',
                color: '#FAF8F5',
              }}>
                <p style={{ fontSize: 14, lineHeight: 1, fontWeight: 400, letterSpacing: '0.7px', textTransform: 'uppercase', margin: 0 }}>
                  Flow
                </p>
              </div>
            </motion.div>

            {/*
              HEADING — z-index: 2 (below mascot z-index: 4)
              The mascot will overlap the bottom of this text,
              creating the 3D depth illusion.
            */}
            <BlurText
              text="The future runs on Sentinel"
              animateBy="words"
              direction="bottom"
              delay={120}
              stepDuration={0.45}
              style={{
                fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                fontSize: 'clamp(2.5rem, 7vw, 6rem)',
                fontWeight: 900,
                lineHeight: 0.82,
                letterSpacing: '-0.03em',
                color: '#FAF8F5',
                textAlign: 'center',
                margin: 0,
                position: 'relative',
                zIndex: 2,
              }}
            />
          </div>

          {/*
            BOTTOM GRADIENT FADE — replaces overflow:hidden sharp cut.
            Fades aurora smoothly into black from 50% → 100%.
            This is what creates the premium "no hard edge" feel.
          */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: '60%',
              background: 'linear-gradient(180deg, transparent 0%, #000 100%)',
              borderRadius: '0 0 clamp(24px, 3vw, 48px) clamp(24px, 3vw, 48px)',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          />
        </div>

        {/*
          MASCOT — z-index: 4 (above heading z-index: 2)
          Negative margin pulls it up to overlap the card.
          The mascot's upper body covers the bottom of the heading text
          → creates the 3D depth illusion.
        */}
        <div
          style={{
            position: 'relative',
            zIndex: 4,
            marginTop: 'clamp(-160px, -20vw, -280px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <picture>
              <img
                src="/landing/middle-1.png"
                alt="Sentinel mascot saluting"
                style={{
                  /*
                    middle-1.png: 2476×3378 (aspect 0.733)
                    original salute: 1540×1848 (aspect 0.833)
                    Original rendered at max-width 48.125rem (~770px) → height ~924px
                    New image at same 924px tall → width = 924 × (2476/3378) = ~677px
                    So max-width ~677px keeps visual height identical.
                  */
                  display: 'block', margin: '0 auto',
                  width: '100%', maxWidth: '42.3rem',
                  height: 'auto', position: 'relative', zIndex: 4,
                }}
                draggable={false}
              />
            </picture>
          </motion.div>

          {/* Logo strip — scroll-reactive engine */}
          <div
            style={{
              position: 'absolute',
              top: '40%', left: 0, right: 0,
              zIndex: 10,
            }}
            aria-hidden="true"
          >
            <ScrollLogoStrip />
          </div>

          {/* Bottom fade into black */}
          <div style={{
            position: 'absolute', top: '50%', right: 0, bottom: '-40px', left: 0,
            zIndex: 10, background: 'linear-gradient(180deg, transparent 0%, #000 80%)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes partnersMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
