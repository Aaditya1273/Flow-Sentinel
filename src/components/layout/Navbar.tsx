'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, Shield } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useFlow } from '@/lib/flow'

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
    <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <Shield className="h-8 w-8 text-blue-400" />
              <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full" />
            </div>
            <span className="text-xl font-bold text-white">
              Flow Sentinel
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Flow Wallet */}
            {!user.loggedIn ? (
              <button
                onClick={logIn}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Connect Flow
              </button>
            ) : (
              <div className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg border border-green-600/30">
                {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
              </div>
            )}
            
            {/* EVM Wallet */}
            <ConnectButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t border-white/10"
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-white/10">
                {!user.loggedIn ? (
                  <button
                    onClick={logIn}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Connect Flow Wallet
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg border border-green-600/30 text-center">
                    {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
                  </div>
                )}
                
                <div className="mt-2">
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