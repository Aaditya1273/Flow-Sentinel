'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { Button } from 'components/ui/button'
import { Card, CardContent } from 'components/ui/card'
import { ArrowRight, Shield, Zap, Lock } from 'lucide-react'

export function CTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
            
            <CardContent className="relative p-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  Ready to Automate Your
                  <span className="block gradient-text">
                    Wealth Management?
                  </span>
                </h2>
                
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join the future of DeFi with Flow Sentinel's autonomous, MEV-resistant vaults. 
                  Start earning passive income today.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                  <Button asChild size="lg" variant="gradient" className="text-lg px-8 py-4">
                    <Link href="/dashboard">
                      Launch App
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  
                  <Button asChild size="lg" variant="outline" className="text-lg px-8 py-4">
                    <Link href="/docs">
                      Read Documentation
                    </Link>
                  </Button>
                </div>

                {/* Feature highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>Autonomous Operation</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>MEV Protection</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4 text-green-400" />
                    <span>Emergency Controls</span>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grant Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4">
                🏆 Flow Foundation Grant Recipient
              </h3>
              <p className="text-muted-foreground mb-4">
                Flow Sentinel is proudly supported by the Flow Foundation's 50,000 FLOW grant program, 
                recognizing our innovation in autonomous DeFi and Forte technology integration.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <span className="text-blue-400">✅ Technology Excellence</span>
                <span className="text-purple-400">✅ Innovation Leadership</span>
                <span className="text-green-400">✅ Ecosystem Growth</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
