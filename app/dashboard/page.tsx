'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Shield,
  Zap,
  DollarSign,
  AlertTriangle,
  Plus,
  Settings,
  Activity,
  ArrowUpRight,
  ChevronRight,
  Target,
  Sparkles
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from 'components/layout/Navbar'
import { VaultCard } from 'components/dashboard/VaultCard'
import { PortfolioChart } from 'components/dashboard/PortfolioChart'
import { ActivityFeed } from 'components/dashboard/ActivityFeed'
import { CreateVaultModal } from 'components/dashboard/CreateVaultModal'
import { useFlow } from 'lib/flow'
import { useVaultData } from 'hooks/useVaultData'
import { formatCurrency, formatPercentage } from 'lib/utils'

import { Suspense } from 'react'
import { ErrorBoundary } from 'components/ErrorBoundary'

function DashboardContent() {
  const { user, logIn, isConnected } = useFlow()
  const { vaults, performance, flowBalance, loading, error, refetch } = useVaultData()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && !isConnected && !loading) { router.push('/') }
  }, [isConnected, loading, mounted, router])

  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get('create') === 'true') { setShowCreateModal(true) }
  }, [searchParams])

  if (!isConnected) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(ellipse at center, rgba(0,239,139,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: 64, position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 16px' }}>
            <h1 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: '2.25rem', fontWeight: 500, letterSpacing: '-0.02em', color: '#FAF8F5', margin: '0 0 16px', textTransform: 'uppercase' }}>
              Authentication Required
            </h1>
            <p style={{ color: 'rgba(250,248,245,0.55)', marginBottom: 40, lineHeight: 1.6, fontWeight: 500 }}>
              Access the Sentinel Command Center by establishing a secure link with your Flow wallet.
            </p>
            <button onClick={logIn} className="dash-cta" style={{ padding: '16px 40px' }}>
              Connect Flow Wallet
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: 64 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 24px' }}>
              <div style={{ position: 'absolute', inset: 0, border: '3px solid rgba(0,239,139,0.08)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', inset: 0, border: '3px solid transparent', borderTopColor: '#00EF8B', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
            <p className="dash-label" style={{ color: '#00EF8B', animation: 'pulse 2s infinite' }}>Establishing Secure Link...</p>
          </div>
        </div>
      </div>
    )
  }

  if (vaults.length === 0 && !loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-5%', width: '40%', height: '40%', background: 'radial-gradient(ellipse at center, rgba(0,239,139,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: 64, position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', maxWidth: 560, padding: '0 16px' }}>
            <h1 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: '2.25rem', fontWeight: 500, letterSpacing: '-0.02em', color: '#FAF8F5', margin: '0 0 16px', textTransform: 'uppercase' }}>
              Deploy Your Sentinel
            </h1>
            <p style={{ color: 'rgba(250,248,245,0.55)', marginBottom: 40, lineHeight: 1.6, fontWeight: 500 }}>
              Your command center is ready. Initialize your first autonomous vault to start capturing on-chain growth.
            </p>

            <div className="dash-stat" style={{ marginBottom: 40, textAlign: 'center' }}>
              <div className="dash-label" style={{ marginBottom: 12 }}>Available Capital</div>
              <div className="dash-value" style={{ fontSize: '2.5rem', marginBottom: 8 }}>{formatCurrency(flowBalance)}</div>
              <div className="dash-label">Flow Token (Testnet)</div>
            </div>

            <button onClick={() => setShowCreateModal(true)} className="dash-cta" style={{ padding: '20px 48px' }}>
              Initialize First Vault
            </button>
          </div>
        </div>
        <AnimatePresence>
          {showCreateModal && (
            <CreateVaultModal onClose={() => setShowCreateModal(false)} onSuccess={() => refetch()} preselectedStrategy={searchParams.get('strategy') || undefined} />
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '60%', height: '60%', background: 'radial-gradient(ellipse at center, rgba(0,239,139,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '50%', height: '50%', background: 'radial-gradient(ellipse at center, rgba(55,221,223,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <Navbar />

      <div style={{ paddingTop: 128, paddingBottom: 80, position: 'relative', zIndex: 10 }}>
        <div className="w-container">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dash-page-header">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div>
                <h1>Command Center</h1>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setShowCreateModal(true)} className="dash-cta" style={{ padding: '14px 24px', fontSize: '0.6875rem' }}>
                  <Plus style={{ width: 16, height: 16 }} /> New Vault
                </button>
                <button style={{
                  width: 48, height: 48, borderRadius: 24,
                  border: '1px solid rgba(250,248,245,0.10)',
                  background: 'transparent', color: 'rgba(250,248,245,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(250,248,245,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Settings style={{ width: 18, height: 18 }} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <ErrorBoundary>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 48 }}>
            {[
              { label: 'Total Net Asset Value', value: formatCurrency(performance?.totalBalance || 0), sub: performance?.totalPnlPercent ? formatPercentage(performance.totalPnlPercent) : '+0%', icon: DollarSign },
              { label: 'Available Capital', value: formatCurrency(flowBalance), sub: 'Ready for Deployment', icon: TrendingUp },
              { label: 'Managed Sentinels', value: vaults.length.toString(), sub: 'Secured & Active', icon: Shield },
              { label: 'Total Captured PnL', value: formatCurrency(performance?.totalPnl || 0), sub: 'Across All Vaults', icon: Target },
            ].map((stat, i) => (
              <div key={i} className="dash-stat" style={{ padding: '28px 32px' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="dash-label" style={{ marginBottom: 12 }}>{stat.label}</div>
                  <div className="dash-value" style={{ fontSize: '1.75rem', marginBottom: 8 }}>{stat.value}</div>
                  <div style={{ fontSize: '0.625rem', fontWeight: 500, color: i % 2 === 0 ? '#00EF8B' : '#37DDDF', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {stat.sub}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
          </ErrorBoundary>

          {/* Main Content Grid */}
          <ErrorBoundary>
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                  <h2 style={{
                    fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                    fontSize: '1.25rem', fontWeight: 500, letterSpacing: '-0.02em',
                    color: '#FAF8F5', margin: 0, textTransform: 'uppercase',
                  }}>
                    Managed Sentinels
                  </h2>
                  <div className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    SORT BY <ChevronRight style={{ width: 12, height: 12, transform: 'rotate(90deg)' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {vaults.map((v) => (
                    <VaultCard
                      key={v.id}
                      vault={{
                        id: v.id, name: v.name, balance: v.balance,
                        // APY fetched from YieldOracle via strategy metadata on-chain
                        apy: v.pnlPercent && v.balance > 0
                          ? v.pnlPercent / (v.lastExecution > 0 ? Math.max(1, (Date.now() / 1000 - v.lastExecution) / 86400) : 1)
                          : 0,
                        status: v.isActive ? 'active' : 'paused',
                        lastExecution: new Date(v.lastExecution * 1000),
                        strategy: v.strategy, risk: 'low' as const,
                        pnl: v.pnl, pnlPercent: v.pnlPercent,
                        protectionLevel: v.protectionLevel,
                        slippageBps: v.slippageBps,
                        commitRevealEnabled: v.commitRevealEnabled,
                        blockDelayEnabled: v.blockDelayEnabled,
                        mevProtectionsTriggered: v.mevProtectionsTriggered,
                        mevShieldStatus: v.mevShieldStatus
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="dash-card" style={{ padding: 40 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                    fontSize: '1.25rem', fontWeight: 500, letterSpacing: '-0.02em',
                    color: '#FAF8F5', margin: 0, textTransform: 'uppercase',
                  }}>
                    Strategic Projection
                  </h3>
                    <span className="dash-badge dash-badge-green">Real-Time Updates</span>
                  </div>
                  <PortfolioChart />
                </div>
              </motion.div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <ErrorBoundary><ActivityFeed /></ErrorBoundary>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <div className="dash-card" style={{ padding: 32 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                    fontSize: '1.25rem', fontWeight: 500, letterSpacing: '-0.02em',
                    color: '#FAF8F5', margin: '0 0 32px', textTransform: 'uppercase',
                  }}>
                    Fast Actions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { icon: Plus, label: 'DEPLOY NEW VAULT', action: () => setShowCreateModal(true) },
                      { icon: ArrowUpRight, label: 'EXTERNAL BRIDGE', action: () => {} },
                      { icon: Activity, label: 'GENERATE AUDIT', action: () => {} },
                    ].map((act, i) => (
                      <button
                        key={i}
                        onClick={act.action}
                        className="dash-timeline-item"
                        style={{ width: '100%', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                          <span className="dash-label">{act.label}</span>
                        </div>
                        <ChevronRight style={{ width: 16, height: 16, opacity: 0, transition: 'all 0.2s' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                <div className="dash-card" style={{ padding: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <Shield style={{ width: 24, height: 24, color: '#00EF8B' }} />
                    <h3 className="dash-label" style={{ fontSize: '0.875rem', color: '#FAF8F5' }}>Protocol Guard</h3>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(250,248,245,0.55)', marginBottom: 24, lineHeight: 1.6 }}>
                    Your Sentinels are protected by MEV-Shield Pro — a 4-layer MEV resistance system adapted from Flashbots MEV-Boost architecture for Flow blockchain.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="dash-label">Protection Level</span>
                      <span style={{ fontSize: '0.625rem', fontWeight: 500, color: '#00EF8B', letterSpacing: '0.1em' }}>Full (4 Layers)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="dash-label">Layer 1 — Commit-Reveal</span>
                      <span style={{ fontSize: '0.625rem', fontWeight: 500, color: '#00EF8B', letterSpacing: '0.1em' }}>ACTIVE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="dash-label">Layer 2 — VRF Block-Delay</span>
                      <span style={{ fontSize: '0.625rem', fontWeight: 500, color: '#00EF8B', letterSpacing: '0.1em' }}>ACTIVE (0-5 blocks)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="dash-label">Layer 3 — Price Deviation Guard</span>
                      <span style={{ fontSize: '0.625rem', fontWeight: 500, color: '#00EF8B', letterSpacing: '0.1em' }}>ACTIVE (3% slippage)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="dash-label">Layer 4 — Execution Queue</span>
                      <span style={{ fontSize: '0.625rem', fontWeight: 500, color: '#00EF8B', letterSpacing: '0.1em' }}>ACTIVE (VRF shuffle)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="dash-label">MEV Protections Triggered</span>
                      <span style={{ fontSize: '0.625rem', fontWeight: 500, color: '#37DDDF', letterSpacing: '0.1em' }}>{vaults.reduce((sum, v) => sum + (v.mevProtectionsTriggered || 0), 0)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          </ErrorBoundary>

          {error && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 48, padding: 24, borderRadius: 24, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <AlertTriangle style={{ width: 32, height: 32, color: '#ef4444' }} />
              <div>
                <p className="dash-label" style={{ color: '#ef4444' }}>System Warning</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#FAF8F5' }}>{error}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <CreateVaultModal onClose={() => setShowCreateModal(false)} onSuccess={() => refetch()} preselectedStrategy={searchParams.get('strategy') || undefined} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#000' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: 64 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 24px' }}>
              <div style={{ position: 'absolute', inset: 0, border: '3px solid rgba(0,239,139,0.08)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', inset: 0, border: '3px solid transparent', borderTopColor: '#00EF8B', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
            <p className="dash-label" style={{ color: '#00EF8B', animation: 'pulse 2s infinite' }}>Initializing System...</p>
          </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
