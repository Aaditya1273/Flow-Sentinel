'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, Wallet, ChevronDown } from 'lucide-react'
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit'
import { useFlow } from 'lib/flow'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from 'components/ui/dropdown-menu'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, logIn, logOut, walletType, setWalletType, isConnected } = useFlow()
  const { openConnectModal } = useConnectModal()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { name: 'Vaults', href: '/vaults' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Docs', href: '/docs' },
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
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="logo-container">
            <img 
              src="/logo.png" 
              alt="Flow Sentinel" 
              className="logo-image"
            />
            <span className="text-xl font-semibold">
              Flow Sentinel
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            {!mounted ? (
              <Button variant="outline" disabled>
                <Wallet className="w-4 h-4 mr-2" />
                Loading...
              </Button>
            ) : !isConnected ? (
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
            ) : isConnected ? (
              <div className="flex items-center space-x-3">
                {walletType === 'flow' ? (
                  <Badge variant="outline" className="status-active">
                    Flow: {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
                  </Badge>
                ) : walletType === 'evm' ? (
                  <ConnectButton />
                ) : (
                  <Badge variant="outline" className="status-active">
                    {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
                  </Badge>
                )}
                <Button onClick={handleDisconnect} variant="ghost" size="sm">
                  Disconnect
                </Button>
                <Button onClick={() => setWalletType(null)} variant="ghost" size="sm">
                  Switch
                </Button>
              </div>
            ) : null}
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
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-border space-y-3">
                <div className="text-sm text-muted-foreground">Wallet Connection</div>
                
                {!mounted ? (
                  <Button variant="outline" disabled className="w-full">
                    Loading...
                  </Button>
                ) : !isConnected ? (
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
                ) : isConnected ? (
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
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}