'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, Shield, Zap, Lock } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full -z-10" />

      <div className="section-container">
        <div className="flex flex-col items-center text-center">
          {/* Autonomous Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="glass-pill border-primary/40 bg-primary/5 text-primary">
              <Zap className="w-4 h-4 fill-primary" />
              <span className="text-xs font-bold tracking-wider uppercase">Forte Powered Automation</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8 max-w-5xl"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6">
              THE WORLD'S FIRST <br />
              <span className="text-primary italic">AUTONOMOUS</span> <br />
              WEALTH MANAGER.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-3xl mx-auto leading-relaxed italic font-medium">
              Experience institutional-grade yield optimization with
              <span className="text-foreground font-semibold"> inherent MEV resistance</span>
              and biological security protocols.
            </p>
          </motion.div>

          {/* Primary Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center items-center mb-24"
          >
            <Link
              href="/dashboard"
              className="btn-primary flex items-center gap-2 group shadow-[0_0_30px_rgba(0,239,139,0.2)]"
            >
              Get Started
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <button className="btn-secondary flex items-center gap-2">
              <Play className="w-4 h-4 fill-foreground" />
              Watch Demo
            </button>
          </motion.div>

          {/* Floating Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {[
              {
                icon: Zap,
                title: "Silent Automation",
                desc: "Powered by Flow's native Scheduler. No off-chain bots, ever.",
                color: "text-primary"
              },
              {
                icon: Shield,
                title: "MEV Immunity",
                desc: "Proprietary timing jitter using on-chain VRF randomness.",
                color: "text-secondary"
              },
              {
                icon: Lock,
                title: "Passkey Shield",
                desc: "Pause strategies instantly using FaceID or biometric signing.",
                color: "text-white"
              }
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                className="tool-card group"
              >
                <div className={`w-12 h-12 glass rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
