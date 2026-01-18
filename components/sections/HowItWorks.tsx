'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Wallet,
  Settings,
  Zap,
  Shield,
  ArrowRight,
  ChevronRight,
  Fingerprint,
  Cpu,
  Target
} from 'lucide-react'

const steps = [
  {
    step: 1,
    title: 'SECURE AUTHENTICATION',
    description: 'Establish a secure link using Flow Native Passkeys. Zero seed phrases, institutional-grade security.',
    icon: Fingerprint,
    color: 'text-primary',
    glow: 'shadow-[0_0_20px_rgba(0,239,139,0.2)]'
  },
  {
    step: 2,
    title: 'STRATEGIC ALIGNMENT',
    description: 'Select your preferred DeFi engine. Our protocols handle the complexity of yield optimization.',
    icon: Target,
    color: 'text-secondary',
    glow: 'shadow-[0_0_20px_rgba(0,210,255,0.2)]'
  },
  {
    step: 3,
    title: 'CAPITAL DEPLOYMENT',
    description: 'Initialize your vault. Flow Sentinel immediately routes your capital to the most efficient pools.',
    icon: Zap,
    color: 'text-primary',
    glow: 'shadow-[0_0_20px_rgba(0,239,139,0.2)]'
  },
  {
    step: 4,
    title: 'AUTONOMOUS EARNING',
    description: 'System-wide monitoring ensures your wealth grows with mathematical certainty 24/7.',
    icon: Shield,
    color: 'text-secondary',
    glow: 'shadow-[0_0_20px_rgba(0,210,255,0.2)]'
  }
]

export function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="how-it-works" ref={ref} className="py-32 relative overflow-hidden bg-background">
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-24"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.4em]">Operational Pipeline</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic mb-8 leading-none">
            The Sentinel <span className="text-secondary italic">Workflow</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium italic leading-relaxed">
            Deployment in four precise stages. High-frequency monitoring, absolute transparency.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {/* Connecting Line for Desktop */}
          <div className="hidden lg:block absolute top-[2.5rem] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="relative z-10"
            >
              <div className="p-8 h-full flex flex-col items-center text-center">
                <div className={`w-20 h-20 glass rounded-[2.5rem] flex items-center justify-center mb-8 border-white/15 bg-white/[0.03] transition-all hover:scale-110 group ${step.glow}`}>
                  <step.icon className={`w-8 h-8 ${step.color} transition-all group-hover:animate-pulse`} />
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-[1px] bg-white/10" />
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Phase 0{step.step}</span>
                  <div className="w-6 h-[1px] bg-white/10" />
                </div>

                <h3 className="text-lg font-black text-white tracking-tighter uppercase italic mb-4 leading-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground italic font-medium leading-relaxed px-2">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Technical Deep Dive */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-32 tool-card p-12 lg:p-20 border-0 glass relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary/20" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <Cpu className="w-6 h-6 text-secondary" />
                <h3 className="text-sm font-black text-secondary uppercase tracking-[0.3em]">Infrastructure Core</h3>
              </div>
              <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Under the Hood</h4>
              <p className="text-muted-foreground text-sm font-medium italic">
                Flow Sentinel leverages the native capabilities of the Flow blockchain to provide a truly decentralized and autonomous experience.
              </p>
            </div>

            <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white hover:text-secondary transition-colors">
              EXPLORE DOCUMENTATION <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'FORTE ENGINE',
                detail: 'Native on-chain scheduling for reliable 24/7 execution.',
                color: 'text-secondary'
              },
              {
                title: 'VRF SHIELD',
                detail: 'Cryptographic jitter prevents MEV and front-running.',
                color: 'text-primary'
              },
              {
                title: 'PASSKEY AA',
                detail: 'Biometric account abstraction for secure instant-pause.',
                color: 'text-secondary'
              }
            ].map((tech, i) => (
              <div key={i} className="space-y-4">
                <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${tech.color}`}>{tech.title}</div>
                <div className="text-sm font-bold text-white italic tracking-tighter leading-relaxed">{tech.detail}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
