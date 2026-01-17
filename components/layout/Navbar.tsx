'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, Shield, Wallet, ChevronDown } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
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
  const [walletType, setWalletType] = useState<'flow' | 'evm' | null>(null)
  const { user, logIn, logOut } = useFlow()

  const navItems = [
    { name: 'Vaults', href: '/vaults' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Docs', href: '/docs' },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <Shield className="h-8 w-8 text-primary" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            </div>
            <span className="text-xl font-bold gradient-text">
              Flow Sentinel
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            {!user.loggedIn && !walletType ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setWalletType('flow')}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Flow Wallet</span>
                      <span className="text-xs text-muted-foreground">Native Flow blockchain</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setWalletType('evm')}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">EVM Wallet</span>
                      <span className="text-xs text-muted-foreground">MetaMask, WalletConnect</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : walletType === 'flow' ? (
              <div className="flex items-center space-x-2">
                {!user.loggedIn ? (
                  <Button onClick={logIn} variant="default">
                    Connect Flow
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Badge variant="success">
                      Flow: {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
                    </Badge>
                    <Button onClick={logOut} variant="ghost" size="sm">
                      Disconnect
                    </Button>
                  </div>
                )}
                <Button onClick={() => setWalletType(null)} variant="ghost" size="sm">
                  Switch
                </Button>
              </div>
            ) : walletType === 'evm' ? (
              <div className="flex items-center space-x-2">
                <ConnectButton />
                <Button onClick={() => setWalletType(null)} variant="ghost" size="sm">
                  Switch
                </Button>
              </div>
            ) : user.loggedIn ? (
              <div className="flex items-center space-x-2">
                <Badge variant="success">
                  Flow: {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
                </Badge>
                <Button onClick={logOut} variant="ghost" size="sm">
                  Disconnect
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
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-border space-y-3">
                <div className="text-sm text-muted-foreground">Choose Wallet Type:</div>
                
                {/* Flow Wallet Mobile */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Flow Blockchain</div>
                  {!user.loggedIn ? (
                    <Button onClick={logIn} className="w-full" size="sm">
                      Connect Flow Wallet
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Badge variant="success" className="w-full justify-center">
                        {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
                      </Badge>
                      <Button onClick={logOut} variant="outline" size="sm" className="w-full">
                        Disconnect Flow
                      </Button>
                    </div>
                  )}
                </div>

                {/* EVM Wallet Mobile */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">EVM Compatible</div>
                  <div className="w-full">
                    <ConnectButton />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}