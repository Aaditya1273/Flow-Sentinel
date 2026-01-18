'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, Target, Zap, Activity, TrendingUp, CheckCircle2 } from 'lucide-react'

const stats = [
  {
    label: 'ASSETS UNDER MANAGEMENT',
    value: '2.5M',
    suffix: 'FLOW',
    description: 'Total Capital Secured',
    icon: Target,
    color: 'text-primary'
  },
  {
    label: 'AVERAGE APY',
    value: '12.5%',
    suffix: '',
    description: 'Institutional returns',
    icon: TrendingUp,
    color: 'text-secondary'
  },
  {
    label: 'ACTIVE SENTINELS',
    value: '1,247',
    suffix: '',
    description: 'Autonomous Protocols',
    icon: Zap,
    color: 'text-primary'
  },
  {
    label: 'PROTECTION RATE',
    value: '99.9%',
    suffix: '',
    description: 'MEV Mitigation',
    icon: Shield,
    color: 'text-secondary'
  }
]

export function Stats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-32 relative overflow-hidden bg-background">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/2 blur-[150px] rounded-full pointer-events-none" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-24"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-[1px] bg-primary/30" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Protocol Performance</span>
            <div className="w-10 h-[1px] bg-primary/30" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic mb-6 leading-none">
            Institutional-Grade <span className="text-primary">Precision</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium italic">
            Automating wealth generation on Flow with mathematical certainty and zero human error.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="tool-card p-10 border-0 glass group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                <stat.icon className={`w-16 h-16 ${stat.color}`} />
              </div>

              <div className="relative z-10">
                <div className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter financial-number italic">
                  {stat.value}
                  <span className="text-sm font-black text-muted-foreground ml-2 tracking-widest">{stat.suffix}</span>
                </div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 leading-none">
                  {stat.label}
                </div>
                <div className={`text-[10px] font-bold uppercase italic tracking-widest ${stat.color}`}>
                  {stat.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Infrastructure Status */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 tool-card p-12 border-0 glass relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center bg-primary/5 border-primary/10">
                <Activity className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Sentinel Engine Status</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Global Mainnet Node Active</span>
                </div>
              </div>
            </div>

            <button className="btn-secondary rounded-xl px-8 h-12 text-[10px] font-black uppercase tracking-widest border-white/15 hover:bg-white/10 transition-all">
              View Live Monitoring
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'REBALANCING ENGINE', status: 'ACTIVE', detail: '+12.5% annualized yield optimization', icon: Target },
              { label: 'MEV MITIGATION', status: 'SHIELDED', detail: '0 bytes leaked to front-runners', icon: Shield },
              { label: 'VAULT INTEGRITY', status: 'VERIFIED', detail: 'All on-chain states synchronized', icon: CheckCircle2 }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/15 hover:border-white/10 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</span>
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{item.status}</span>
                </div>
                <div className="text-sm font-bold text-white uppercase italic tracking-tighter">{item.detail}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
