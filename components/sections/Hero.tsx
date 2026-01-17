'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, Shield, Zap, Lock } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="section-container">
        <div className="text-center">
          {/* Enhanced Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="inline-flex items-center px-6 py-3 tool-card text-sm font-medium">
              <img 
                src="/logo.png" 
                alt="Flow Sentinel" 
                className="w-5 h-5 mr-3"
              />
              Autonomous DeFi Wealth Management Platform
            </div>
          </motion.div>

          {/* Enhanced Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold mb-12 tracking-tight"
          >
            Flow Sentinel
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="section-subtitle mb-12 max-w-4xl mx-auto"
          >
            Professional-grade autonomous DeFi wealth management. 
            Protect and grow your assets with advanced MEV protection, 
            emergency controls, and reliable on-chain automation.
          </motion.p>

          {/* Spacer div for extra gap */}
          <div className="h-16"></div>

          {/* Enhanced Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-32"
          >
            <Link
              href="/dashboard"
              className="btn-primary inline-flex items-center px-6 py-3 rounded-lg font-medium text-base"
            >
              Launch Application
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            
            <button className="btn-secondary inline-flex items-center px-6 py-3 rounded-lg font-medium text-base">
              <Play className="mr-2 w-4 h-4" />
              View Documentation
            </button>
          </motion.div>

          {/* Enhanced Feature Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <div className="tool-card p-6 text-center">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold mb-2">Autonomous Operation</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Self-executing protocols that operate continuously without human intervention, 
                ensuring optimal performance through all market conditions.
              </p>
            </div>
            
            <div className="tool-card p-4 text-center">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold mb-3">MEV Protection</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Advanced shielding mechanisms protect against front-running and sandwich attacks, 
                preserving transaction integrity with cryptographic security.
              </p>
            </div>
            
            <div className="tool-card p-4 text-center">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold mb-2">Emergency Controls</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Instant pause capabilities with biometric authentication provide immediate control 
                when market conditions require human intervention.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}