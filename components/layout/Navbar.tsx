'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { Menu, X, Wallet, ChevronDown, Zap, Shield, Activity, ExternalLink, Power, BookOpen, Layers, Cpu, Globe, Lock } from 'lucide-react'
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit'
import { useFlow } from 'lib/flow'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
import { ClientOnly } from 'components/ClientOnly'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from 'components/ui/dropdown-menu'

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const { user, logIn, logOut, walletType, setWalletType, isConnected } = useFlow()
    const { openConnectModal } = useConnectModal()
    const pathname = usePathname()
    const [isScrolled, setIsScrolled] = useState(false)
    
    // Dropdown state track
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Physics-based scroll tracking
    const { scrollY } = useScroll()
    const navY = useTransform(scrollY, [0, 100], [0, -4])
    const navScale = useTransform(scrollY, [0, 100], [1, 0.98])
    const springConfig = { stiffness: 400, damping: 30, mass: 1 }
    const animatedScale = useSpring(navScale, springConfig)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        
        // Close dropdown when clicking outside
        const handleOutsideClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setActiveDropdown(null)
            }
        }
        window.addEventListener('mousedown', handleOutsideClick)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('mousedown', handleOutsideClick)
        }
    }, [])

    const handleDisconnect = () => {
        logOut()
    }

    const handleConnect = async () => {
        await logIn()
    }

    const handleConnectEVM = () => {
        setWalletType('evm')
        setTimeout(() => {
            openConnectModal?.()
        }, 100)
    }

    // Toggle logic for dropdowns to support desktop hover/clicks
    const handleToggleDropdown = (menu: string) => {
        if (activeDropdown === menu) {
            setActiveDropdown(null)
        } else {
            setActiveDropdown(menu)
        }
    }

    return (
        <motion.header
            style={{ y: navY, scale: animatedScale }}
            className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center py-4 px-4 pointer-events-none"
            ref={dropdownRef}
        >
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', ...springConfig, delay: 0.1 }}
                className={`
                    relative flex items-center justify-between w-full max-w-6xl h-20 px-6 pointer-events-auto
                    transition-all duration-500 rounded-[2.5rem]
                    ${isScrolled || activeDropdown
                        ? 'bg-black/50 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
                        : 'bg-transparent border border-transparent'
                    }
                `}
            >
                {/* Visual Glow Layer */}
                <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] bg-gradient-to-br from-primary/5 via-transparent to-flow-cyan/5 opacity-50" />
                </div>

                {/* BRAND IDENTITY */}
                <Link href="/" className="relative z-10">
                    <MagneticContainer size={40}>
                        <div className="flex items-center gap-4 group">
                            <div className="relative">
                                <motion.div 
                                    className="w-12 h-12 glass rounded-2xl flex items-center justify-center bg-primary/5 border border-primary/30 group-hover:border-primary/60 transition-colors overflow-hidden p-2"
                                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
                                >
                                    <img src="/logo.png" alt="Sentinel" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,239,139,0.4)]" />
                                </motion.div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                                    <Shield className="w-2.5 h-2.5 text-black" />
                                </div>
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-xl font-display font-black text-white tracking-tighter uppercase leading-none">Flow Sentinel</span>
                                <span className="text-[10px] font-sans font-black tracking-[0.4em] uppercase text-primary">Autonomous Prime</span>
                            </div>
                        </div>
                    </MagneticContainer>
                </Link>

                {/* NAVIGATION CLUSTER (walrus.xyz Mega Menu Selectors) */}
                <div className="hidden lg:flex items-center gap-2 glass-dark rounded-[1.5rem] p-1.5 border border-white/5 bg-white/[0.02]">
                    
                    {/* DISCOVER DROPDOWN SELECTOR */}
                    <button
                        onClick={() => handleToggleDropdown('discover')}
                        onMouseEnter={() => setActiveDropdown('discover')}
                        className={`relative px-5 py-2.5 rounded-2xl group transition-all flex items-center gap-1.5 ${activeDropdown === 'discover' ? 'bg-white/5 text-white' : 'text-flow-text-secondary hover:text-white'}`}
                    >
                        <span className="relative z-10 text-[11px] font-sans font-black uppercase tracking-[0.2em]">
                            Discover
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === 'discover' ? 'rotate-180 text-primary' : 'text-flow-text-muted'}`} />
                    </button>

                    {/* BUILD DROPDOWN SELECTOR */}
                    <button
                        onClick={() => handleToggleDropdown('build')}
                        onMouseEnter={() => setActiveDropdown('build')}
                        className={`relative px-5 py-2.5 rounded-2xl group transition-all flex items-center gap-1.5 ${activeDropdown === 'build' ? 'bg-white/5 text-white' : 'text-flow-text-secondary hover:text-white'}`}
                    >
                        <span className="relative z-10 text-[11px] font-sans font-black uppercase tracking-[0.2em]">
                            Build
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === 'build' ? 'rotate-180 text-primary' : 'text-flow-text-muted'}`} />
                    </button>

                    {/* ECOSYSTEM DROPDOWN SELECTOR */}
                    <button
                        onClick={() => handleToggleDropdown('ecosystem')}
                        onMouseEnter={() => setActiveDropdown('ecosystem')}
                        className={`relative px-5 py-2.5 rounded-2xl group transition-all flex items-center gap-1.5 ${activeDropdown === 'ecosystem' ? 'bg-white/5 text-white' : 'text-flow-text-secondary hover:text-white'}`}
                    >
                        <span className="relative z-10 text-[11px] font-sans font-black uppercase tracking-[0.2em]">
                            Ecosystem
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === 'ecosystem' ? 'rotate-180 text-primary' : 'text-flow-text-muted'}`} />
                    </button>

                    {/* ABOUT DIRECT LINK */}
                    <Link href="/docs">
                        <div className="relative px-5 py-2.5 rounded-2xl group overflow-hidden">
                            <span className="relative z-10 text-[11px] font-sans font-black uppercase tracking-[0.2em] text-flow-text-secondary group-hover:text-white">
                                About
                            </span>
                        </div>
                    </Link>
                </div>

                {/* SYSTEM ACTIONS */}
                <div className="flex items-center gap-4">
                    <ClientOnly fallback={<div className="w-40 h-10 glass rounded-xl animate-pulse" />}>
                        {!isConnected ? (
                            <div className="flex items-center gap-2">
                                <MagneticContainer size={10}>
                                    <button 
                                        onClick={handleConnect}
                                        className="glow-btn h-11 px-0.5 group text-white"
                                    >
                                        <div className="glow-btn-inner px-5 h-full flex items-center justify-center gap-2 text-[10px] font-display font-black uppercase tracking-widest">
                                            <Zap className="w-3.5 h-3.5 text-primary group-hover:animate-pulse" />
                                            Authorize Flow
                                        </div>
                                    </button>
                                </MagneticContainer>
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl glass border-white/5">
                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64 glass-dark border-white/10 p-2 rounded-2xl shadow-2xl backdrop-blur-3xl">
                                        <div className="px-3 py-2 mb-2">
                                            <p className="text-[10px] font-sans font-black uppercase tracking-widest text-muted-foreground">Select Protocol</p>
                                        </div>
                                        <DropdownMenuItem onClick={handleConnect} className="rounded-xl focus:bg-primary/10 transition-colors p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                                    <Zap className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-display font-black uppercase text-white">Flow Wallet</span>
                                                    <span className="text-[9px] font-sans text-muted-foreground">Native Cadence Transactions</span>
                                                </div>
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleConnectEVM} className="rounded-xl focus:bg-flow-cyan/10 transition-colors p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-flow-cyan/20 flex items-center justify-center">
                                                    <Layers className="w-4 h-4 text-flow-cyan" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-display font-black uppercase text-white">EVM Gateway</span>
                                                    <span className="text-[9px] font-sans text-muted-foreground">MetaMask • Rainbow Wallet</span>
                                                </div>
                                            </div>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 glass p-1.5 rounded-2xl border-white/10 bg-black/20">
                                {walletType === 'flow' ? (
                                    <div className="flex items-center gap-3 px-4 py-2">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,239,139,0.8)]" />
                                        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white/80">
                                            {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
                                        </span>
                                    </div>
                                ) : (
                                    <ConnectButton.Custom>
                                        {({ account, chain, openAccountModal, openChainModal, mounted }) => (
                                            <div onClick={openAccountModal} className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-white/5 rounded-xl transition-all">
                                                <div className="w-2 h-2 rounded-full bg-flow-cyan animate-pulse shadow-[0_0_8px_rgba(0,245,212,0.8)]" />
                                                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white/80">
                                                    {account?.displayName}
                                                </span>
                                            </div>
                                        )}
                                    </ConnectButton.Custom>
                                )}

                                <Button 
                                    onClick={handleDisconnect} 
                                    size="icon"
                                    className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white transition-all"
                                >
                                    <Power className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </ClientOnly>

                    {/* MOBILE TOGGLE */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden h-12 w-12 rounded-2xl glass border-white/10"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6 text-primary" />}
                    </Button>
                </div>
            </motion.nav>

            {/* ===== LIVE DROPDOWN CARDS (MEGA MENUS) ===== */}
            <AnimatePresence>
                {activeDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        onMouseLeave={() => setActiveDropdown(null)}
                        className="absolute top-28 w-full max-w-5xl bg-black/85 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl z-40 pointer-events-auto overflow-hidden grid grid-cols-12 gap-8"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-flow-cyan/5 pointer-events-none" />

                        {/* DISCOVER MEGAMENU CONTENT */}
                        {activeDropdown === 'discover' && (
                            <>
                                <div className="col-span-3 border-r border-white/5 pr-4">
                                    <span className="text-[9px] font-mono font-black text-primary tracking-widest uppercase block mb-6">Discover Sentinel</span>
                                    <div className="space-y-6">
                                        <Link href="/docs" className="block group">
                                            <span className="text-xs font-display font-black uppercase text-white group-hover:text-primary transition-colors block mb-1">About</span>
                                            <span className="text-[10px] font-sans text-flow-text-muted leading-relaxed block">Learn about Flow Sentinel's core security.</span>
                                        </Link>
                                        <Link href="/docs" className="block group">
                                            <span className="text-xs font-display font-black uppercase text-white group-hover:text-primary transition-colors block mb-1">Blog</span>
                                            <span className="text-[10px] font-sans text-flow-text-muted leading-relaxed block">Read the latest automated insights.</span>
                                        </Link>
                                    </div>
                                </div>
                                <div className="col-span-3 border-r border-white/5 pr-4">
                                    <span className="text-[9px] font-mono font-black text-primary tracking-widest uppercase block mb-6">Use Cases</span>
                                    <div className="space-y-6">
                                        <Link href="/docs" className="block group">
                                            <span className="text-xs font-display font-black uppercase text-white group-hover:text-primary transition-colors block mb-1">Wealth Markets</span>
                                            <span className="text-[10px] font-sans text-flow-text-muted leading-relaxed block">Secure peer-to-peer digital yield grids.</span>
                                        </Link>
                                        <Link href="/vaults" className="block group">
                                            <span className="text-xs font-display font-black uppercase text-white group-hover:text-primary transition-colors block mb-1">DeFi Protection</span>
                                            <span className="text-[10px] font-sans text-flow-text-muted leading-relaxed block">Real-time safeguard loops for vaults.</span>
                                        </Link>
                                    </div>
                                </div>
                                <div className="col-span-3 border-r border-white/5 pr-4">
                                    <span className="text-[9px] font-mono font-black text-primary tracking-widest uppercase block mb-6">Token</span>
                                    <div className="space-y-6">
                                        <Link href="/docs" className="block group">
                                            <span className="text-xs font-display font-black uppercase text-white group-hover:text-primary transition-colors block mb-1">SEN Token</span>
                                            <span className="text-[10px] font-sans text-flow-text-muted leading-relaxed block">The economic heart of automated stakings.</span>
                                        </Link>
                                        <Link href="/docs" className="block group">
                                            <span className="text-xs font-display font-black uppercase text-white group-hover:text-primary transition-colors block mb-1">Use SEN</span>
                                            <span className="text-[10px] font-sans text-flow-text-muted leading-relaxed block">Configure staking pools & rewards.</span>
                                        </Link>
                                    </div>
                                </div>
                                <div className="col-span-3 pl-4 flex flex-col justify-between">
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 relative overflow-hidden group h-full flex flex-col justify-between">
                                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-4 bg-black">
                                            <img src="/images/wal-home.pS3LWcp2_JbDtK.webp" alt="Blog" className="w-full h-full object-cover filter saturate-[1.6] hue-rotate-[130deg]" />
                                        </div>
                                        <span className="text-[9px] font-mono font-black text-flow-text-muted uppercase tracking-widest block mb-2">Featured Partner</span>
                                        <Link href="/docs" className="text-xs font-display font-black uppercase text-white group-hover:text-primary transition-colors leading-tight block">
                                            Announcing Predictable Pricing on Flow Sentinel
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* BUILD DROPDOWN CONTENT */}
                        {activeDropdown === 'build' && (
                            <>
                                <div className="col-span-4 border-r border-white/5 pr-6 grid grid-cols-2 gap-8">
                                    <div>
                                        <span className="text-[9px] font-mono font-black text-primary tracking-widest uppercase block mb-6">Build on Sentinel</span>
                                        <div className="space-y-6">
                                            <Link href="/docs" className="block group">
                                                <span className="text-xs font-display font-black uppercase text-white group-hover:text-primary transition-colors block mb-1">Read the Docs</span>
                                                <span className="text-[10px] font-sans text-flow-text-muted leading-relaxed block">Detailed Cadence reference.</span>
                                            </Link>
                                            <Link href="/docs" className="block group">
                                                <span className="text-xs font-display font-black uppercase text-white group-hover:text-primary transition-colors block mb-1">Whitepaper</span>
                                                <span className="text-[10px] font-sans text-flow-text-muted leading-relaxed block">Cryptographic mechanics.</span>
                                            </Link>
                                            <Link href="/docs" className="block group">
                                                <span className="text-xs font-display font-black uppercase text-white group-hover:text-primary transition-colors block mb-1">Grants & RFPs</span>
                                                <span className="text-[10px] font-sans text-flow-text-muted leading-relaxed block">Accelerate your project.</span>
                                            </Link>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-mono font-black text-transparent tracking-widest uppercase block mb-6">Utilities</span>
                                        <div className="space-y-6">
                                            <Link href="/docs" className="block group">
                                                <span className="text-xs font-display font-black uppercase text-white group-hover:text-primary transition-colors block mb-1">Cost Calculator</span>
                                                <span className="text-[10px] font-sans text-flow-text-muted leading-relaxed block">Simulate automated execution overheads.</span>
                                            </Link>
                                            <Link href="https://github.com" target="_blank" className="block group">
                                                <span className="text-xs font-display font-black uppercase text-white group-hover:text-primary transition-colors block mb-1">GitHub</span>
                                                <span className="text-[10px] font-sans text-flow-text-muted leading-relaxed block">Check repository files.</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-8 pl-6 flex flex-col justify-between">
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 relative overflow-hidden group h-full flex flex-col justify-between">
                                        <div className="grid grid-cols-2 gap-6 items-center">
                                            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black">
                                                <img src="/images/wal-wal.Bo3lhZKt_myUyi.webp" alt="Build" className="w-full h-full object-cover filter saturate-[1.6] hue-rotate-[130deg]" />
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-mono font-black text-primary uppercase tracking-widest block mb-2">Getting Started Guide</span>
                                                <Link href="/docs" className="text-base font-display font-black uppercase text-white group-hover:text-primary transition-colors leading-snug block mb-3">
                                                    Getting Started with Flow Sentinel SDK
                                                </Link>
                                                <span className="text-[10px] font-sans text-flow-text-muted block">Learn to programmatically trigger safe-vault executions from macOS and iOS terminal commands.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ECOSYSTEM DROPDOWN CONTENT */}
                        {activeDropdown === 'ecosystem' && (
                            <>
                                <div className="col-span-5 border-r border-white/5 pr-6 grid grid-cols-2 gap-8">
                                    <div>
                                        <span className="text-[9px] font-mono font-black text-primary tracking-widest uppercase block mb-6">Case Studies</span>
                                        <div className="space-y-6">
                                            <Link href="/docs" className="block group">
                                                <span className="text-xs font-display font-black uppercase text-white group-hover:text-primary transition-colors block mb-1">Alkimi</span>
                                                <span className="text-[10px] font-sans text-flow-text-muted leading-relaxed block">Secure programmatic validation.</span>
                                            </Link>
                                            <Link href="/docs" className="block group">
                                                <span className="text-xs font-display font-black uppercase text-white group-hover:text-primary transition-colors block mb-1">Baselight</span>
                                                <span className="text-[10px] font-sans text-flow-text-muted leading-relaxed block">Real-time ledger indexing.</span>
                                            </Link>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-mono font-black text-transparent tracking-widest uppercase block mb-6">Others</span>
                                        <div className="space-y-6">
                                            <Link href="/docs" className="block group">
                                                <span className="text-xs font-display font-black uppercase text-white group-hover:text-primary transition-colors block mb-1">Bluefin</span>
                                                <span className="text-[10px] font-sans text-flow-text-muted leading-relaxed block">High-speed decentralized spot structures.</span>
                                            </Link>
                                            <Link href="/docs" className="block group">
                                                <span className="text-xs font-display font-black uppercase text-white group-hover:text-primary transition-colors block mb-1">Inflectiv</span>
                                                <span className="text-[10px] font-sans text-flow-text-muted leading-relaxed block">Enterprise-grade network stakings.</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-7 pl-6 flex flex-col justify-between">
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 relative overflow-hidden group h-full flex flex-col justify-between">
                                        <div className="grid grid-cols-2 gap-6 items-center">
                                            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black">
                                                <img src="/images/sui-stack.BY_4m4E8_ZNHjPJ.webp" alt="Ecosystem" className="w-full h-full object-cover filter saturate-[1.6] hue-rotate-[130deg]" />
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-mono font-black text-primary uppercase tracking-widest block mb-2">Featured Partner</span>
                                                <Link href="/docs" className="text-base font-display font-black uppercase text-white group-hover:text-primary transition-colors leading-snug block mb-3">
                                                    Featured Partner: Baselight Integration
                                                </Link>
                                                <span className="text-[10px] font-sans text-flow-text-muted block">Read our case study on building zero-downtime decentralized indexing nodes with Baselight.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MOBILE OVERLAY: Command Center Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', ...springConfig }}
                        className="fixed inset-x-4 top-28 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 lg:hidden pointer-events-auto"
                    >
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-6">
                                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Navigation Menu</span>
                                <Badge className="bg-primary/10 text-primary border-primary/20">v1.2 PRIME</Badge>
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                <Link href="/vaults" onClick={() => setIsOpen(false)} className="text-sm font-sans font-black uppercase tracking-widest text-white/80">Vaults</Link>
                                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-sm font-sans font-black uppercase tracking-widest text-white/80">Dashboard</Link>
                                <Link href="/analytics" onClick={() => setIsOpen(false)} className="text-sm font-sans font-black uppercase tracking-widest text-white/80">Portfolio</Link>
                                <Link href="/docs" onClick={() => setIsOpen(false)} className="text-sm font-sans font-black uppercase tracking-widest text-white/80">Intelligence &amp; Docs</Link>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5">
                                <Button className="w-full h-14 rounded-2xl btn-primary text-xs uppercase tracking-[0.3em] font-black" onClick={handleConnect}>
                                    <Zap className="w-4 h-4 mr-3" />
                                    Launch Enterprise Terminal
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    )
}

/**
 * MAGNETIC CONTAINER COMPONENT
 * Implements a physics-based magnetic pull effect for "Billion Dollar" interactive density.
 */
function MagneticContainer({ children, size = 20 }: { children: React.ReactNode, size?: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 })
    const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 })

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return
        const { clientX, clientY } = e
        const { left, top, width, height } = ref.current.getBoundingClientRect()
        const centerX = left + width / 2
        const centerY = top + height / 2
        const distanceX = clientX - centerX
        const distanceY = clientY - centerY

        if (Math.abs(distanceX) < width && Math.abs(distanceY) < height) {
            x.set(distanceX * (size / 100))
            y.set(distanceY * (size / 100))
        } else {
            x.set(0)
            y.set(0)
        }
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
            className="flex items-center justify-center pointer-events-auto"
        >
            {children}
        </motion.div>
    )
}
