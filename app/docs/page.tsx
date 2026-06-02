'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Book, Code, Shield, Zap, ChevronRight, ExternalLink,
  Copy, Check, Search, FileText, Lock, ArrowUpRight
} from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'

interface DocSection {
  id: string
  title: string
  items: DocItem[]
}

interface DocItem {
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  readTime: string
}

const docSections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Deployment Sequence',
    items: [
      { title: 'Core Architecture', description: 'Deep dive into the autonomous sentinel engine.', difficulty: 'beginner', readTime: '5 min' },
      { title: 'Vault Initialization', description: 'Complete technical walkthrough of the multisig deployment process.', difficulty: 'beginner', readTime: '10 min' },
      { title: 'Security Tier Analysis', description: 'Evaluate risk vectors across conservative and aggressive protocols.', difficulty: 'beginner', readTime: '8 min' },
    ]
  },
  {
    id: 'strategies',
    title: 'Forte Protocols',
    items: [
      { title: 'MEV-Shield Calculus', description: 'Understanding Native VRF jitter for front-running resistance.', difficulty: 'advanced', readTime: '15 min' },
      { title: 'Yield Maximization', description: 'Automated compounding logic across Flow native pools.', difficulty: 'intermediate', readTime: '12 min' },
      { title: 'Strategy Registry SDK', description: 'Building custom automated management modules with Cadence.', difficulty: 'advanced', readTime: '20 min' },
    ]
  }
]

const codeExample = `// Initialize Private Sentinel Vault
import SentinelVaultFinal from 0xc13b08053be24e87

transaction(vaultName: String, strategy: String) {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Deploying the most powerful DeFi manager...
        let vault <- SentinelVaultFinal.createVault(
            owner: signer.address,
            name: vaultName,
            strategy: strategy
        )
        
        // Permanent storage security...
        signer.storage.save(<-vault, to: /storage/Sentinel)
    }
}`

export default function DocsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeExample)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  if (!mounted) return null

  const diffStyles = (d: string): React.CSSProperties => {
    switch (d) {
      case 'beginner':    return { color: '#00EF8B', borderColor: 'rgba(0,239,139,0.25)', background: 'rgba(0,239,139,0.06)' }
      case 'intermediate': return { color: '#f59e0b', borderColor: 'rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.06)' }
      case 'advanced':    return { color: '#ef4444', borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)' }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '60%', background: 'radial-gradient(ellipse at center, rgba(0,239,139,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '40%', height: '40%', background: 'radial-gradient(ellipse at center, rgba(55,221,223,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <Navbar />

      <div style={{ paddingTop: 128, paddingBottom: 96, position: 'relative', zIndex: 10 }}>
        <div className="w-container">
          <div className="grid grid-cols-1 lg:grid-cols-[4fr_8fr] gap-16">
            {/* Left Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h1 style={{
                  fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 500,
                  letterSpacing: '-0.03em', lineHeight: 1,
                  color: '#FAF8F5', margin: '0 0 16px', textTransform: 'uppercase',
                }}>
                  The Library <br /><span style={{ color: '#00EF8B' }}>of Power</span>
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'rgba(250,248,245,0.55)', lineHeight: 1.7, fontWeight: 500, margin: 0 }}>
                  Access technical specifications, deployment strategies, and security protocols for the world&apos;s most advanced wealth manager.
                </p>

                <div style={{ position: 'relative', marginTop: 32 }}>
                  <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(250,248,245,0.3)' }} />
                  <input type="text" placeholder="QUERY PROTOCOL..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="dash-input" style={{ paddingLeft: 44, letterSpacing: '0.12em', fontWeight: 500, fontSize: '0.6875rem' }} />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="dash-card" style={{ padding: 28 }}>
                  <h3 className="dash-label" style={{ fontSize: '0.75rem', color: '#FAF8F5', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lock style={{ width: 14, height: 14, color: '#37DDDF' }} /> System Integrity
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="dash-label">Audit Status</span>
                      <span style={{ fontSize: '0.625rem', fontWeight: 500, color: '#00EF8B', letterSpacing: '0.1em' }}>Verified</span>
                    </div>
                    <div className="dash-progress">
                      <div className="dash-progress-bar" style={{ width: '98%' }} />
                    </div>
                    <p className="dash-label" style={{ lineHeight: 1.5 }}>
                      All core Sentinel contracts have undergone rigorous formal verification and third-party security audits.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
              {/* Code Example Card */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 24px', borderBottom: '1px solid rgba(250,248,245,0.06)',
                    background: 'rgba(250,248,245,0.02)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.4)' }} />
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(245,158,11,0.3)', border: '1px solid rgba(245,158,11,0.4)' }} />
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.4)' }} />
                      </div>
                      <span className="dash-label">SentinelVault.cdc</span>
                    </div>
                    <button onClick={handleCopyCode}
                      style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', color: 'rgba(250,248,245,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                      {copiedCode ? <Check style={{ width: 16, height: 16, color: '#00EF8B' }} /> : <Copy style={{ width: 16, height: 16 }} />}
                    </button>
                  </div>
                  <div style={{ padding: 32, fontFamily: 'monospace', fontSize: '0.8125rem', lineHeight: 1.8, overflowX: 'auto', background: 'rgba(0,0,0,0.4)' }}>
                    <code>
                      {codeExample.split('\n').map((line, i) => (
                        <div key={i} style={{ display: 'flex', gap: 24 }}>
                          <span style={{ width: 20, textAlign: 'right', color: 'rgba(250,248,245,0.12)', userSelect: 'none', fontSize: '0.6875rem' }}>{i + 1}</span>
                          <span style={{
                            color: line.startsWith('//') ? 'rgba(250,248,245,0.25)' :
                                   line.includes('import') || line.includes('transaction') ? '#00EF8B' : 'rgba(250,248,245,0.7)',
                            fontWeight: line.includes('import') || line.includes('transaction') ? 500 : 400,
                          }}>
                            {line}
                          </span>
                        </div>
                      ))}
                    </code>
                  </div>
                </div>
              </motion.div>

              {/* Documentation Grids */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                {docSections.map((section, idx) => (
                  <motion.div key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + (idx * 0.1) }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h2 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: '1.125rem', fontWeight: 500, color: '#FAF8F5', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                        {section.title}
                      </h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {section.items.map((item) => (
                        <div key={item.title} className="dash-timeline-item" style={{ cursor: 'pointer', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <h4 style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#FAF8F5', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.01em', transition: 'color 0.2s' }}>
                              {item.title}
                            </h4>
                            <ArrowUpRight style={{ width: 14, height: 14, color: 'rgba(250,248,245,0.2)', transition: 'all 0.2s' }} />
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'rgba(250,248,245,0.55)', lineHeight: 1.5, margin: '8px 0 0' }}>{item.description}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                            <span style={{
                              fontSize: '0.5rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase',
                              padding: '3px 8px', borderRadius: 6, border: '1px solid', transition: 'all 0.2s',
                              ...diffStyles(item.difficulty),
                            }}>
                              {item.difficulty}
                            </span>
                            <span className="dash-label" style={{ fontSize: '0.5rem' }}>{item.readTime} READ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Support CTA */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
                <div className="dash-card" style={{ padding: 64, textAlign: 'center', position: 'relative' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                    fontSize: '1.75rem', fontWeight: 500, letterSpacing: '-0.02em',
                    color: '#FAF8F5', margin: '0 0 16px', textTransform: 'uppercase',
                  }}>
                    Still stuck in the <span style={{ color: '#00EF8B' }}>matrix?</span>
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(250,248,245,0.55)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.7 }}>
                    Connect with our lead architects and the sentinel community for direct technical support.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <button className="dash-cta" style={{ padding: '14px 32px', fontSize: '0.6875rem' }}>
                      Join Secure Comms
                    </button>
                    <button style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '14px 32px', borderRadius: 26, border: '1px solid rgba(250,248,245,0.15)',
                      background: 'transparent', color: '#FAF8F5',
                      fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(250,248,245,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      Lead Arch Support
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
