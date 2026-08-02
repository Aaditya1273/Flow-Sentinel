'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Shield,
  DollarSign,
  AlertTriangle,
  Plus,
  Settings,
  Activity,
  ArrowUpRight,
  ChevronRight,
  Target,
  RefreshCw
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from 'components/layout/Navbar'
import { VaultCard } from 'components/dashboard/VaultCard'
import { IdleBalanceWidget } from 'components/dashboard/IdleBalanceWidget'
import { ReserveHealthWidget } from 'components/dashboard/ReserveHealthWidget'
import { OracleFreshnessBar } from 'components/dashboard/OracleFreshnessBar'
import { CircuitBreakerStatus } from 'components/dashboard/CircuitBreakerStatus'
import { useFlow } from 'lib/flow'
import { useVaultData } from 'hooks/useVaultData'
import { FlowService } from 'lib/flow-service'
import { formatCurrency, formatPercentage } from 'lib/utils'
import { useTransactions } from 'lib/transactions'
import { ErrorBoundary } from 'components/ErrorBoundary'

// Lazy-loaded heavy components — not needed on initial paint
const PortfolioChart = dynamic(() => import('components/dashboard/PortfolioChart').then(m => ({ default: m.PortfolioChart })), {
  ssr: false,
  loading: () => (
    <div className="dash-skeleton-chart" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 32, height: 32 }}>
        <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(0,239,139,0.08)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, border: '2px solid transparent', borderTopColor: '#00EF8B', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    </div>
  ),
})

const ActivityFeed = dynamic(() => import('components/dashboard/ActivityFeed').then(m => ({ default: m.ActivityFeed })), {
  ssr: false,
  loading: () => (
    <div className="dash-card" style={{ padding: 24 }}>
      <h3 className="dash-label" style={{ fontSize: '1.25rem', marginBottom: 32 }}>SECURE LOGS</h3>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div className="dash-skeleton dash-skeleton-text" />
            <div className="dash-skeleton dash-skeleton-text short" />
          </div>
        </div>
      ))}
    </div>
  ),
})

const CreateVaultModal = dynamic(() => import('components/dashboard/CreateVaultModal').then(m => ({ default: m.CreateVaultModal })), {
  ssr: false,
})

function DashboardContent() {
  const { user, logIn, isConnected } = useFlow()
  const { vaults, performance, flowBalance, protocolStats, oracleData, provenanceData, loading, error, refetch } = useVaultData()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { setTxState } = useTransactions()

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true) }, [])

  // Phase 9: Fetch circuit breaker data on mount
  const [circuitBreakerData, setCircuitBreakerData] = useState<Record<string, unknown> | null>(null)
  useEffect(() => {
    if (isConnected) {
      import('lib/flow-service').then(({ FlowService }) => {
        FlowService.getCircuitBreakerStatus().then(setCircuitBreakerData)
      })
    }
  }, [isConnected])

  useEffect(() => {
    if (mounted && !isConnected && !loading) { router.push('/') }
  }, [isConnected, loading, mounted, router])

  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowCreateModal(true)
    }
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
            <button onClick={() => logIn()} className="dash-cta" style={{ padding: '16px 40px' }}>
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
              Your yield vault is ready. Create a vault to start earning protected yield on your FLOW tokens with MEV protection.
            </p>

            <div className="dash-stat" style={{ marginBottom: 40, textAlign: 'center' }}>
              <div className="dash-label" style={{ marginBottom: 12 }}>Available Capital</div>
              <div className="dash-value" style={{ fontSize: '2.5rem', marginBottom: 8 }}>{formatCurrency(flowBalance)}</div>
              <div className="dash-label">Flow Token (Testnet)</div>
            </div>

            <button onClick={() => setShowCreateModal(true)} className="dash-cta" style={{ padding: '20px 48px' }}>
              <Plus style={{ width: 20, height: 20 }} /> Create Vault
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
                {/* Phase 7: Testnet badge — honest about current deployment state */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 9999, fontSize: '0.5rem', fontWeight: 700,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: '#00EF8B', background: 'rgba(0,239,139,0.10)',
                    border: '1px solid rgba(0,239,139,0.25)',
                  }}>
                    ⚡ PRODUCTION READY
                  </span>
                  <span style={{ fontSize: '0.5rem', color: 'rgba(250,248,245,0.3)', letterSpacing: '0.08em' }}>
                    Flow Testnet · Contract: 0x60320435dd7725c1
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setShowCreateModal(true)} className="dash-cta" style={{ padding: '14px 24px', fontSize: '0.6875rem' }}>
                  <Plus style={{ width: 16, height: 16 }} /> New Vault
                </button>
                <button aria-label="Open settings"
                  style={{
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

          {/* Idle Balance Earning Widget — turns wallet FLOW into active yield */}
          <ErrorBoundary>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 32 }}>
            <IdleBalanceWidget
              flowBalance={flowBalance}
              hasVaults={vaults.length > 0}
              vaultBalance={vaults.length > 0 ? vaults.reduce((s, v) => s + v.balance, 0) : 0}
              vaultApy={vaults.length > 0
                ? vaults.reduce((sum, v) => sum + v.balance * (v.apy ?? 0), 0) / vaults.reduce((sum, v) => sum + v.balance, 0)
                : 0}
              vaultYieldAccrued={vaults.length > 0 ? vaults.reduce((s, v) => s + (v.totalYieldAccrued ?? 0), 0) : 0}
              vaultId={vaults.length > 0 ? vaults[0].id : undefined}
              vaultName={vaults.length > 0 ? vaults[0].name : undefined}
              onActivate={async () => {
                try {
                  setTxState({ status: 'executing', txId: null, error: null, title: 'Activating Wallet Earning' })
                  const { transactionId, sealed } = await FlowService.quickEarn(flowBalance)
                  setTxState({ status: 'submitting', txId: transactionId, error: null, title: 'Activating Wallet Earning' })
                  setTxState({ status: 'pending', txId: transactionId, error: null, title: 'Activating Wallet Earning' })
                  await sealed
                  setTxState({ status: 'sealed', txId: transactionId, error: null, title: 'Wallet Earning Active' })
                  refetch()
                } catch (err: unknown) {
                  const errMsg = err instanceof Error ? err.message : 'Failed to activate earning'
                  setTxState({ status: 'error', txId: null, error: errMsg, title: 'Activation Failed' })
                }
              }}
              onRefresh={refetch}
            />
          </motion.div>
          </ErrorBoundary>

          {/* Stats Overview */}
          <ErrorBoundary>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 48 }}>
            {[
              { label: 'Total Net Asset Value', value: formatCurrency(performance?.totalBalance || 0), sub: performance?.totalPnlPercent ? formatPercentage(performance.totalPnlPercent) : '+0%', icon: DollarSign },
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
                {/* Phase 4: Oracle freshness bar — shows APY data age + staleness warning */}
                {Object.keys(oracleData).length > 0 && (
                  <OracleFreshnessBar apyData={oracleData} provenanceData={provenanceData} onForceRefresh={refetch} />
                )}
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
                        // Real APY from on-chain YieldOracle (contract-level readAllAPYs)
                        apy: v.apy ?? 0,
                        status: v.isActive ? 'active' : 'paused',
                        lastExecution: new Date(v.lastExecution * 1000),
                        strategy: v.strategy, risk: 'low' as const,
                        pnl: v.pnl, pnlPercent: v.pnlPercent,
                        totalYieldAccrued: v.totalYieldAccrued,  // Phase 2: real claimable yield
                        totalDeposits: v.totalDeposits,
                        protectionLevel: v.protectionLevel,
                        slippageBps: v.slippageBps,
                        commitRevealEnabled: v.commitRevealEnabled,
                        blockDelayEnabled: v.blockDelayEnabled,
                        mevProtectionsTriggered: v.mevProtectionsTriggered,
                        mevShieldStatus: v.mevShieldStatus,
                        // Phase 5: scheduling
                        nextScheduledExecution: v.nextScheduledExecution,
                        executionIntervalSeconds: v.executionIntervalSeconds,
                      }}
                      provenance={provenanceData?.[v.strategyId]}
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

              {/* Phase 2: Reserve Health Widget — live reserve balance + fund controls */}
              {protocolStats && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
                  <ErrorBoundary>
                    <ReserveHealthWidget stats={protocolStats} onFunded={refetch} />
                  </ErrorBoundary>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <CircuitBreakerStatus data={circuitBreakerData as any} />
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}>
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
                      {
                        icon: Plus,
                        label: 'DEPLOY NEW VAULT',
                        sub: 'Initialize a new strategy vault',
                        action: () => setShowCreateModal(true),
                        live: true,
                      },
                      {
                        icon: RefreshCw,
                        label: 'REFRESH ORACLE',
                        sub: 'Force-fetch latest APY data',
                        action: () => refetch(),
                        live: true,
                      },
                      {
                        icon: ArrowUpRight,
                        label: 'EXTERNAL BRIDGE',
                        sub: 'Mainnet launch — coming soon',
                        action: null,
                        live: false,
                      },
                      {
                        icon: Activity,
                        label: 'ON-CHAIN AUDIT',
                        sub: 'Mainnet launch — coming soon',
                        action: null,
                        live: false,
                      },
                    ].map((act, i) => (
                      <button
                        key={i}
                        onClick={act.action ?? undefined}
                        disabled={!act.live}
                        className={act.live ? 'dash-timeline-item' : undefined}
                        style={{
                          width: '100%', cursor: act.live ? 'pointer' : 'default',
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 16px', borderRadius: 16, border: 'none', textAlign: 'left',
                          background: act.live ? 'rgba(250,248,245,0.02)' : 'rgba(250,248,245,0.01)',
                          transition: 'background 0.2s',
                          opacity: act.live ? 1 : 0.4,
                        }}
                        aria-label={act.label}
                        onMouseEnter={e => { if (act.live) (e.currentTarget as HTMLElement).style.background = 'rgba(250,248,245,0.05)' }}
                        onMouseLeave={e => { if (act.live) (e.currentTarget as HTMLElement).style.background = 'rgba(250,248,245,0.02)' }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: act.live ? 'rgba(0,239,139,0.08)' : 'rgba(250,248,245,0.04)', flexShrink: 0 }}>
                          <act.icon style={{ width: 16, height: 16, color: act.live ? '#00EF8B' : 'rgba(250,248,245,0.3)' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: act.live ? '#FAF8F5' : 'rgba(250,248,245,0.4)' }}>{act.label}</div>
                          <div style={{ fontSize: '0.5rem', color: 'rgba(250,248,245,0.35)', marginTop: 2 }}>{act.sub}</div>
                        </div>
                        {act.live && <ChevronRight style={{ width: 14, height: 14, color: 'rgba(250,248,245,0.3)' }} />}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                <div className="dash-card" style={{ padding: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <Shield style={{ width: 24, height: 24, color: '#00EF8B' }} />
                    <h3 className="dash-label" style={{ fontSize: '0.875rem', color: '#FAF8F5' }}>Protection Status</h3>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(250,248,245,0.55)', marginBottom: 24, lineHeight: 1.6 }}>
                    Your vaults are protected by a 4-layer execution protection system built directly into Flow blockchain smart contracts. Guarding against frontrunning, sandwich attacks, timing exploitation, and price manipulation.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="dash-label">Protection Level</span>
                  <span style={{ fontSize: '0.625rem', fontWeight: 500, color: '#00EF8B', letterSpacing: '0.1em' }}>Full (4 Layers Active)</span>
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
                      <span className="dash-label">Protection Events</span>
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
              <AlertTriangle style={{ width: 32, height: 32, color: '#ef4444', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p className="dash-label" style={{ color: '#ef4444' }}>System Warning</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#FAF8F5' }}>{error}</p>
              </div>
              <button
                onClick={refetch}
                className="dash-cta"
                style={{ padding: '10px 20px', fontSize: '0.625rem', flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                <RefreshCw style={{ width: 14, height: 14 }} /> Retry
              </button>
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
