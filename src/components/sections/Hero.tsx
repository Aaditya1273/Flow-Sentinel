'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, Shield, Zap, Lock } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 animated-bg opacity-20" />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 3, 0]
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Built on Flow Blockchain with Forte Technology
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6"
        >
          The World's First
          <span className="block gradient-text">
            Autonomous DeFi
          </span>
          Wealth Manager
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
        >
          Flow Sentinel protects and grows your wealth autonomously using 
          <span className="text-blue-400"> Forte Scheduled Transactions</span>, 
          <span className="text-purple-400"> Native VRF MEV Protection</span>, and 
          <span className="text-cyan-400"> Passkey Emergency Controls</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Link
            href="/dashboard"
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center"
          >
            Launch App
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <button className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 flex items-center">
            <Play className="mr-2 w-5 h-5" />
            Watch Demo
          </button>
        </motion.div>

        {/* Key Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <div className="glass p-6 rounded-xl">
            <Zap className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
            <h3 className="text-white font-semibold mb-2">Autonomous Operation</h3>
            <p className="text-gray-400 text-sm">
              Self-executing vault that rebalances every 24 hours using Flow's native scheduler
            </p>
          </div>
          
          <div className="glass p-6 rounded-xl">
            <Shield className="w-8 h-8 text-blue-400 mb-3 mx-auto" />
            <h3 className="text-white font-semibold mb-2">MEV Protection</h3>
            <p className="text-gray-400 text-sm">
              Native VRF randomness prevents front-running and MEV attacks
            </p>
          </div>
          
          <div className="glass p-6 rounded-xl">
            <Lock className="w-8 h-8 text-green-400 mb-3 mx-auto" />
            <h3 className="text-white font-semibold mb-2">Emergency Controls</h3>
            <p className="text-gray-400 text-sm">
              Instant pause via FaceID/TouchID using Flow's Account Abstraction
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}