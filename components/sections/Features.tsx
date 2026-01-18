'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, Zap, Lock, Activity, X, Check, ArrowRight, MousePointer2, Fingerprint, Cpu } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'AUTONOMOUS OPERATION',
    description: 'Self-executing protocols that operate continuously without human intervention, ensuring optimal performance through all market conditions.',
    accent: 'bg-primary/20 text-primary'
  },
  {
    icon: Shield,
    title: 'MEV SHIELDING',
    description: 'Advanced native shielding mechanisms protect against front-running and sandwich attacks, preserving every byte of transaction integrity.',
    accent: 'bg-secondary/20 text-secondary'
  },
  {
    icon: Fingerprint,
    title: 'PASSKEY SECURITY',
    description: 'Instant pause capabilities with biometric authentication provide immediate control when market conditions require human oversight.',
    accent: 'bg-primary/20 text-primary'
  },
  {
    icon: Cpu,
    title: 'ON-CHAIN FORTE ENGINE',
    description: 'Native blockchain scheduling eliminates external dependencies, ensuring reliable execution of strategies without third-party risks.',
    accent: 'bg-secondary/20 text-secondary'
  }
]

export function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="features" ref={ref} className="py-32 relative bg-background">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-20"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Core Capabilities</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic mb-8 leading-none">
            Built for <span className="text-primary italic">Absolute</span> Control
          </h2>
          <p className="text-lg text-muted-foreground font-medium italic leading-relaxed">
            Flow Sentinel combines native blockchain automation with institutional security standards to deliver an unparalleled DeFi experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="tool-card p-10 border-0 glass group relative overflow-hidden flex gap-8 items-start"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 shadow-[0_0_20px_rgba(0,0,0,0.3)] ${feature.accent}`}>
                <feature.icon className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm italic font-medium">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Institutional Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="tool-card p-12 lg:p-20 border-0 glass relative overflow-hidden"
        >
          <div className="absolute top-0 right-[-10%] w-[40%] h-[100%] bg-primary/5 skew-x-[-20deg] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-8 leading-none">
                The Sentinel <br /><span className="text-primary italic">Advantage</span>
              </h3>
              <p className="text-muted-foreground text-sm font-medium italic mb-10 leading-relaxed">
                Legacy DeFi management relies on fragile external infrastructure. Flow Sentinel internalizes the entire automation stack, delivering 100% on-chain reliability.
              </p>

              <button className="btn-primary px-8 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                View Technical Whitepaper <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              {[
                { label: 'Infrastructure', trad: 'External Bots/Keepers', sentinel: 'Native Forte Automation' },
                { label: 'Security', trad: 'Private Key Hot Wallets', sentinel: 'Passkey Biometrics' },
                { label: 'MEV Exposure', trad: 'Public Mempool Risks', sentinel: 'Native VRF Jitter Shield' },
                { label: 'Execution', trad: 'High Dependency', sentinel: '0% Counterparty Risk' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-white/15 group">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{item.label}</span>
                    <span className="text-xs font-bold text-white/40 italic line-through">{item.trad}</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-primary">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-black uppercase italic tracking-tighter">{item.sentinel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
