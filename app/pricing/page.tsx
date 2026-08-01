'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, Check, HelpCircle, ArrowRight } from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'
import Link from 'next/link'

const plans = [
  {
    name: 'Starter',
    description: 'Currently active — all features available at no cost during testnet.',
    price: 'Free',
    period: 'Testnet — no fees',
    badge: 'LIVE NOW',
    badgeColor: '#00EF8B',
    features: [
      'Unlimited vaults (testnet)',
      'All 4 deployed strategies',
      'MEV-Shield protection (all 4 layers)',
      'Real-time oracle APY data',
      'Automated execution keeper',
      'Portfolio analytics',
      'Yield reserve auto-funded via 0.1% fee',
      'Export data as CSV',
    ],
    highlighted: true,
    cta: 'Launch App',
    ctaLink: '/dashboard',
  },
  {
    name: 'Pro',
    description: 'Planned for mainnet launch — fee model will be enforced by smart contract.',
    price: '0.1%',
    period: 'per transaction (planned)',
    badge: 'COMING MAINNET',
    badgeColor: '#f59e0b',
    features: [
      'Priority strategy execution queue',
      'Advanced analytics dashboard',
      'Yield claim automation',
      'API access with per-user keys',
      'Priority support',
      'Email notifications via Resend',
      'Webhook integrations',
    ],
    highlighted: false,
    cta: 'Notify Me',
    ctaLink: '/faq',
  },
  {
    name: 'Enterprise',
    description: 'Institutional access — custom deployment with dedicated execution nodes.',
    price: 'Custom',
    period: 'contact us',
    badge: 'COMING MAINNET',
    badgeColor: '#f59e0b',
    features: [
      'Unlimited vaults with custom limits',
      'Custom strategy deployment',
      'Dedicated execution nodes',
      'Custom MEV protection parameters',
      'White-label analytics',
      'SLA guarantee',
      'Dedicated support engineer',
    ],
    highlighted: false,
    cta: 'Contact Sales',
    ctaLink: '/faq',
  },
]

const feeBreakdown = [
  { operation: 'Vault Creation', fee: 'Free (gas only)', note: 'Network gas fee applies — ~0.001 FLOW' },
  { operation: 'Deposit', fee: 'Disabled', note: 'New vault creation is disabled until audited integrations are deployed' },
  { operation: 'Withdrawal', fee: 'Free (gas only)', note: 'Network gas fee applies' },
  { operation: 'Strategy Execution', fee: 'Disabled', note: 'No external strategy execution is currently available' },
  { operation: 'Yield Claim', fee: 'Disabled', note: 'No externally generated yield is currently available' },
  { operation: 'Emergency Pause', fee: 'Free (gas only)', note: 'Security functions always free' },
  { operation: 'Oracle Update', fee: 'Disabled', note: 'APY publication is fail-closed until a verified data source exists' },
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
                  position: 'relative',
                  borderRadius: 32, padding: 40,
                  border: `2px solid ${plan.highlighted ? 'rgba(0,239,139,0.3)' : 'rgba(250,248,245,0.08)'}`,
                  background: plan.highlighted
                    ? 'linear-gradient(180deg, rgba(0,239,139,0.06) 0%, rgba(17,17,17,1) 100%)'
                    : 'rgba(250,248,245,0.02)',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                {/* Live/Coming status badge */}
                <div style={{
                  position: 'absolute', top: -12, left: 20, zIndex: 2,
                  padding: '3px 12px', borderRadius: 9999,
                  background: plan.badgeColor + '18',
                  border: `1px solid ${plan.badgeColor}40`,
                  fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.15em',
                  color: plan.badgeColor, textTransform: 'uppercase',
                }}>
                  {plan.badge}
                </div>
                {/* Phase 7: Testnet badge in place of old "Most Popular" ribbon */}
                {plan.highlighted && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    padding: '4px 16px', borderRadius: 9999,
                    background: '#00EF8B', color: '#000',
                    fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>
                    Active Now
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
