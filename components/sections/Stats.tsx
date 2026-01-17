'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { formatCurrency, formatPercentage } from '@/lib/utils'

const stats = [
  {
    label: 'Total Value Locked',
    value: 2500000,
    suffix: 'FLOW',
    description: 'Secured in autonomous vaults'
  },
  {
    label: 'Average APY',
    value: 12.5,
    suffix: '%',
    description: 'Automated yield generation'
  },
  {
    label: 'Active Vaults',
    value: 1247,
    suffix: '',
    description: 'Self-managing portfolios'
  },
  {
    label: 'MEV Protected',
    value: 99.8,
    suffix: '%',
    description: 'Transactions shielded'
  }
]

export function Stats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="py-20 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted by DeFi Users Worldwide
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of users who have automated their wealth management with Flow Sentinel
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="glass p-8 rounded-xl text-center hover:bg-white/10 transition-all duration-300"
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.suffix === 'FLOW' ? (
                  <span className="gradient-text">
                    {(stat.value / 1000000).toFixed(1)}M
                  </span>
                ) : stat.suffix === '%' ? (
                  <span className="text-green-400">
                    {stat.value}%
                  </span>
                ) : (
                  <span className="text-blue-400">
                    {stat.value.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-lg font-semibold text-white mb-2">
                {stat.label}
              </div>
              <div className="text-sm text-gray-400">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 glass p-6 rounded-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            🔴 Live Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Vault #1247 executed rebalance</span>
              <span className="text-green-400">+2.3% yield</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">MEV attack blocked on Vault #892</span>
              <span className="text-blue-400">Protected</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Emergency pause triggered by user</span>
              <span className="text-yellow-400">Instant</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}