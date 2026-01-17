'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Card, CardContent } from 'components/ui/card'
import { Badge } from 'components/ui/badge'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Alex Chen',
    role: 'DeFi Investor',
    avatar: '👨‍💻',
    content: 'Flow Sentinel is revolutionary. I sleep better knowing my portfolio is protected from MEV attacks while earning consistent yields.',
    rating: 5,
    highlight: 'MEV Protection'
  },
  {
    name: 'Sarah Kim',
    role: 'Crypto Trader',
    avatar: '👩‍💼',
    content: 'The Passkey emergency pause saved me during the last market crash. One FaceID tap and all my funds were safe.',
    rating: 5,
    highlight: 'Emergency Controls'
  },
  {
    name: 'Marcus Johnson',
    role: 'Portfolio Manager',
    avatar: '👨‍💼',
    content: 'Finally, a DeFi platform that actually runs itself. No more worrying about bot failures or server downtime.',
    rating: 5,
    highlight: 'Autonomous Operation'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Web3 Developer',
    avatar: '👩‍💻',
    content: 'The technical architecture is impressive. Forte scheduled transactions are the future of DeFi automation.',
    rating: 5,
    highlight: 'Technical Innovation'
  },
  {
    name: 'David Park',
    role: 'Yield Farmer',
    avatar: '👨‍🌾',
    content: 'Consistent 12%+ APY with zero maintenance. Flow Sentinel has transformed my DeFi strategy.',
    rating: 5,
    highlight: 'Consistent Returns'
  },
  {
    name: 'Lisa Wang',
    role: 'Institutional Investor',
    avatar: '👩‍💼',
    content: 'The security features and audit trail give us confidence to deploy significant capital through Sentinel vaults.',
    rating: 5,
    highlight: 'Enterprise Security'
  }
]

export function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="py-20 bg-muted/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by DeFi Leaders
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See what our users say about their experience with Flow Sentinel
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card className="h-full hover:bg-card/80 transition-colors">
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <blockquote className="text-muted-foreground mb-6">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{testimonial.avatar}</div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="text-xs">
                      {testimonial.highlight}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16"
        >
          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">1,247</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">$2.5M</div>
                  <div className="text-sm text-muted-foreground">Total Value Locked</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">99.8%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}