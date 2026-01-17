'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card'
import { Badge } from 'components/ui/badge'
import { 
  Wallet, 
  Settings, 
  Zap, 
  Shield,
  ArrowRight
} from 'lucide-react'

const steps = [
  {
    step: 1,
    title: 'Connect Your Wallet',
    description: 'Connect your Flow wallet using Passkeys (FaceID/TouchID) or traditional methods. No seed phrases required.',
    icon: Wallet,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10'
  },
  {
    step: 2,
    title: 'Configure Your Strategy',
    description: 'Choose from conservative, balanced, or aggressive yield strategies. Set your risk tolerance and investment goals.',
    icon: Settings,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10'
  },
  {
    step: 3,
    title: 'Deposit & Activate',
    description: 'Deposit FLOW tokens and activate autonomous mode. Your vault will start executing trades every 24 hours.',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10'
  },
  {
    step: 4,
    title: 'Earn Passively',
    description: 'Sit back and watch your wealth grow. Emergency pause available anytime via biometric authentication.',
    icon: Shield,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10'
  }
]

export function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="how-it-works" ref={ref} className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            Simple Process
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How Flow Sentinel Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get started with autonomous wealth management in just 4 simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="relative"
            >
              <Card className="h-full hover:bg-card/80 transition-colors">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${step.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  <Badge variant="secondary" className="w-fit mx-auto mb-2">
                    Step {step.step}
                  </Badge>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    {step.description}
                  </p>
                </CardContent>
              </Card>

              {/* Arrow for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Technical Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                🔧 Under the Hood
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <h4 className="font-semibold mb-2 text-blue-400">
                    Forte Scheduled Transactions
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Native blockchain automation executes trades every 24 hours without external dependencies
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-purple-400">
                    Native VRF Protection
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    On-chain randomness adds timing jitter to prevent MEV attacks and front-running
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-green-400">
                    Account Abstraction
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Passkey integration enables emergency controls via biometric authentication
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}