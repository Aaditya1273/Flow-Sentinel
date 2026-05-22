'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Menu, Zap, Layers, Power, ChevronDown } from 'lucide-react'
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit'
import { useFlow } from 'lib/flow'
import { ClientOnly } from 'components/ClientOnly'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'components/ui/dropdown-menu'

/* ─── Arrow icon (matches walrus.xyz exactly) ─── */
function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="13" height="13" viewBox="0 0 13 13" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M11.52 5.66L5.86 0L5.16 0.71L10.31 5.86H0V6.86H10.31L5.16 12.02L5.86 12.73L11.52 7.07L12.23 6.36L11.52 5.66Z"
        fill="currentColor"
      />
    </svg>
  )
}

/* ─── External link icon ─── */
function ExternalIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 9 9" fill="none" className="ml-1.5 flex-shrink-0 opacity-60">
      <path d="M9 0.00427246H0V1.00427H9V0.00427246Z" fill="currentColor" />
      <path d="M8.2968-5.19029e-05L0.00244141 8.29431L0.709548 9.00142L9.00391 0.707055L8.2968-5.19029e-05Z" fill="currentColor" />
      <path d="M9 0.00427246H8V9.00427H9V0.00427246Z" fill="currentColor" />
    </svg>
  )
}

/* ─── Chevron down icon ─── */
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="13" height="13" viewBox="0 0 13 13" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
    >
      <path
        d="M12.02 5.16L6.86 10.31V0H5.86V10.31L0.71 5.16L0 5.86L5.66 11.52L6.36 12.23L7.07 11.52L12.73 5.86L12.02 5.16Z"
        fill="currentColor"
      />
    </svg>
  )
}

/* ─── Mega menu data ─── */
const DISCOVER_MENU = {
  col1: {
    label: 'Discover Sentinel',
    links: [
      { name: 'About', href: '/docs' },
      { name: 'Blog', href: '/docs', external: true },
    ],
  },
  col2: {
    label: 'Use Cases',
    links: [
      { name: 'Wealth Markets', href: '/docs' },
      { name: 'DeFi Protection', href: '/vaults' },
      { name: 'AI Agents', href: '/docs' },
    ],
  },
  col3: {
    label: 'Token',
    links: [
      { name: 'SEN Token', href: '/docs' },
      { name: 'Use SEN', href: '/docs' },
    ],
  },
  featured: {
    image: '/images/nav1.png',
    tag: 'Product',
    title: 'Announcing Predictable Pricing on Flow Sentinel',
    href: '/docs',
  },
}

const BUILD_MENU = {
  col1: {
    label: 'Build on Sentinel',
    links: [
      { name: 'Read the Docs', href: '/docs' },
      { name: 'Whitepaper', href: '/docs' },
      { name: 'Grants & RFPs', href: '/docs' },
    ],
  },
  col2: {
    label: 'Utilities',
    links: [
      { name: 'Cost Calculator', href: '/docs' },
      { name: 'GitHub', href: 'https://github.com', external: true },
    ],
  },
  featured: {
    image: '/images/nav2.png',
    tag: 'Getting Started Guide',
    title: 'Getting Started with Flow Sentinel SDK',
    desc: 'Learn to programmatically trigger safe-vault executions.',
    href: '/docs',
  },
}

const ECOSYSTEM_MENU = {
  col1: {
    label: 'Case Studies',
    links: [
      { name: 'Alkimi', href: '/docs' },
      { name: 'Baselight', href: '/docs' },
    ],
  },
  col2: {
    label: 'Partners',
    links: [
      { name: 'Bluefin', href: '/docs' },
      { name: 'Inflectiv', href: '/docs' },
    ],
  },
  featured: {
    image: '/images/nav3.png',
    tag: 'Featured Partner',
    title: 'Featured Partner: Baselight Integration',
    desc: 'Zero-downtime decentralized indexing nodes.',
    href: '/docs',
  },
}

/* ─── Dropdown panel (white card, Walrus-exact) ─── */
function DiscoverPanel() {
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_280px] gap-10">
      {[DISCOVER_MENU.col1, DISCOVER_MENU.col2, DISCOVER_MENU.col3].map((col) => (
        <div key={col.label}>
          <p className="w-dropdown-label mb-3">{col.label}</p>
          <ul className="space-y-0">
            {col.links.map((l) => (
              <li key={l.name}>
                <Link href={l.href} className="w-dropdown-link">
                  <span>{l.name}</span>
                  {(l as any).external && <ExternalIcon />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div>
        <Link href={DISCOVER_MENU.featured.href} className="block rounded-3xl overflow-hidden bg-[#f0ede8] hover:opacity-90 transition-opacity">
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={DISCOVER_MENU.featured.image}
              alt={DISCOVER_MENU.featured.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="px-5 pt-4 pb-5">
            <p className="text-[0.8125rem] font-bold leading-tight text-black mb-2">
              {DISCOVER_MENU.featured.title}
            </p>
            <span className="inline-block bg-[#00EF8B] rounded-[4px] px-2 py-[5px] text-[11px] font-medium tracking-[0.05em] text-black uppercase">
              {DISCOVER_MENU.featured.tag}
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}

function BuildPanel() {
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr] gap-10">
      {[BUILD_MENU.col1, BUILD_MENU.col2].map((col) => (
        <div key={col.label}>
          <p className="w-dropdown-label mb-3">{col.label}</p>
          <ul className="space-y-0">
            {col.links.map((l) => (
              <li key={l.name}>
                <Link href={l.href} className="w-dropdown-link">
                  <span>{l.name}</span>
                  {(l as any).external && <ExternalIcon />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="rounded-3xl overflow-hidden bg-[#f0ede8]">
        <div className="aspect-video w-full overflow-hidden">
          <img src={BUILD_MENU.featured.image} alt={BUILD_MENU.featured.title} className="w-full h-full object-cover" />
        </div>
        <div className="px-5 pt-4 pb-5">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-[#00EF8B] mb-1">{BUILD_MENU.featured.tag}</p>
          <p className="text-[0.9375rem] font-medium leading-snug text-black mb-1">{BUILD_MENU.featured.title}</p>
          <p className="text-[0.8125rem] text-[#555] leading-relaxed">{BUILD_MENU.featured.desc}</p>
        </div>
      </div>
    </div>
  )
}

function EcosystemPanel() {
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr] gap-10">
      {[ECOSYSTEM_MENU.col1, ECOSYSTEM_MENU.col2].map((col) => (
        <div key={col.label}>
          <p className="w-dropdown-label mb-3">{col.label}</p>
          <ul className="space-y-0">
            {col.links.map((l) => (
              <li key={l.name}>
                <Link href={l.href} className="w-dropdown-link">
                  <span>{l.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="rounded-3xl overflow-hidden bg-[#f0ede8]">
        <div className="aspect-video w-full overflow-hidden">
          <img src={ECOSYSTEM_MENU.featured.image} alt={ECOSYSTEM_MENU.featured.title} className="w-full h-full object-cover" />
        </div>
        <div className="px-5 pt-4 pb-5">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-[#00EF8B] mb-1">{ECOSYSTEM_MENU.featured.tag}</p>
          <p className="text-[0.9375rem] font-medium leading-snug text-black mb-1">{ECOSYSTEM_MENU.featured.title}</p>
          <p className="text-[0.8125rem] text-[#555] leading-relaxed">{ECOSYSTEM_MENU.featured.desc}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Navbar ─── */
export function LandingNavbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  const { user, logIn, logOut, walletType, setWalletType, isConnected } = useFlow()
  const { openConnectModal } = useConnectModal()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* close on route change */
  useEffect(() => {
    setActiveMenu(null)
    setMobileOpen(false)
  }, [pathname])

  const handleConnect = () => logIn()
  const handleConnectEVM = () => {
    setWalletType('evm')
    setTimeout(() => openConnectModal?.(), 100)
  }
  const handleDisconnect = () => logOut()

  const navItems = [
    { label: 'Discover', key: 'discover' },
    { label: 'Build',    key: 'build'    },
    { label: 'Ecosystem',key: 'ecosystem'},
  ]

  return (
    <>
      {/* ── Backdrop blur overlay when menu open ── */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[6px]"
            onMouseEnter={() => setActiveMenu(null)}
          />
        )}
      </AnimatePresence>

      <header
        ref={navRef}
        className={`
          fixed top-0 left-0 right-0 z-50 w-full
          transition-colors duration-300
          ${scrolled || activeMenu
            ? 'bg-black/90 backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-transparent'
          }
        `}
      >
        {/* ── Main nav row ── */}
        <div className="w-container flex items-center justify-between gap-4 py-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-6">

          {/* Brand */}
          <div className="justify-self-start">
            <Link href="/" aria-label="Home" className="inline-flex items-center group">
              <span
                style={{
                  fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                  fontSize: '1.125rem',
                  fontWeight: 700, // Changed from 500 to 700 for bold
                  letterSpacing: '-0.01em',
                  color: '#FAF8F5',
                  lineHeight: 1,
                }}
              >
                Flow
              </span>
            </Link>
          </div>

          {/* Desktop nav items */}
          <nav className="justify-self-center hidden md:block" aria-label="Main navigation">
            <ul className="flex items-center gap-1" role="menubar">
              {navItems.map((item) => (
                <li key={item.key} className="relative" role="none">
                  <button
                    className="w-nav-btn text-[var(--w-tusk)]"
                    aria-haspopup="true"
                    aria-expanded={activeMenu === item.key}
                    onMouseEnter={() => setActiveMenu(item.key)}
                    onClick={() => setActiveMenu(activeMenu === item.key ? null : item.key)}
                  >
                    {item.label}
                    <ChevronIcon open={activeMenu === item.key} />
                  </button>
                </li>
              ))}
              <li role="none">
                <Link href="/docs" className="w-nav-btn text-[var(--w-tusk)] inline-flex items-center">
                  About
                </Link>
              </li>
            </ul>
          </nav>

          {/* CTA + wallet */}
          <div className="justify-self-end flex items-center gap-3">
            <ClientOnly fallback={<div className="w-36 h-11 rounded-[26px] bg-white/5 animate-pulse" />}>
              {!isConnected ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-btn-outline hidden sm:flex items-center gap-2 text-sm py-[10px] px-5">
                        Connect Wallet
                        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 bg-[#111] border border-white/10 rounded-2xl p-2 shadow-2xl">
                      <DropdownMenuItem onClick={handleConnect} className="rounded-xl p-3 cursor-pointer hover:bg-white/5 focus:bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--sen-green)]/15 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-[var(--sen-green)]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Flow Wallet</p>
                            <p className="text-[10px] text-white/40">Native Cadence</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleConnectEVM} className="rounded-xl p-3 cursor-pointer hover:bg-white/5 focus:bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--sen-cyan)]/15 flex items-center justify-center">
                            <Layers className="w-4 h-4 text-[var(--sen-cyan)]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">EVM Gateway</p>
                            <p className="text-[10px] text-white/40">MetaMask · Rainbow</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Link href="/docs" className="w-btn-solid text-sm py-[10px] px-5 hidden sm:flex">
                    Read the docs
                    <ArrowIcon className="w-[13px] h-[13px]" />
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-[26px] px-4 py-2">
                  {walletType === 'flow' ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[var(--sen-green)] shadow-[0_0_8px_var(--sen-green-glow)] animate-pulse" />
                      <span className="text-[0.8125rem] font-mono text-white/70">
                        {user.addr?.slice(0, 6)}…{user.addr?.slice(-4)}
                      </span>
                    </>
                  ) : (
                    <ConnectButton.Custom>
                      {({ account, openAccountModal }) => (
                        <button onClick={openAccountModal} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[var(--sen-cyan)] animate-pulse" />
                          <span className="text-[0.8125rem] font-mono text-white/70">{account?.displayName}</span>
                        </button>
                      )}
                    </ConnectButton.Custom>
                  )}
                  <button
                    onClick={handleDisconnect}
                    className="ml-1 w-7 h-7 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </ClientOnly>

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-10 h-10 rounded-[26px] border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Desktop Mega Menu Dropdown ── */}
        <AnimatePresence>
          {activeMenu && (
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute top-full left-1/2 -translate-x-1/2 z-50 hidden md:block"
              style={{ width: 'min(calc(100vw - 3rem), 780px)' }}
              onMouseLeave={() => setActiveMenu(null)}
            >
              {/* small gap bridge so mouse can travel from button to panel */}
              <div className="h-4" />
              <div className="w-dropdown">
                {activeMenu === 'discover'  && <DiscoverPanel />}
                {activeMenu === 'build'     && <BuildPanel />}
                {activeMenu === 'ecosystem' && <EcosystemPanel />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] bg-black overflow-y-auto"
          >
            <div className="w-container flex flex-col min-h-full py-4">
              {/* top row */}
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                  <span className="text-[1.125rem] font-display font-black text-[var(--w-tusk)]">Flow Sentinel</span>
                </Link>
                <button
                  className="w-10 h-10 rounded-[26px] border border-white/10 flex items-center justify-center text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* nav links */}
              <nav className="flex-1">
                <ul className="space-y-1">
                  {[...navItems, { label: 'About', key: 'about' }].map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.key === 'about' ? '/docs' : `/${item.key}`}
                        className="block py-4 text-[2rem] font-display font-black text-[var(--w-tusk)] hover:opacity-70 transition-opacity"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* bottom CTA */}
              <div className="pt-8 border-t border-white/10">
                <button
                  onClick={() => { handleConnect(); setMobileOpen(false) }}
                  className="w-btn-outline w-full justify-between text-base py-4"
                >
                  Connect Wallet
                  <ArrowIcon />
                </button>
                <Link
                  href="/docs"
                  className="w-btn-solid w-full justify-between text-base py-4 mt-3"
                  onClick={() => setMobileOpen(false)}
                >
                  Read the docs
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
