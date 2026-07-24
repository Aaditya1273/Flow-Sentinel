'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Menu, Zap, Layers, Power, ChevronDown,
  AlertTriangle, LogOut, RefreshCw, ExternalLink, Wallet,
  CheckCircle2, Network,
} from 'lucide-react'
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

  const {
    user, logIn, logOut, walletType, setWalletType, isConnected,
    authError, clearAuthError, showDisconnectConfirm, setShowDisconnectConfirm,
    isWrongNetwork, switchToFlowTestnet, loading,
  } = useFlow()
  const { openConnectModal } = useConnectModal()

  // Listen for EVM connect events from FlowProvider
  useEffect(() => {
    const handler = () => openConnectModal?.()
    window.addEventListener('sentinel-connect-evm', handler)
    return () => window.removeEventListener('sentinel-connect-evm', handler)
  }, [openConnectModal])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleConnect = () => logIn('flow')
  const handleConnectEVM = () => {
    setWalletType('evm')
    setTimeout(() => openConnectModal?.(), 100)
  }
  const handleDisconnect = () => {
    setShowDisconnectConfirm(true)
  }

  const handleConfirmDisconnect = async () => {
    await logOut()
    setShowDisconnectConfirm(false)
  }

  const handleCancelDisconnect = () => {
    setShowDisconnectConfirm(false)
  }

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
      {/* ── Disconnect Confirmation Dialog ── */}
      <AnimatePresence>
        {showDisconnectConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-card max-w-sm overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                  <LogOut className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-display-sm mb-3" style={{
                  fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                  fontWeight: 500, letterSpacing: '-0.02em',
                }}>
                  Disconnect Wallet
                </h3>
                <p className="text-body-s mb-8" style={{ color: 'rgba(250,248,245,0.55)' }}>
                  Are you sure you want to disconnect{' '}
                  <span className="font-mono text-[#FAF8F5]">
                    {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
                  </span>
                  ? You will need to reconnect to access the dashboard.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDisconnect}
                    className="w-btn-outline flex-1 justify-center"
                    style={{ fontSize: '0.6875rem', padding: '14px 0' }}
                    aria-label="Cancel disconnect"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDisconnect}
                    className="dash-cta flex-1 justify-center"
                    style={{ fontSize: '0.6875rem', padding: '14px 0', background: '#ef4444', color: '#fff' }}
                    disabled={loading}
                    aria-label="Confirm disconnect wallet"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Disconnect</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Wrong Network Banner ── */}
      <AnimatePresence>
        {isWrongNetwork && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-0 left-0 right-0 z-[150] bg-red-500/90 backdrop-blur-xl"
            style={{ paddingTop: 0 }}
          >
            <div className="w-container flex items-center justify-between py-3">
              <div className="flex items-center gap-3 text-white">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium">Connected to wrong network. Switch to Flow EVM Testnet to continue.</span>
              </div>
              <button
                onClick={switchToFlowTestnet}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Switch Network
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        ref={navRef}
        className={`
          fixed top-0 left-0 right-0 z-50 w-full
          transition-colors duration-300
          ${isWrongNetwork ? 'mt-[52px]' : ''}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-btn-outline hidden sm:flex items-center gap-2 text-sm py-[10px] px-5">
                      <Wallet className="w-4 h-4" />
                      Connect Wallet
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-[#111] border border-white/10 rounded-2xl p-2 shadow-2xl">
                    <DropdownMenuItem onClick={handleConnect} className="rounded-xl p-3 cursor-pointer hover:bg-white/5 focus:bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--sen-green)]/15 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-[var(--sen-green)]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">Flow Wallet</p>
                          <p className="text-[11px] text-white/40">Native Cadence &middot; Recommended</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <div className="h-px bg-white/5 mx-3 my-1" />
                    <DropdownMenuItem onClick={handleConnectEVM} className="rounded-xl p-3 cursor-pointer hover:bg-white/5 focus:bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--sen-cyan)]/15 flex items-center justify-center">
                          <Layers className="w-5 h-5 text-[var(--sen-cyan)]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">EVM Wallet</p>
                          <p className="text-[11px] text-white/40">MetaMask &middot; Rainbow &middot; Other</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    {authError && (
                      <div className="px-3 pt-2">
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <p className="text-[11px] text-red-400 leading-relaxed">{authError.message}</p>
                          <button
                            onClick={clearAuthError}
                            className="mt-2 text-[10px] text-red-300 underline hover:text-red-200"
                            aria-label="Dismiss authentication error"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-[26px] px-4 py-2">
                  {/* Connected indicator */}
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/20 border-t-[var(--sen-green)] rounded-full animate-spin" />
                    ) : (
                      <span className={`w-2 h-2 rounded-full ${
                        isWrongNetwork ? 'bg-red-400' : 'bg-[var(--sen-green)]'
                      } shadow-[0_0_8px_var(--sen-green-glow)] ${isWrongNetwork ? '' : 'animate-pulse'}`}
                      />
                    )}

                    {/* Network badge */}
                    {(walletType === 'evm') && (
                      <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider ${
                        isWrongNetwork
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-[var(--sen-green)]/10 text-[var(--sen-green)]'
                      }`}>
                        <Network className="w-2.5 h-2.5" />
                        {isWrongNetwork ? 'Wrong Network' : 'Flow Testnet'}
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  {walletType === 'flow' ? (
                    <span className="text-[0.8125rem] font-mono text-white/70 select-all">
                      {user.addr?.slice(0, 6)}…{user.addr?.slice(-4)}
                    </span>
                  ) : (
                    <ConnectButton.Custom>
                      {({ account }) => (
                        <span className="text-[0.8125rem] font-mono text-white/70 select-all cursor-default">
                          {account?.displayName || `${user.addr?.slice(0, 6)}…${user.addr?.slice(-4)}`}
                        </span>
                      )}
                    </ConnectButton.Custom>
                  )}

                  {/* Disconnect button */}
                  <button
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="ml-1 w-7 h-7 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-40 flex items-center justify-center transition-colors"
                    aria-label="Disconnect wallet"
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

              {/* Mobile wallet status */}
              {isConnected && (
                <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--sen-green)] animate-pulse" />
                    <span className="text-xs font-mono text-white/70">{user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">
                      {walletType === 'flow' ? 'Flow Wallet' : 'EVM Wallet'}
                    </span>
                    {isWrongNetwork && (
                      <span className="text-[10px] text-red-400">Wrong Network</span>
                    )}
                  </div>
                </div>
              )}

              {authError && !isConnected && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400">{authError.message}</p>
                  <button onClick={clearAuthError} className="mt-2 text-[10px] text-red-300 underline">Dismiss</button>
                </div>
              )}

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

              <div className="pt-8 border-t border-white/10 space-y-3">
                {!isConnected ? (
                  <>
                    <button
                      onClick={() => { handleConnect(); setMobileOpen(false) }}
                      className="w-btn-outline w-full justify-between text-base py-4"
                    >
                      <span>Flow Wallet</span>
                      <Zap className="w-4 h-4 text-[var(--sen-green)]" />
                    </button>
                    <button
                      onClick={() => { handleConnectEVM(); setMobileOpen(false) }}
                      className="w-btn-outline w-full justify-between text-base py-4"
                    >
                      <span>EVM Wallet</span>
                      <Layers className="w-4 h-4 text-[var(--sen-cyan)]" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { handleDisconnect(); setMobileOpen(false) }}
                    className="w-btn-outline w-full justify-between text-base py-4 text-red-400 border-red-500/20 hover:border-red-500/40"
                  >
                    <span>Disconnect</span>
                    <Power className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
