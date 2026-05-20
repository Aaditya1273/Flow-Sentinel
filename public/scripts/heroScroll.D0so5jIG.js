// heroScroll.D0so5jIG.js — Flow Sentinel hero scroll animation
// Called by: index.astro_astro_type_script_index_0_lang.DzySDSc5.js
// Signature: import { i as initHeroScroll } from './heroScroll.D0so5jIG.js'
//
// Since GSAP is loaded as UMD (sets window.gsap & window.ScrollTrigger),
// we access it from window after the GSAP modules load.

export function i({ contentId = 'hero-content', textId = 'hero-text', auroraId = 'hero-aurora', textEnd = '+=1200' } = {}) {
  function run() {
    const gsap = window.gsap
    const ScrollTrigger = window.ScrollTrigger

    if (!gsap || !ScrollTrigger) {
      // Retry if GSAP hasn't set up on window yet
      setTimeout(run, 100)
      return
    }

    const content = document.getElementById(contentId)
    const text    = document.getElementById(textId)
    const aurora  = document.getElementById(auroraId)

    if (!content) return

    gsap.registerPlugin(ScrollTrigger)
    ScrollTrigger.config({ ignoreMobileResize: true })

    // Hero content parallax up as user scrolls
    gsap.to(content, {
      y: -180,
      ease: 'none',
      scrollTrigger: {
        trigger: content,
        start: 'top top',
        end: textEnd,
        scrub: true,
      },
    })

    // Text blur-reveal on load
    if (text) {
      const chars = text.querySelectorAll('.char')
      if (chars.length > 0) {
        gsap.set(chars, { opacity: 0, filter: 'blur(20px)', y: 20 })
        gsap.set(text, { opacity: 1 })
        gsap.to(chars, {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 1.2,
          stagger: 0.03,
          ease: 'power2.out',
        })
      } else {
        gsap.fromTo(
          text,
          { filter: 'blur(12px)', opacity: 0, y: 40 },
          { filter: 'blur(0px)', opacity: 1, y: 0, duration: 1.4, ease: 'power2.out', delay: 0.1 },
        )
      }
    }

    // Aurora parallax — slower than scroll, fades slightly
    if (aurora) {
      gsap.to(aurora, {
        y: 200,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: textEnd,
          scrub: true,
        },
      })
    }

    ScrollTrigger.refresh()
  }

  // Run after DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(run, 50)
  } else {
    window.addEventListener('load', () => setTimeout(run, 50), { once: true })
  }
}
