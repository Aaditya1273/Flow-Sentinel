'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { Menu, X, Wallet, ChevronDown, Zap, Shield, Activity, ExternalLink, Power } from 'lucide-react'
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
    DropdownMenuSeparator,
} from 'components/ui/dropdown-menu'

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const { user, logIn, logOut, walletType, setWalletType, isConnected } = useFlow()
    const { openConnectModal } = useConnectModal()
    const pathname = usePathname()
    const [isScrolled, setIsScrolled] = useState(false)

    // Physics-based scroll tracking
    const { scrollY } = useScroll()
    const navY = useTransform(scrollY, [0, 100], [0, -4])
    const navScale = useTransform(scrollY, [0, 100], [1, 0.98])
    const springConfig = { stiffness: 400, damping: 30, mass: 1 }
    const animatedScale = useSpring(navScale, springConfig)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navItems = [
        { name: 'Vaults', href: '/vaults', icon: Shield },
        { name: 'Dashboard', href: '/dashboard', icon: Activity },
        { name: 'Portfolio', href: '/analytics', icon: Zap },
        { name: 'Intelligence', href: '/docs', icon: ExternalLink },
    ]

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

    return (
        <motion.header
            style={{ y: navY, scale: animatedScale }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center py-6 px-4 pointer-events-none"
        >
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', ...springConfig, delay: 0.1 }}
                className={`
                    relative flex items-center justify-between w-full max-w-6xl h-20 px-6 pointer-events-auto
                    transition-all duration-500 rounded-[2.5rem]
                    ${isScrolled
                        ? 'bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
                        : 'bg-transparent'
                    }
                `}
            >
                {/* Visual Glow Layer */}
                <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50" />
                </div>

                {/* BRAND IDENTITY: Magnetic Container */}
                <Link href="/" className="relative z-10">
                    <MagneticContainer size={40}>
                        <div className="flex items-center gap-4 group">
                            <div className="relative">
                                <motion.div 
                                    className="w-12 h-12 glass rounded-2xl flex items-center justify-center bg-primary/5 border border-primary/30 group-hover:border-primary/60 transition-colors overflow-hidden p-2"
                                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
                                >
                                    <img src="/logo.png" alt="Sentinel" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,212,255,0.4)]" />
                                </motion.div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                                    <Shield className="w-2.5 h-2.5 text-black" />
                                </div>
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-xl font-display font-black text-white italic tracking-tighter uppercase leading-none">Flow Sentinel</span>
                                <span className="text-[10px] font-sans font-black tracking-[0.4em] uppercase text-primary/60">Autonomous Prime</span>
                            </div>
                        </div>
                    </MagneticContainer>
                </Link>

                {/* NAVIGATION CLUSTER: Physics-Driven Tabs */}
                <div className="hidden lg:flex items-center gap-2 glass-dark rounded-[1.5rem] p-1.5 border border-white/5 bg-white/[0.02]">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link key={item.name} href={item.href}>
                                <div className="relative px-6 py-2.5 rounded-2xl group overflow-hidden">
                                    <span className={`relative z-10 text-[11px] font-sans font-black uppercase tracking-[0.2em] transition-colors duration-300 ${isActive ? 'text-black' : 'text-muted-foreground group-hover:text-white'}`}>
                                        {item.name}
                                    </span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-active"
                                            className="absolute inset-0 bg-primary shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                                            transition={{ type: 'spring', ...springConfig }}
                                        />
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>

                {/* SYSTEM ACTIONS: Status-Aware Hub */}
                <div className="flex items-center gap-4">
                    <ClientOnly fallback={<div className="w-40 h-10 glass rounded-xl animate-pulse" />}>
                        {!isConnected ? (
                            <div className="flex items-center gap-2">
                                {/* Flow native connection */}
                                <MagneticContainer size={10}>
                                    <Button 
                                        onClick={handleConnect}
                                        className="h-11 px-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-display font-black uppercase tracking-widest text-white transition-all group"
                                    >
                                        <Zap className="w-3.5 h-3.5 mr-2 text-primary group-hover:animate-pulse" />
                                        Authorize Flow
                                    </Button>
                                </MagneticContainer>
                                
                                {/* EVM/Cross-chain Gateway */}
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
                                        <DropdownMenuItem onClick={handleConnectEVM} className="rounded-xl focus:bg-secondary/10 transition-colors p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                                                    <Power className="w-4 h-4 text-secondary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-display font-black uppercase text-white">EVM Gateway</span>
                                                    <span className="text-[9px] font-sans text-muted-foreground">MetaMask • Rainbow • WalletConnect</span>
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
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
                                        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white/80">
                                            {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
                                        </span>
                                    </div>
                                ) : (
                                    <ConnectButton.Custom>
                                        {({ account, chain, openAccountModal, openChainModal, mounted }) => (
                                            <div onClick={openAccountModal} className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-white/5 rounded-xl transition-all">
                                                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_rgba(255,0,255,0.8)]" />
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

            {/* MOBILE OVERLAY: Command Center Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', ...springConfig }}
                        className="fixed inset-x-4 top-28 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 lg:hidden pointer-events-auto"
                    >
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-6">
                                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Navigation Menu</span>
                                <Badge className="bg-primary/10 text-primary border-primary/20 italic">v1.2 PRIME</Badge>
                            </div>
                            
                            {navItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                                        <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isActive ? 'bg-primary/10 border-primary/30 text-white' : 'border-transparent text-muted-foreground'}`}>
                                            <div className="flex items-center gap-4">
                                                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                                                <span className="text-sm font-black uppercase tracking-widest italic">{item.name}</span>
                                            </div>
                                            {isActive && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,212,255,0.8)]" />}
                                        </div>
                                    </Link>
                                )
                            })}

                            <div className="mt-6 pt-6 border-t border-white/5">
                                <Button className="w-full h-14 rounded-2xl btn-primary text-xs uppercase tracking-[0.3em] font-black italic">
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

