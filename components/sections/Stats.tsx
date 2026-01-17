'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { CheckCircle } from 'lucide-react'

const stats = [
  {
    label: 'Assets Under Management',
    value: 2500000,
    suffix: 'FLOW',
    description: 'Total value secured'
  },
  {
    label: 'Average APY',
    value: 12.5,
    suffix: '%',
    description: 'Automated returns'
  },
  {
    label: 'Active Vaults',
    value: 1247,
    suffix: '',
    description: 'Self-managing protocols'
  },
  {
    label: 'Protection Rate',
    value: 99.8,
    suffix: '%',
    description: 'MEV attacks prevented'
  }
]

export function Stats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="py-24 border-y border-border">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <h2 className="section-title">
            Trusted by DeFi Professionals
          </h2>
          <p className="section-subtitle">
            Autonomous protocols managing capital with mathematical precision and institutional-grade reliability
          </p>
        </motion.div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="tool-card p-8 text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-3 financial-number">
                {stat.suffix === 'FLOW' ? (
                  <span>
                    {(stat.value / 1000000).toFixed(1)}M
                  </span>
                ) : stat.suffix === '%' ? (
                  <span className="status-active">
                    {stat.value}%
                  </span>
                ) : (
                  <span>
                    {stat.value.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-xl font-semibold mb-2">
                {stat.label}
              </div>
              <div className="text-muted-foreground">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 tool-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold">
              System Status
            </h3>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 status-active" />
              <span className="text-muted-foreground font-medium">All systems operational</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-accent rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Autonomous rebalancing executed</div>
              <div className="status-active font-semibold text-xl financial-number">+2.34% yield</div>
            </div>
            <div className="text-center p-6 bg-accent rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">MEV protection activated</div>
              <div className="font-semibold text-xl">Transaction secured</div>
            </div>
            <div className="text-center p-6 bg-accent rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Emergency controls verified</div>
              <div className="text-muted-foreground font-semibold text-xl">System ready</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}