'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  Shield, 
  Zap, 
  Lock, 
  TrendingUp, 
  Clock, 
  Smartphone,
  Bot,
  DollarSign
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Forte Scheduled Transactions',
    description: 'Self-executing vault that automatically rebalances every 24 hours using Flow\'s native scheduler. No external bots or servers required.',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20'
  },
  {
    icon: Shield,
    title: 'Native VRF MEV Protection',
    description: 'On-chain randomness prevents front-running attacks by adding unpredictable timing jitter to all automated trades.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20'
  },
  {
    icon: Smartphone,
    title: 'Passkey Emergency Controls',
    description: 'Instant pause via FaceID/TouchID using Flow\'s Account Abstraction. No seed phrases needed for emergency stops.',
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/20'
  },
  {
    icon: TrendingUp,
    title: 'Automated Yield Strategies',
    description: 'Intelligent portfolio rebalancing across IncrementFi, Flowty, and other Flow DeFi protocols for optimal returns.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/20'
  },
  {
    icon: Lock,
    title: 'Security First Design',
    description: 'Multi-layered security with emergency pause, time-locked withdrawals, and comprehensive audit trail.',
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/20'
  },
  {
    icon: DollarSign,
    title: 'High Precision Math',
    description: 'UFix64 precision calculations ensure accurate yield distribution and fee calculations down to the smallest unit.',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400/20'
  }
]

export function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="features" ref={ref} className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Revolutionary DeFi Features
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built with Flow's cutting-edge Forte upgrade, Flow Sentinel introduces 
            features impossible on other blockchains
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`glass p-8 rounded-xl border ${feature.borderColor} hover:bg-white/5 transition-all duration-300 group`}
            >
              <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Technical Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 glass p-8 rounded-xl"
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Why Flow Sentinel is Unique
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-red-400 font-semibold mb-2">Ethereum/Solana</div>
              <div className="text-gray-400 text-sm">
                ❌ Relies on external bots<br/>
                ❌ MEV vulnerable<br/>
                ❌ Complex seed phrases<br/>
                ❌ High gas fees
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-blue-400 font-semibold mb-2">Flow Sentinel</div>
              <div className="text-gray-300 text-sm">
                ✅ Native blockchain automation<br/>
                ✅ Built-in MEV protection<br/>
                ✅ Passkey authentication<br/>
                ✅ Predictable low fees
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-green-400 font-semibold mb-2">Result</div>
              <div className="text-gray-300 text-sm">
                🚀 100% autonomous operation<br/>
                🛡️ Maximum security<br/>
                📱 Consumer-friendly UX<br/>
                💰 Optimal returns
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}