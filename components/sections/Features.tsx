'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, Zap, Lock, Activity, X, Check } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Autonomous Operation',
    description: 'Self-executing protocols that operate continuously without human intervention, ensuring optimal performance through all market conditions with mathematical precision.',
  },
  {
    icon: Shield,
    title: 'MEV Protection',
    description: 'Advanced shielding mechanisms protect against front-running and sandwich attacks, preserving transaction integrity through cryptographic security.',
  },
  {
    icon: Lock,
    title: 'Emergency Controls',
    description: 'Instant pause capabilities with biometric authentication provide immediate control when market conditions require human intervention and oversight.',
  },
  {
    icon: Activity,
    title: 'On-Chain Automation',
    description: 'Native blockchain scheduling eliminates external dependencies, ensuring reliable execution of strategies without third-party risks.',
  }
]

export function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="features" ref={ref} className="py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <h2 className="section-title">
            Professional DeFi Architecture
          </h2>
          <p className="section-subtitle">
            Built for reliability and precision, delivering enterprise-grade tools for autonomous wealth management 
            with institutional security standards.
          </p>
        </motion.div>

        <div className="feature-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="tool-card p-6"
            >
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-lg font-semibold mb-4">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 tool-card p-10"
        >
          <h3 className="text-3xl font-semibold mb-12 text-center">
            Why Choose Flow Sentinel
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="status-error font-semibold mb-6 text-xl">Traditional DeFi</div>
              <div className="space-y-4">
                <div className="flex items-center text-muted-foreground">
                  <X className="w-5 h-5 status-error mr-3 flex-shrink-0" />
                  <span>External bot dependencies</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <X className="w-5 h-5 status-error mr-3 flex-shrink-0" />
                  <span>MEV vulnerability exposure</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <X className="w-5 h-5 status-error mr-3 flex-shrink-0" />
                  <span>Complex key management</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <X className="w-5 h-5 status-error mr-3 flex-shrink-0" />
                  <span>Unpredictable gas costs</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="status-active font-semibold mb-6 text-xl">Flow Sentinel</div>
              <div className="space-y-4">
                <div className="flex items-center text-foreground">
                  <Check className="w-5 h-5 status-active mr-3 flex-shrink-0" />
                  <span>Native blockchain automation</span>
                </div>
                <div className="flex items-center text-foreground">
                  <Check className="w-5 h-5 status-active mr-3 flex-shrink-0" />
                  <span>Built-in MEV protection</span>
                </div>
                <div className="flex items-center text-foreground">
                  <Check className="w-5 h-5 status-active mr-3 flex-shrink-0" />
                  <span>Biometric authentication</span>
                </div>
                <div className="flex items-center text-foreground">
                  <Check className="w-5 h-5 status-active mr-3 flex-shrink-0" />
                  <span>Predictable fee structure</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="font-semibold mb-6 text-xl">Professional Result</div>
              <div className="space-y-4">
                <div className="flex items-center text-foreground">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>100% autonomous operation</span>
                </div>
                <div className="flex items-center text-foreground">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Maximum security assurance</span>
                </div>
                <div className="flex items-center text-foreground">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Enterprise-grade interface</span>
                </div>
                <div className="flex items-center text-foreground">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Optimal risk-adjusted returns</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}