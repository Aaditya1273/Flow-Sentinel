'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X, Wallet, ChevronDown, Zap } from 'lucide-react'
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

  const navItems = [
    { name: 'Vaults', href: '/vaults' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Portfolio', href: '/analytics' },
    { name: 'About', href: '/docs' },
  ]

  const handleDisconnect = () => {
    logOut()
    setTimeout(() => {
      window.location.href = '/'
    }, 500)
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
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-14 h-14 glass rounded-[1.25rem] flex items-center justify-center bg-primary/5 border-primary/40 group-hover:bg-primary/10 transition-all overflow-hidden p-2.5">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-black text-white italic tracking-tighter uppercase">
              Flow Sentinel
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-[28px] left-0 right-0 h-[2px] bg-primary shadow-[0_0_15px_rgba(0,239,139,0.8)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            <ClientOnly fallback={
              <Button variant="outline" disabled>
                <Wallet className="w-4 h-4 mr-2" />
                Loading...
              </Button>
            }>
              {!isConnected ? (
                walletType === 'evm' ? (
                  <div className="flex items-center space-x-2">
                    <ConnectButton />
                    <Button onClick={() => setWalletType(null)} variant="ghost" size="sm">
                      Back
                    </Button>
                  </div>
                ) : walletType === 'flow' ? (
                  <div className="flex items-center space-x-2">
                    <Button onClick={handleConnect} variant="outline">
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Flow Wallet
                    </Button>
                    <Button onClick={() => setWalletType(null)} variant="ghost" size="sm">
                      Back
                    </Button>
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Wallet
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={handleConnect}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Flow Wallet</span>
                          <span className="text-xs text-muted-foreground">Native Flow blockchain</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleConnectEVM}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">EVM Wallet</span>
                          <span className="text-xs text-muted-foreground">MetaMask, WalletConnect</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              ) : (
                <div className="flex items-center gap-3">
                  {walletType === 'flow' ? (
                    <div className="glass-pill border-primary/40 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-wider">
                      <Zap className="w-3 h-3 fill-primary" />
                      FLOW: {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
                    </div>
                  ) : walletType === 'evm' ? (
                    <ConnectButton />
                  ) : (
                    <div className="glass-pill border-white/10 text-white/60 text-[10px] font-black uppercase tracking-wider">
                      {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
                    </div>
                  )}

                  <div className="flex items-center glass rounded-xl border-white/15 p-1">
                    <Button onClick={handleDisconnect} variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest hover:text-primary">
                      Disconnect
                    </Button>
                    <div className="w-[1px] h-4 bg-white/5 mx-1" />
                    <Button onClick={() => setWalletType(null)} variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest hover:text-secondary">
                      Switch
                    </Button>
                  </div>
                </div>
              )}
            </ClientOnly>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-between ${isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,239,139,0.8)]" />}
                  </Link>
                )
              })}

              <div className="pt-4 border-t border-border space-y-3">
                <div className="text-sm text-muted-foreground">Wallet Connection</div>

                <ClientOnly fallback={
                  <Button variant="outline" disabled className="w-full">
                    Loading...
                  </Button>
                }>
                  {!isConnected ? (
                    walletType === 'evm' ? (
                      <div className="space-y-2">
                        <ConnectButton />
                        <Button onClick={() => setWalletType(null)} variant="outline" size="sm" className="w-full">
                          Back to Wallet Selection
                        </Button>
                      </div>
                    ) : walletType === 'flow' ? (
                      <div className="space-y-2">
                        <Button onClick={handleConnect} variant="outline" className="w-full">
                          <Wallet className="w-4 h-4 mr-2" />
                          Connect Flow Wallet
                        </Button>
                        <Button onClick={() => setWalletType(null)} variant="outline" size="sm" className="w-full">
                          Back to Wallet Selection
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button onClick={handleConnect} className="w-full justify-start" variant="outline">
                          <div className="text-left">
                            <div className="font-medium">Flow Wallet</div>
                            <div className="text-xs text-muted-foreground">Native Flow blockchain</div>
                          </div>
                        </Button>
                        <Button onClick={handleConnectEVM} className="w-full justify-start" variant="outline">
                          <div className="text-left">
                            <div className="font-medium">EVM Wallet</div>
                            <div className="text-xs text-muted-foreground">MetaMask, WalletConnect</div>
                          </div>
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="space-y-2">
                      <Badge variant="outline" className="w-full justify-center status-active">
                        {walletType === 'flow' ? 'Flow' : 'EVM'}: {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
                      </Badge>
                      <Button onClick={handleDisconnect} variant="outline" size="sm" className="w-full">
                        Disconnect Wallet
                      </Button>
                      <Button onClick={() => setWalletType(null)} variant="ghost" size="sm" className="w-full">
                        Switch Wallet Type
                      </Button>
                    </div>
                  )}
                </ClientOnly>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}
