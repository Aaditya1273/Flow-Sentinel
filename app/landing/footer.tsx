'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

/* ── Column data ── */
const COLS = [
  {
    heading: 'Discover',
    links: [
      { name: 'About',     href: '/docs' },
      { name: 'SEN Token', href: '/docs' },
      { name: 'Use SEN',   href: '/docs' },
      { name: 'Blog',      href: '/docs', external: true },
    ],
  },
  {
    heading: 'Build',
    links: [
      { name: 'Read the Docs',   href: '/docs',    external: true },
      { name: 'Ecosystem',       href: '/docs' },
      { name: 'Grants & RFPs',   href: '/docs' },
      { name: 'Cost Calculator', href: '/docs',    external: true },
      { name: 'GitHub',          href: 'https://github.com', external: true },
    ],
  },
  {
    heading: 'Use Cases',
    links: [
      { name: 'AI',            href: '/docs' },
      { name: 'Wealth Markets',href: '/docs' },
      { name: 'DeFi',          href: '/vaults' },
    ],
  },
  {
    heading: 'About',
    links: [
      { name: 'Events',           href: '/docs', external: true },
      { name: 'Media Kit',        href: '/docs', external: true },
      { name: 'Release Schedule', href: '/docs' },
      { name: 'Newsletter',       href: '/docs' },
      { name: 'Privacy',          href: '/docs', external: true },
      { name: 'Terms of Service', href: '/docs', external: true },
      { name: 'Careers',          href: '/docs', external: true },
    ],
  },
]

/* ── Social icons ── */
function DiscordIcon() {
  return (
    <svg width="28" height="21" viewBox="0 0 28 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.7197 1.75875C21.8794 0.925914 19.9368 0.334974 17.9417 0.000541153C17.671 0.480544 17.4227 0.983276 17.2039 1.48925C16.1424 1.3307 15.071 1.25115 13.9975 1.25061C12.9261 1.25061 11.8493 1.33124 10.7905 1.48709C10.5745 0.982193 10.3234 0.481627 10.0511 0C8.05874 0.336056 6.11124 0.930784 4.27148 1.762C0.614379 7.11563 -0.376598 12.3345 0.11889 17.4798C2.25999 19.0448 4.65704 20.2354 7.20448 20.9989C7.77599 20.2359 8.28789 19.4231 8.72212 18.5778C7.89303 18.272 7.09292 17.8943 6.33109 17.449C6.5318 17.305 6.72759 17.1567 6.91682 17.0133C9.13175 18.0426 11.5518 18.5794 13.9997 18.5794C16.4476 18.5794 18.8682 18.0426 21.0831 17.0133C21.2745 17.1681 21.4708 17.3164 21.6688 17.449C20.9053 17.8954 20.1041 18.2742 19.2734 18.581C19.7093 19.4285 20.2173 20.2375 20.791 21C23.3412 20.2386 25.7399 19.0486 27.8816 17.4814C28.4624 11.5152 26.8878 6.34394 23.7186 1.75875H23.7197Z" fill="currentColor"/>
    </svg>
  )
}
function GithubIcon() {
  return (
    <svg width="25" height="25" fill="currentColor" viewBox="0 -0.5 25 25" xmlns="http://www.w3.org/2000/svg">
      <path d="m12.301 0h.093c2.242 0 4.34.613 6.137 1.68l-.055-.031c1.871 1.094 3.386 2.609 4.449 4.422l.031.058c1.04 1.769 1.654 3.896 1.654 6.166 0 5.406-3.483 10-8.327 11.658l-.087.026c-.063.02-.135.031-.209.031-.162 0-.312-.054-.433-.144l.002.001c-.128-.115-.208-.281-.208-.466v-.014q0-.048.008-1.226t.008-2.154c.007-.075.011-.161.011-.249 0-.792-.323-1.508-.844-2.025.618-.061 1.176-.163 1.718-.305l-.076.017c.573-.16 1.073-.373 1.537-.642l-.031.017c.508-.28.938-.636 1.292-1.058l.006-.007c.372-.476.663-1.036.84-1.645l.009-.035c.209-.683.329-1.468.329-2.281 0-1.248-.482-2.383-1.269-3.23l.003.003c.168-.44.265-.948.265-1.479 0-.649-.145-1.263-.404-1.814l.011.026c-.115-.022-.246-.035-.381-.035-.334 0-.649.078-.929.216l.012-.005c-.568.21-1.054.448-1.512.726l.038-.022-.609.384c-.922-.264-1.981-.416-3.075-.416s-2.153.152-3.157.436l.081-.02q-.256-.176-.681-.433c-.373-.214-.814-.421-1.272-.595l-.066-.022c-.293-.154-.64-.244-1.009-.244-.124 0-.246.01-.364.03l.013-.002c-.248.524-.393 1.139-.393 1.788 0 .531.097 1.04.275 1.509l-.01-.029c-.785.844-1.266 1.979-1.266 3.227 0 .809.12 1.591.344 2.327l-.015-.057c.189.643.476 1.202.85 1.693l-.009-.013c.354.435.782.793 1.267 1.062l.022.011c.432.252.933.465 1.46.614l.046.011c.466.125 1.024.227 1.595.284l.046.004c-.431.428-.718 1-.784 1.638l-.001.012c-.207.101-.448.183-.699.236l-.021.004c-.256.051-.549.08-.85.08h.003c-.394-.008-.756-.136-1.055-.348l.006.004c-.371-.259-.671-.595-.881-.986l-.007-.015c-.198-.336-.459-.614-.768-.827l-.009-.006c-.225-.169-.49-.301-.776-.38l-.016-.004-.32-.048c-.14 0-.273.028-.394.077l.007-.003q-.128.072-.08.184c.039.086.087.16.145.225l-.001-.001.112.08c.283.148.516.354.693.603l.004.006c.191.237.359.505.494.792l.01.024.16.368c.135.402.38.738.7.981l.005.004c.3.234.662.402 1.057.478l.016.002c.33.064.714.104 1.106.112h.007c.261 0 .517-.021.767-.062l-.027.004.368-.064q0 .609.008 1.418t.008.873v.014c0 .185-.08.351-.208.466h-.001c-.119.089-.268.143-.431.143-.075 0-.147-.011-.214-.032l.005.001c-4.929-1.689-8.409-6.283-8.409-11.69 0-2.268.612-4.393 1.681-6.219l-.032.058c1.094-1.871 2.609-3.386 4.422-4.449l.058-.031c1.739-1.034 3.835-1.645 6.073-1.645h.098-.005z"/>
    </svg>
  )
}
function XIcon() {
  return (
    <svg width="23" height="21" viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.1716 0H21.6971L13.9563 8.91144L23 21H15.903L10.3466 13.6539L3.98534 21H0.459847L8.66045 11.4686L0 0H7.27324L12.2932 6.7107L18.1716 0ZM16.9377 18.9077H18.892L6.24625 2.01476H4.14628L16.9377 18.9077Z" fill="currentColor"/>
    </svg>
  )
}
function LinkedInIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M18.6667 0H2.33333C1.04417 0 0 1.04417 0 2.33333V18.6667C0 19.9558 1.04417 21 2.33333 21H18.6667C19.9558 21 21 19.9558 21 18.6667V2.33333C21 1.04417 19.9558 0 18.6667 0ZM6.34958 18.0833H3.21708V7.97125H6.34958V18.0833ZM4.76875 6.64708C3.745 6.64708 2.91667 5.81292 2.91667 4.78042C2.91667 3.74792 3.745 2.91375 4.76875 2.91375C5.7925 2.91375 6.62083 3.74792 6.62083 4.78042C6.62083 5.81292 5.7925 6.64708 4.76875 6.64708ZM18.0833 18.0833H14.9683V12.775C14.9683 11.3196 14.4142 10.5058 13.265 10.5058C12.0108 10.5058 11.3575 11.3517 11.3575 12.775V18.0833H8.35333V7.97125H11.3575V9.33333C11.3575 9.33333 12.2617 7.66208 14.4054 7.66208C16.5492 7.66208 18.0862 8.97167 18.0862 11.6812V18.0833H18.0833Z" fill="currentColor"/>
    </svg>
  )
}
function YouTubeIcon() {
  return (
    <svg width="30" height="21" viewBox="0 0 30 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.9904 0C14.9904 0 5.61527 0 3.26148 0.611233C2.00079 0.964324 0.964058 2.00134 0.611064 3.28018C0 5.63462 0 10.5096 0 10.5096C0 10.5096 0 15.4025 0.611064 17.7198C0.962575 18.9987 1.98151 20.0179 3.26148 20.371C5.63306 21.0015 14.9918 21.0015 14.9918 21.0015C14.9918 21.0015 24.3862 21.0015 26.74 20.3903C28.0185 20.0386 29.0374 19.0372 29.3711 17.7391C30.0015 15.404 30.0015 10.5289 30.0015 10.5289C30.0015 10.5289 30.0193 5.6361 29.3711 3.28167C29.0374 2.00283 28.0185 0.98361 26.74 0.649806C24.3862 0 14.9904 0 14.9904 0ZM12.0077 6.00551L19.8092 10.5096L12.0077 14.9945V6.00551Z" fill="currentColor"/>
    </svg>
  )
}

const SOCIALS = [
  { label: 'Discord',  Icon: DiscordIcon,  href: '#' },
  { label: 'GitHub',   Icon: GithubIcon,   href: 'https://github.com' },
  { label: 'X',        Icon: XIcon,        href: '#' },
  { label: 'LinkedIn', Icon: LinkedInIcon, href: '#' },
  { label: 'YouTube',  Icon: YouTubeIcon,  href: '#' },
]

/* ── External link arrow ── */
function ExtArrow() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M9 0.00439453H0V1.00439H9V0.00439453Z" fill="currentColor"/>
      <path d="M8.29436 7.01674e-05L0 8.29443L0.707107 9.00154L9.00147 0.707177L8.29436 7.01674e-05Z" fill="currentColor"/>
      <path d="M9 0.00439453H8V9.00439H9V0.00439453Z" fill="currentColor"/>
    </svg>
  )
}

/* ── Glow button (walrus-exact rotating border) ── */
function GlowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        position: 'relative', display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 26, padding: 2, overflow: 'hidden',
        textDecoration: 'none',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <span style={{
        position: 'absolute', inset: '-200%',
        background: 'conic-gradient(from 0deg, transparent 20%, #FAF8F5 45%, rgba(250,248,245,0.5) 55%, transparent 80%)',
        animation: 'footerGlowSpin 3s linear infinite',
        zIndex: 0,
      }} />
      <span style={{
        position: 'relative', zIndex: 1,
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '14px 30px', borderRadius: 24,
        background: '#000', color: '#FAF8F5',
        fontSize: '1rem', fontWeight: 430, letterSpacing: '0.045em',
        whiteSpace: 'nowrap',
      }}>
        {children}
      </span>
    </Link>
  )
}

/* ── Footer mascot with hover-rise effect ── */
function FooterMascot() {
  const ref = useRef<HTMLDivElement>(null)
  let timer: ReturnType<typeof setTimeout> | null = null

  const rise = () => {
    if (timer) clearTimeout(timer)
    ref.current?.classList.remove('translate-y-1/2')
    ref.current?.classList.add('translate-y-0')
  }
  const sink = () => {
    timer = setTimeout(() => {
      ref.current?.classList.remove('translate-y-0')
      ref.current?.classList.add('translate-y-1/2')
    }, 400)
  }

  return (
    <div
      ref={ref}
      onMouseEnter={rise}
      onMouseLeave={sink}
      className="translate-y-1/2 lg:max-w-[37.5rem] xl:max-w-[50rem] 2xl:max-w-[55rem]"
      style={{
        width: '50vw',
        maxWidth: '28rem',
        transition: 'transform 500ms ease-out',
        cursor: 'pointer',
      }}
    >
      <div style={{
        overflow: 'hidden',
        /* Clip the reflection — it starts at ~75% of image height */
        maxHeight: '75%',
      }}>
        <picture>
          <img
            src="/landing/foooter-ui.png"
            alt="Flow Sentinel mascot"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            draggable={false}
          />
        </picture>
      </div>
    </div>
  )
}

export function LandingFooter() {
  return (
    <footer
      style={{
        position: 'relative', zIndex: 10,
        marginTop: -48,
        overflow: 'hidden',
        borderRadius: '36px 36px 0 0',
        background: '#000',
        color: '#FAF8F5',
      }}
      className="sm:rounded-tl-[48px] sm:rounded-tr-[48px] sm:-mt-[48px]"
    >
      {/* ── Link columns ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(48px, 6vw, 80px) 24px 24px' }}>
        <div
          className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 xl:grid-cols-5"
          style={{ gap: '40px 16px' }}
        >
          {COLS.map(col => (
            <div key={col.heading}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: 400,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: '#00EF8B',
                marginBottom: 12,
              }}>
                {col.heading}
              </h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: '1.125rem' }}>
                {col.links.map(l => (
                  <li key={l.name}>
                    <Link
                      href={l.href}
                      target={l.external ? '_blank' : undefined}
                      rel={l.external ? 'noopener noreferrer' : undefined}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '4px 0',
                        color: '#FAF8F5',
                        textDecoration: 'none',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(250,248,245,0.45)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#FAF8F5')}
                    >
                      {l.name}
                      {l.external && <ExtArrow />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* 5th column — CTA + socials (xl only) */}
          <div className="hidden xl:flex" style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
            <GlowLink href="/docs">
              Read the docs
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 13" fill="none" style={{ width: 13, height: 13, flexShrink: 0 }}>
                <path d="M11.52 5.66L5.86 0L5.16 0.71L10.31 5.86H0V6.86H10.31L5.16 12.02L5.86 12.73L11.52 7.07L12.23 6.36L11.52 5.66Z" fill="currentColor"/>
              </svg>
            </GlowLink>
            <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
              {SOCIALS.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{ color: '#FAF8F5', transition: 'opacity 0.15s', display: 'flex' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.5')}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile/tablet socials row ── */}
      <div className="xl:hidden" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {SOCIALS.map(({ label, Icon, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              style={{ color: '#FAF8F5', transition: 'opacity 0.15s', display: 'flex' }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.5')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>

      {/* ── Copyright ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <p style={{
          fontSize: '0.75rem', lineHeight: 1.4,
          letterSpacing: '0.06px',
          color: 'rgba(250,248,245,0.35)',
        }}>
          © {new Date().getFullYear()} Flow Sentinel Protocol. All rights reserved.
        </p>
      </div>

      {/* ── Watermark + mascot ── */}
      <div
        style={{ position: 'relative' }}
      >
        {/* Mobile watermark — shown only below sm */}
        <div className="sm:hidden">
          <img
            src="/landing/flow.png"
            alt="Flow Sentinel"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            draggable={false}
          />
        </div>

        {/* Desktop watermark — shown only sm+ */}
        <div className="hidden sm:block">
          <img
            src="/landing/flow.png"
            alt="Flow Sentinel"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            draggable={false}
          />
        </div>

        {/* Mascot — centered, rises on hover, exact walrus layout */}
        <div
          style={{
            position: 'absolute',
            right: 0, bottom: 0, left: 0,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <FooterMascot />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes footerGlowSpin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </footer>
  )
}
