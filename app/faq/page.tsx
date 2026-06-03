'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, Shield, Zap, DollarSign, Wallet, Lock, HelpCircle } from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'

interface FAQItem {
  q: string
  a: string
  category: string
}

const faqs: FAQItem[] = [
  {
    category: 'General',
    q: 'What is Flow Sentinel?',
    a: 'Flow Sentinel is an autonomous DeFi wealth management protocol built on the Flow blockchain. It enables users to create automated investment vaults that execute yield-generating strategies with built-in MEV (Maximal Extractable Value) protection across 4 security layers.'
  },
  {
    category: 'General',
    q: 'How is this different from a regular DeFi dashboard?',
    a: 'Flow Sentinel is fully autonomous. Once you deploy a vault and fund it, the protocol handles strategy execution, yield compounding, and MEV protection automatically. You don\'t need to manually rebalance, harvest yields, or monitor positions. The smart contracts handle everything.'
  },
  {
    category: 'General',
    q: 'What blockchain does Flow Sentinel use?',
    a: 'Flow Sentinel is built on the Flow blockchain (created by Flow Foundation, the team behind NBA Top Shot). Flow supports both Cadence (native) and EVM smart contracts. Flow Sentinel uses Cadence for its advanced security features and resource-oriented programming model.'
  },
  {
    category: 'Vaults',
    q: 'What is a Sentinel Vault?',
    a: 'A Sentinel Vault is an autonomous smart contract that holds your FLOW tokens and executes strategies on your behalf. Each vault has its own strategy, MEV protection settings, and performance tracking. You can create multiple vaults with different strategies to diversify your approach.'
  },
  {
    category: 'Vaults',
    q: 'How do I create a vault?',
    a: 'Connect your Flow wallet, navigate to the Dashboard, and click "Initialize First Vault." Select a strategy, name your vault, choose your initial deposit amount, and confirm the transaction in your wallet. The entire process takes less than 2 minutes.'
  },
  {
    category: 'Vaults',
    q: 'Can I have multiple vaults?',
    a: 'Yes. You can create as many vaults as you want, each with a different strategy, risk level, and deposit amount. This allows you to diversify your DeFi exposure across different strategies and risk profiles.'
  },
  {
    category: 'Vaults',
    q: 'Can I withdraw my funds anytime?',
    a: 'Yes. You can withdraw your funds from any vault at any time, provided the vault is active (not paused). Withdrawals are processed instantly on the Flow blockchain. You only pay the network gas fee for the transaction.'
  },
  {
    category: 'Security',
    q: 'How does MEV protection work?',
    a: 'Flow Sentinel implements a 4-layer MEV protection system adapted from Flashbots MEV-Boost architecture for the Flow blockchain: Layer 1 — Commit-Reveal Execution (prevents front-running), Layer 2 — VRF Block-Delay Jitter (randomizes execution timing), Layer 3 — Price Deviation Guard (prevents oracle manipulation), Layer 4 — Execution Queue (VRF-shuffled processing order).'
  },
  {
    category: 'Security',
    q: 'Have the contracts been audited?',
    a: 'The core smart contracts have undergone internal security review and automated analysis. A formal third-party audit by a Cadence-specialized firm (such as Runtime Verification or Secure3) is in progress. Users should only deposit funds they can afford to lose.'
  },
  {
    category: 'Security',
    q: 'What happens if a vulnerability is found?',
    a: 'Each vault has an emergency pause function that can be triggered by the vault owner. Additionally, the protocol\'s MultiSigAdmin system allows authorized administrators to pause operations if a critical vulnerability is detected. Users can withdraw their funds at any time from paused vaults.'
  },
  {
    category: 'Strategies',
    q: 'What strategies are available?',      a: 'Flow Sentinel offers multiple strategies including: Liquid Staking Pro (low risk, ~6.5% APY from Flow staking), DeFi Yield Maximizer (medium risk, ~8.2% APY from DeFi aggregation), Arbitrage Hunter (medium risk, ~5.8% APY from cross-DEX), and High-Yield Farming (high risk, ~15.5% APY). All APY values are sourced from the on-chain YieldOracle and reflect realistic market conditions on Flow.'
  },
  {
    category: 'Strategies',
    q: 'How are yields generated?',
    a: 'Yields are generated through real DeFi protocol integrations including Flow native staking, liquidity provision on Flow DEXs, lending protocols, and cross-DEX arbitrage. The YieldOracle provides real-time APY data from integrated sources. Actual returns may vary based on market conditions.'
  },
  {
    category: 'Strategies',
    q: 'Can I lose money?',
    a: 'Yes. All DeFi strategies carry inherent risk. Smart contract vulnerabilities, market volatility, impermanent loss, oracle manipulation, and MEV attacks can all result in loss of funds. Past performance does not guarantee future results. Only deposit funds you can afford to lose.'
  },
  {
    category: 'Technical',
    q: 'What wallets are supported?',
    a: 'Flow Wallet is the primary supported wallet for Cadence transactions. EVM wallets (MetaMask, Rainbow Wallet, etc.) are supported through Flow\'s EVM Gateway for compatible operations. For the full Flow Sentinel experience, Flow Wallet is recommended.'
  },
  {
    category: 'Technical',
    q: 'What are the gas fees?',
    a: 'Flow blockchain transactions require a small gas fee paid in FLOW tokens. Typical operations (deposits, withdrawals, strategy triggers) cost approximately 0.001–0.01 FLOW per transaction. Strategy execution fees may vary based on complexity.'
  },
  {
    category: 'Technical',
    q: 'How do I claim yield generated by my vault?',
    a: 'Accrued yield can be claimed from any active vault through the vault details panel. Click "Claim Yield" on your vault card, confirm the transaction in your wallet, and the yield will be transferred to your Flow wallet. Yield is tracked on-chain and updated after each strategy execution.'
  },
  {
    category: 'Token',
    q: 'Is there a SEN token?',
    a: 'The Flow Sentinel protocol has a SEN token that may be used for governance voting, fee discounts, and protocol participation. Details about tokenomics, distribution, and utility will be announced separately.'
  },
  {
    category: 'Support',
    q: 'How do I get help if something goes wrong?',
    a: 'Join the official Flow Sentinel Discord server for community support. For critical issues, contact the development team through the support channels. Before reporting issues, check the FAQ and documentation pages for troubleshooting guidance.'
  },
  {
    category: 'Support',
    q: 'How do I report a bug or vulnerability?',
    a: 'Security vulnerabilities should be reported responsibly through the official Discord server or by contacting the team directly. Please do not post vulnerabilities publicly. Responsible disclosure helps protect all users.'
  }
]

const categories = ['General', 'Vaults', 'Security', 'Strategies', 'Technical', 'Token', 'Support']

export default function FAQPage() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchTerm === '' ||
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !activeCategory || faq.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', background: 'radial-gradient(ellipse at center, rgba(0,239,139,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '30%', height: '40%', background: 'radial-gradient(ellipse at center, rgba(55,221,223,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      
      <Navbar />

      <div style={{ paddingTop: 128, paddingBottom: 96, position: 'relative', zIndex: 10 }}>
        <div className="w-container" style={{ maxWidth: 900 }}>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 48 }}>
            <h1 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, color: '#FAF8F5', margin: '0 0 16px', textTransform: 'uppercase' }}>
              Knowledge Base
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'rgba(250,248,245,0.55)', lineHeight: 1.7, fontWeight: 500, margin: 0 }}>
              Everything you need to know about Flow Sentinel. Can&apos;t find what you&apos;re looking for? Join our Discord.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 32 }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(250,248,245,0.3)' }} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="dash-input"
                style={{ paddingLeft: 44, fontSize: '0.875rem' }}
              />
            </div>
          </motion.div>

          {/* Category Filters */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
            <button
              onClick={() => setActiveCategory(null)}
              className={`dash-badge ${!activeCategory ? 'dash-badge-green' : 'dash-badge-muted'}`}
              style={{ cursor: 'pointer', fontSize: '0.625rem', padding: '8px 16px', textTransform: 'uppercase', letterSpacing: '0.12em' }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`dash-badge ${activeCategory === cat ? 'dash-badge-green' : 'dash-badge-muted'}`}
                style={{ cursor: 'pointer', fontSize: '0.625rem', padding: '8px 16px', textTransform: 'uppercase', letterSpacing: '0.12em' }}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* FAQ Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredFaqs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <HelpCircle style={{ width: 48, height: 48, color: 'rgba(250,248,245,0.2)', margin: '0 auto 16px' }} />
                <p className="dash-label" style={{ fontSize: '0.75rem' }}>No results found for "{searchTerm}"</p>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const originalIndex = faqs.indexOf(faq)
                const isOpen = openItems.has(originalIndex)
                return (
                  <motion.div
                    key={originalIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <button
                      onClick={() => toggleItem(originalIndex)}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '24px 28px', borderRadius: 24,
                        border: `1px solid ${isOpen ? 'rgba(0,239,139,0.2)' : 'rgba(250,248,245,0.08)'}`,
                        background: isOpen ? 'rgba(0,239,139,0.03)' : 'rgba(250,248,245,0.02)',
                        cursor: 'pointer', transition: 'all 0.3s',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: 16,
                      }}
                      onMouseEnter={e => { if (!isOpen) e.currentTarget.style.borderColor = 'rgba(250,248,245,0.16)' }}
                      onMouseLeave={e => { if (!isOpen) e.currentTarget.style.borderColor = 'rgba(250,248,245,0.08)' }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span className="dash-badge dash-badge-muted" style={{ fontSize: '0.4375rem', padding: '2px 8px', whiteSpace: 'nowrap' }}>
                            {faq.category}
                          </span>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#FAF8F5', letterSpacing: '-0.01em' }}>
                            {faq.q}
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        style={{
                          width: 16, height: 16, color: 'rgba(250,248,245,0.3)', flexShrink: 0,
                          transition: 'transform 0.3s',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{
                            padding: '20px 28px', marginTop: -8,
                            borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
                            border: '1px solid rgba(0,239,139,0.1)',
                            borderTop: 'none',
                            background: 'rgba(0,239,139,0.02)',
                          }}>
                            <p style={{ fontSize: '0.8125rem', lineHeight: 1.8, color: 'rgba(250,248,245,0.7)', margin: 0 }}>
                              {faq.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })
            )}
          </div>

          {/* Support CTA */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} style={{ marginTop: 64 }}>
            <div style={{ padding: 48, borderRadius: 32, border: '1px solid rgba(250,248,245,0.08)', background: 'rgba(250,248,245,0.02)', textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: '1.25rem', fontWeight: 500, letterSpacing: '-0.02em', color: '#FAF8F5', margin: '0 0 8px', textTransform: 'uppercase' }}>
                Still have questions?
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'rgba(250,248,245,0.55)', marginBottom: 24, lineHeight: 1.6 }}>
                Our community and team are ready to help you on Discord.
              </p>
              <button className="dash-cta" style={{ padding: '14px 32px', fontSize: '0.6875rem' }}>
                Join Discord
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
