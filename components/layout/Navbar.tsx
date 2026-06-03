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

export function Navbar() {
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

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleConnect = () => logIn()
  const handleConnectEVM = () => {
    setWalletType('evm')
    setTimeout(() => openConnectModal?.(), 100)
  }
  const handleDisconnect = () => logOut()

  const navItems = [
    { label: 'Dashboard', key: 'dashboard' },
    { label: 'Vaults',    key: 'vaults'    },
    { label: 'Portfolio', key: 'portfolio' },
    { label: 'Analytics', key: 'analytics' },
    { label: 'Docs',      key: 'docs'      },
    { label: 'Settings',  key: 'settings'  },
  ]

  return (
    <>
      <header
        ref={navRef}
        className={`
          fixed top-0 left-0 right-0 z-50 w-full
          transition-colors duration-300
          ${scrolled 
            ? 'bg-black/90 backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-transparent'
          }
        `}
      >
        <div className="w-container flex items-center justify-between gap-4 py-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-6">

          {/* Brand */}
          <div className="justify-self-start">
            <Link href="/" aria-label="Home" className="inline-flex items-center group">
              <span
                style={{
                  fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                  fontSize: '1.125rem',
                  fontWeight: 700,
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
              {navItems.map((item) => {
                const isActive = pathname === `/${item.key}` || pathname.startsWith(`/${item.key}/`)
                return (
                  <li key={item.key} role="none" className="relative">
                    <Link
                      href={`/${item.key}`}
                      className={`w-nav-btn inline-flex items-center ${isActive ? 'active' : 'text-[var(--w-tusk)]'}`}
                    >
                      {item.label}
                    </Link>
                    {isActive && (
                      <span className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-[60%] h-[2px] rounded-full"
                        style={{ background: 'var(--sen-green)' }}
                      />
                    )}
                  </li>
                )
              })}
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
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                  <span className="text-[1.125rem] font-display font-black text-[var(--w-tusk)]">Flow</span>
                </Link>
                <button
                  className="w-10 h-10 rounded-[26px] border border-white/10 flex items-center justify-center text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === `/${item.key}` || pathname.startsWith(`/${item.key}/`)
                    return (
                      <li key={item.key}>
                        <Link
                          href={`/${item.key}`}
                          className={`block py-4 text-[2rem] font-display font-black transition-opacity ${
                            isActive
                              ? 'text-[#00EF8B]'
                              : 'text-[var(--w-tusk)] hover:opacity-70'
                          }`}
                          onClick={() => setMobileOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              <div className="pt-8 border-t border-white/10">
                <button
                  onClick={() => { handleConnect(); setMobileOpen(false) }}
                  className="w-btn-outline w-full justify-between text-base py-4"
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
