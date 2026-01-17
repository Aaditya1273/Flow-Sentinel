'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, Shield } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useFlow } from '@/lib/flow'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logIn } = useFlow()

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
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
            {/* Flow Wallet */}
            {!user.loggedIn ? (
              <Button onClick={logIn} variant="outline">
                Connect Flow
              </Button>
            ) : (
              <Badge variant="success">
                {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
              </Badge>
            )}
            
            {/* EVM Wallet */}
            <ConnectButton />
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
              
              <div className="pt-4 border-t border-border space-y-2">
                {!user.loggedIn ? (
                  <Button onClick={logIn} className="w-full">
                    Connect Flow Wallet
                  </Button>
                ) : (
                  <Badge variant="success" className="w-full justify-center">
                    {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
                  </Badge>
                )}
                
                <div className="w-full">
                  <ConnectButton />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}