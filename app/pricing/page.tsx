'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, Check, HelpCircle, ArrowRight } from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'
import Link from 'next/link'

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for getting started with automated DeFi',
    price: 'Free',
    period: 'No fees',
    features: [
      '1 vault',
      'All available strategies',
      'MEV-Shield protection (Layer 1-4)',
      'Real-time performance tracking',
      'Activity feed',
      'Portfolio analytics',
    ],
    highlighted: false,
    cta: 'Get Started',
    ctaLink: '/dashboard',
  },
  {
    name: 'Pro',
    description: 'For active DeFi participants',
    price: '0.1%',
    period: 'per transaction',
    features: [
      'Up to 10 vaults',
      'All available strategies',
      'Priority strategy execution',
      'MEV-Shield protection (Layer 1-4)',
      'Advanced analytics',
      'Yield claim automation',
      'API access',
      'Priority support',
    ],
    highlighted: true,
    cta: 'Launch App',
    ctaLink: '/dashboard',
  },
  {
    name: 'Enterprise',
    description: 'For institutions and power users',
    price: 'Custom',
    period: 'contact us',
    features: [
      'Unlimited vaults',
      'Custom strategy deployment',
      'Dedicated execution nodes',
      'Custom MEV protection parameters',
      'White-label analytics',
      'SLA guarantee',
      'Dedicated support engineer',
      'Early access to new strategies',
    ],
    highlighted: false,
    cta: 'Contact Sales',
    ctaLink: '/faq',
  },
]

const feeBreakdown = [
  { operation: 'Vault Creation', fee: 'Free (gas only)', note: 'Network gas fee applies' },
  { operation: 'Deposit', fee: 'Free (gas only)', note: 'Network gas fee applies' },
  { operation: 'Withdrawal', fee: 'Free (gas only)', note: 'Network gas fee applies' },
  { operation: 'Strategy Execution', fee: 'Free (gas only)', note: 'No protocol fee — only network gas' },
  { operation: 'Yield Claim', fee: 'Free (gas only)', note: 'Network gas fee applies' },
  { operation: 'Emergency Pause', fee: 'Free (gas only)', note: 'Always free for security' },
]

export default function PricingPage() {
  const [mounted, setMounted] = useState(false)
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', background: 'radial-gradient(ellipse at center, rgba(0,239,139,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '30%', height: '40%', background: 'radial-gradient(ellipse at center, rgba(55,221,223,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      
      <Navbar />

      <div style={{ paddingTop: 128, paddingBottom: 96, position: 'relative', zIndex: 10 }}>
        <div className="w-container">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 64px' }}>
            <h1 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, color: '#FAF8F5', margin: '0 0 16px', textTransform: 'uppercase' }}>
              Transparent <span style={{ color: '#00EF8B' }}>Pricing</span>
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'rgba(250,248,245,0.55)', lineHeight: 1.7, fontWeight: 500, margin: 0 }}>
              No hidden fees. No surprises. You only pay for what you use.
            </p>
          </motion.div>

          {/* Plan Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 80 }}>
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                style={{
                  borderRadius: 32, padding: 40,
                  border: `2px solid ${plan.highlighted ? 'rgba(0,239,139,0.3)' : 'rgba(250,248,245,0.08)'}`,
                  background: plan.highlighted
                    ? 'linear-gradient(180deg, rgba(0,239,139,0.06) 0%, rgba(17,17,17,1) 100%)'
                    : 'rgba(250,248,245,0.02)',
                  display: 'flex', flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {plan.highlighted && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    padding: '4px 16px', borderRadius: 9999,
                    background: '#00EF8B', color: '#000',
                    fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>
                    Most Popular
                  </div>
                )}

                <h3 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: '1.25rem', fontWeight: 500, letterSpacing: '-0.02em', color: '#FAF8F5', margin: '0 0 8px', textTransform: 'uppercase' }}>
                  {plan.name}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(250,248,245,0.4)', marginBottom: 24, lineHeight: 1.6 }}>
                  {plan.description}
                </p>

                <div style={{ marginBottom: 32 }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 500, color: '#00EF8B', letterSpacing: '-0.03em' }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: 'rgba(250,248,245,0.4)', marginLeft: 8 }}>
                    {plan.period}
                  </span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.7)' }}>
                      <Check style={{ width: 14, height: 14, color: '#00EF8B', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaLink}
                  className={plan.highlighted ? 'dash-cta' : 'w-btn-outline'}
                  style={{
                    width: '100%', justifyContent: 'center', textDecoration: 'none',
                    ...(plan.highlighted ? { boxShadow: '0 10px 40px rgba(0,239,139,0.25)' } : {}),
                  }}
                >
                  {plan.cta}
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Fee Breakdown Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: '1.5rem', fontWeight: 500, letterSpacing: '-0.02em', color: '#FAF8F5', margin: '0 0 32px', textTransform: 'uppercase', textAlign: 'center' }}>
              Fee Breakdown
            </h2>
            <div className="dash-card" style={{ padding: 32, overflow: 'hidden' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Operation</th>
                    <th>Fee</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {feeBreakdown.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#FAF8F5', letterSpacing: '-0.01em' }}>{item.operation}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#00EF8B', fontVariantNumeric: 'tabular-nums' }}>{item.fee}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)' }}>{item.note}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* FAQ Link */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ textAlign: 'center', marginTop: 48 }}>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(250,248,245,0.55)' }}>
              Have questions about pricing? Check our <Link href="/faq" style={{ color: '#00EF8B', textDecoration: 'none' }}>FAQ</Link> or join our Discord.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
