'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/*
  CINEMATIC SCROLL-REACTIVE MARQUEE ENGINE
  
  Architecture:
  - Two identical SVG strips side by side (total width = 2x single strip)
  - Base offset starts at 0, loops seamlessly when it exceeds -50%
  - Scroll velocity is tracked via GSAP ticker + lerp smoothing
  - transform: translate3d() only — GPU accelerated, no layout thrash
  - Motion curve: cubic-bezier(0.22, 1, 0.36, 1) feel via lerp factor
  
  Physics:
  - scrollVelocity: raw delta from scroll position per frame
  - smoothVelocity: lerp(smoothVelocity, scrollVelocity, 0.1) — inertia
  - offset accumulates smoothVelocity * multiplier each frame
  - Seamless loop: when offset < -50%, reset to 0 (invisible snap)
*/

const LERP_FACTOR = 0.08        // lower = more inertia/momentum
const VELOCITY_MULTIPLIER = 0.4 // how much scroll speed drives marquee
const BASE_SPEED = 0.12         // gentle drift when not scrolling

export function MarqueeStrip() {
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

    // Measure single strip width after mount
    const measure = () => {
      const imgs = track.querySelectorAll('img')
      if (imgs.length >= 1) {
        // Each img is one copy — total track = 2 copies
        state.singleWidth = track.scrollWidth / 2
      }
    }

    // Wait for images to load before measuring
    const imgs = track.querySelectorAll('img')
    let loaded = 0
    const onLoad = () => {
      loaded++
      if (loaded >= imgs.length) measure()
    }
    imgs.forEach(img => {
      if ((img as HTMLImageElement).complete) { loaded++; if (loaded >= imgs.length) measure() }
      else img.addEventListener('load', onLoad)
    })
    // Fallback measure after short delay
    const measureTimer = setTimeout(measure, 300)

    // Track scroll velocity
    state.lastScrollY = window.scrollY

    const onScroll = () => {
      const currentY = window.scrollY
      state.rawVelocity = currentY - state.lastScrollY
      state.lastScrollY = currentY
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // RAF loop — cinematic engine
    const tick = () => {
      // Lerp smooth velocity toward raw (inertia)
      state.smoothVelocity += (state.rawVelocity - state.smoothVelocity) * LERP_FACTOR

      // Decay raw velocity each frame (momentum)
      state.rawVelocity *= 0.85

      // Accumulate offset: base drift + scroll-driven velocity
      const delta = BASE_SPEED + state.smoothVelocity * VELOCITY_MULTIPLIER
      state.offset -= delta

      // Seamless loop — snap back when we've scrolled one full strip width
      if (state.singleWidth > 0 && state.offset < -state.singleWidth) {
        state.offset += state.singleWidth
      }
      // Also handle reverse scroll
      if (state.offset > 0) {
        state.offset -= state.singleWidth
      }

      // GPU-accelerated transform only
      track.style.transform = `translate3d(${state.offset}px, 0, 0)`

      state.raf = requestAnimationFrame(tick)
    }

    state.raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(state.raf)
      window.removeEventListener('scroll', onScroll)
      clearTimeout(measureTimer)
    }
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        marginTop: '-5rem',
        height: '20rem',
        overflow: 'hidden',
        zIndex: 0,
      }}
      className="sm:-mt-[32rem] sm:h-[39.6875rem]"
    >
      {/* Top fade — blends aurora into guides section above, no sharp edge */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '40%',
          background: 'linear-gradient(180deg, #000 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Aurora-5 background */}
      <picture>
        <source
          srcSet="/images/aurora-5.D7pAFPrV_2ibmGD.avif 640w, /images/aurora-5.D7pAFPrV_Zl2Nuy.avif 1280w, /images/aurora-5.D7pAFPrV_2f1Kct.avif 1920w, /images/aurora-5.D7pAFPrV_ZTcgHI.avif 2560w"
          type="image/avif" sizes="100vw"
        />
        <source
          srcSet="/images/aurora-5.D7pAFPrV_Z1sBLvo.webp 640w, /images/aurora-5.D7pAFPrV_Zarai5.webp 1280w, /images/aurora-5.D7pAFPrV_2pCooW.webp 1920w, /images/aurora-5.D7pAFPrV_ZALubU.webp 2560w"
          type="image/webp" sizes="100vw"
        />
        <img
          src="/images/aurora-5.D7pAFPrV_Z1S9G8Q.webp"
          alt=""
          width={2880}
          height={1270}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            filter: 'hue-rotate(-60deg) saturate(1.3)',
          }}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </picture>

      {/*
        MARQUEE TRACK — positioned at bottom 30% mobile / 20% sm+
        The track div is moved via translate3d in the RAF loop.
        Two copies of the SVG for seamless infinite loop.
        will-change: transform tells browser to promote to GPU layer.
      */}
      <div
        className="sm:bottom-[20%]"
        style={{
          position: 'absolute',
          right: 0, left: 0,
          bottom: '30%',
          overflow: 'hidden',
          userSelect: 'none',
        }}
        aria-hidden="true"
      >
        {/* Desktop */}
        <div className="hidden lg:block">
          <div
            ref={trackRef}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: 'max-content',
              willChange: 'transform',
              transform: 'translate3d(0, 0, 0)',
              gap: 0,
            }}
          >
            {[0, 1].map(copy => (
              <div key={copy} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <span style={{
                  fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                  fontSize: 'clamp(4rem, 8vw, 7rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: 'rgba(250,248,245,0.55)',
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                  paddingRight: '3rem',
                }}>
                  Flow Sentinel
                </span>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'rgba(250,248,245,0.55)',
                  flexShrink: 0, display: 'inline-block',
                  marginRight: '3rem',
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile — separate ref not needed, use CSS fallback */}
        <div className="lg:hidden">
          <MobileMarquee />
        </div>
      </div>
    </div>
  )
}

/* Mobile uses a lighter version with the same scroll-reactive engine */
function MobileMarquee() {
  const trackRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef({ offset: 0, smoothVelocity: 0, lastScrollY: 0, rawVelocity: 0, raf: 0, singleWidth: 0 })

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const state = stateRef.current

    const measure = () => { state.singleWidth = track.scrollWidth / 2 }
    const t = setTimeout(measure, 300)

    const onScroll = () => {
      const y = window.scrollY
      state.rawVelocity = y - state.lastScrollY
      state.lastScrollY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const tick = () => {
      state.smoothVelocity += (state.rawVelocity - state.smoothVelocity) * LERP_FACTOR
      state.rawVelocity *= 0.85
      state.offset -= BASE_SPEED + state.smoothVelocity * VELOCITY_MULTIPLIER
      if (state.singleWidth > 0 && state.offset < -state.singleWidth) state.offset += state.singleWidth
      if (state.offset > 0) state.offset -= state.singleWidth
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
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'rgba(250,248,245,0.55)',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            paddingRight: '2rem',
          }}>
            Flow Sentinel
          </span>
          <span style={{
            width: 12, height: 12, borderRadius: '50%',
            background: 'rgba(250,248,245,0.55)',
            flexShrink: 0, display: 'inline-block',
            marginRight: '2rem',
          }} />
        </div>
      ))}
    </div>
  )
}
