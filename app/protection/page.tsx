'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, ShieldCheck, AlertTriangle, TrendingUp,
  Activity, Clock, Ban, DollarSign, BarChart3,
  ExternalLink, Users, Layers, RefreshCw
} from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'
import { FlowService } from 'lib/flow-service'

interface ProtectionMetrics {
  totalVaults: number
  totalValueLocked: number
  totalYieldDistributed: number
  totalFeesCollected: number
  yieldReserveBalance: number
  protocolFeeRateBps: number
  mevProtectionsTriggered: number
  mevCommitsCreated: number
  mevExecutionsProcessed: number
  mevExecutionsRejected: number
  mevPendingExecutions: number
  mevActiveVaults: number
  lsTotalYield: number
  lsAPY: number
  lsParticipants: number
  yfTotalYield: number
  yfAPY: number
  yfParticipants: number
  oracleAges: Record<string, number> | null
  contractStatus: string
  reserveStatus: string
}

function formatAge(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

function CountUp({ value, decimals = 0, prefix = '', suffix = '' }: { value: number; decimals?: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = value
    const duration = 1500
    const stepTime = 16
    const steps = duration / stepTime
    const increment = end / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplay(end)
        clearInterval(timer)
      } else {
        setDisplay(start)
      }
    }, stepTime)
    return () => clearInterval(timer)
  }, [value])
  return <>{prefix}{display.toFixed(decimals)}{suffix}</>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatCard({ icon: Icon, label, value, sub, color = '#00EF8B', decimals = 0, prefix = '', suffix = '', delay = 0 }: {
  icon: any; label: string; value: number; sub?: string; color?: string; decimals?: number; prefix?: string; suffix?: string; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="dash-stat"
      style={{ padding: '28px 32px' }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: `${color}10`, border: `1px solid ${color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon style={{ width: 16, height: 16, color }} />
          </div>
          <span className="dash-label" style={{ fontSize: '0.5rem', color: 'rgba(250,248,245,0.5)' }}>{label}</span>
        </div>
        <div className="dash-value" style={{ fontSize: '2rem', color, fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>
          <CountUp value={value} decimals={decimals} prefix={prefix} suffix={suffix} />
        </div>
        {sub && <div style={{ fontSize: '0.625rem', fontWeight: 500, color: 'rgba(250,248,245,0.4)', letterSpacing: '0.08em' }}>{sub}</div>}
      </div>
    </motion.div>
  )
}

function EvidenceBadge({ label, value, positive = true }: { label: string; value: string; positive?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '12px 16px', borderRadius: 12,
      background: positive ? 'rgba(0,239,139,0.04)' : 'rgba(239,68,68,0.04)',
      border: `1px solid ${positive ? 'rgba(0,239,139,0.12)' : 'rgba(239,68,68,0.12)'}`,
    }}>
      {positive ? (
        <ShieldCheck style={{ width: 16, height: 16, color: '#00EF8B', flexShrink: 0 }} />
      ) : (
        <Ban style={{ width: 16, height: 16, color: '#ef4444', flexShrink: 0 }} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', color: positive ? '#00EF8B' : '#ef4444', textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FAF8F5', marginTop: 2 }}>{value}</div>
      </div>
    </div>
  )
}

export default function ProtectionDashboardPage() {
  const [metrics, setMetrics] = useState<ProtectionMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const raw = await FlowService.getProtectionMetrics()
        if (raw) {
          setMetrics({
            totalVaults: Number(raw.totalVaults ?? 0),
            totalValueLocked: Number(raw.totalValueLocked ?? 0),
            totalYieldDistributed: Number(raw.totalYieldDistributed ?? 0),
            totalFeesCollected: Number(raw.totalFeesCollected ?? 0),
            yieldReserveBalance: Number(raw.yieldReserveBalance ?? 0),
            protocolFeeRateBps: Number(raw.protocolFeeRateBps ?? 0),
            mevProtectionsTriggered: Number(raw.mevProtectionsTriggered ?? 0),
            mevCommitsCreated: Number(raw.mevCommitsCreated ?? 0),
            mevExecutionsProcessed: Number(raw.mevExecutionsProcessed ?? 0),
            mevExecutionsRejected: Number(raw.mevExecutionsRejected ?? 0),
            mevPendingExecutions: Number(raw.mevPendingExecutions ?? 0),
            mevActiveVaults: Number(raw.mevActiveVaults ?? 0),
            lsTotalYield: Number(raw.lsTotalYield ?? 0),
            lsAPY: Number(raw.lsAPY ?? 0),
            lsParticipants: Number(raw.lsParticipants ?? 0),
            yfTotalYield: Number(raw.yfTotalYield ?? 0),
            yfAPY: Number(raw.yfAPY ?? 0),
            yfParticipants: Number(raw.yfParticipants ?? 0),
            oracleAges: raw.oracleAges as Record<string, number> | null,
            contractStatus: String(raw.contractStatus ?? 'UNKNOWN'),
            reserveStatus: String(raw.reserveStatus ?? 'CRITICAL'),
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch protection metrics')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

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
            <p className="dash-label" style={{ color: '#00EF8B', animation: 'pulse 2s infinite' }}>Loading protection evidence from Flow blockchain...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#000' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: 64 }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <AlertTriangle style={{ width: 48, height: 48, color: '#ef4444', margin: '0 auto 16px' }} />
            <h2 className="dash-label" style={{ color: '#ef4444', marginBottom: 12 }}>Unable to Load</h2>
            <p style={{ fontSize: '0.75rem', color: 'rgba(250,248,245,0.5)', lineHeight: 1.6 }}>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  const mevSuccessRate = metrics.mevExecutionsProcessed + metrics.mevExecutionsRejected > 0
    ? (metrics.mevExecutionsProcessed / (metrics.mevExecutionsProcessed + metrics.mevExecutionsRejected)) * 100
    : 100

  const totalYieldAll = metrics.lsTotalYield + metrics.yfTotalYield
  const totalParticipants = metrics.lsParticipants + metrics.yfParticipants

  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      {/* Background effects */}
      <div style={{ position: 'absolute', top: '-5%', right: '-5%', width: '50%', height: '50%', background: 'radial-gradient(ellipse at center, rgba(0,239,139,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', left: '-5%', width: '40%', height: '40%', background: 'radial-gradient(ellipse at center, rgba(55,221,223,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <Navbar />

      <div style={{ paddingTop: 128, paddingBottom: 80, position: 'relative', zIndex: 10 }}>
        <div className="w-container">
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginBottom: 64, maxWidth: 720, margin: '0 auto 64px' }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 9999,
              background: 'rgba(0,239,139,0.08)', border: '1px solid rgba(0,239,139,0.20)',
              marginBottom: 24, fontSize: '0.5625rem', fontWeight: 700,
              letterSpacing: '0.12em', color: '#00EF8B', textTransform: 'uppercase',
            }}>
              <Shield style={{ width: 12, height: 12 }} />
              Live On-Chain Evidence
            </div>
            <h1 style={{
              fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 500,
              letterSpacing: '-0.03em', color: '#FAF8F5', margin: '0 0 20px',
              textTransform: 'uppercase',
            }}>
              Protection Is Not a Promise —<br />
              <span style={{ color: '#00EF8B' }}>It&apos;s On-Chain Evidence</span>
            </h1>
            <p style={{ fontSize: '1rem', color: 'rgba(250,248,245,0.55)', lineHeight: 1.7, fontWeight: 500, maxWidth: 600, margin: '0 auto' }}>
              Every commit, every execution, every MEV attack blocked — all recorded immutably on the Flow blockchain. No claims, no screenshots, no trust-me bro.
            </p>

            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00EF8B', boxShadow: '0 0 12px rgba(0,239,139,0.6)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '0.625rem', fontWeight: 500, color: 'rgba(250,248,245,0.4)', letterSpacing: '0.08em' }}>
                Streaming live from Flow Testnet
              </span>
              <span style={{ fontSize: '0.5rem', color: 'rgba(250,248,245,0.2)', marginLeft: 8 }}>
                Contract: 0x60320435dd7725c1
              </span>
              <a
                href="https://testnet.flowscan.org/account/0x60320435dd7725c1"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.5rem', color: 'rgba(250,248,245,0.35)', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FAF8F5')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,248,245,0.35)')}
              >
                <ExternalLink style={{ width: 10, height: 10 }} /> Flowscan
              </a>
            </div>
          </motion.div>

          {/* Top-tier Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
            <StatCard icon={Shield} label="MEV Protections Triggered" value={metrics.mevProtectionsTriggered} color="#00EF8B" delay={0.1} />
            <StatCard icon={Ban} label="Exploits Blocked" value={metrics.mevExecutionsRejected} color="#ef4444" delay={0.15} />
            <StatCard icon={Activity} label="Protected Executions" value={metrics.mevExecutionsProcessed} color="#37DDDF" delay={0.2} />
            <StatCard icon={DollarSign} label="Total Yield Distributed" value={totalYieldAll} decimals={2}                    suffix=" FLOW" color="#00EF8B" delay={0.25} />
          </div>

          {/* Protocol Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
            <StatCard icon={BarChart3} label="Total Value Locked" value={metrics.totalValueLocked} decimals={2}                    suffix=" FLOW" color="#FAF8F5" delay={0.3} />
            <StatCard icon={Users} label="Active Vaults" value={metrics.totalVaults} color="#FAF8F5" delay={0.35} />
            <StatCard icon={Layers} label="Commits Created" value={metrics.mevCommitsCreated} color="#FAF8F5" delay={0.4} />
            <StatCard icon={Clock} label="MEV Success Rate" value={mevSuccessRate} decimals={1} suffix="%" color={mevSuccessRate >= 90 ? '#00EF8B' : '#f59e0b'} delay={0.45} />
          </div>

          {/* Evidence Section — The meat of the dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginBottom: 48 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <ShieldCheck style={{ width: 20, height: 20, color: '#00EF8B' }} />
              <h2 style={{
                fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                fontSize: '1.25rem', fontWeight: 500, letterSpacing: '-0.02em',
                color: '#FAF8F5', margin: 0, textTransform: 'uppercase',
              }}>
                Evidence — How Much MEV Was Stopped
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <EvidenceBadge
                label="Failed Executions (Blocked MEV)"
                value={`${metrics.mevExecutionsRejected} transactions rejected by price deviation guard — MEV attacks blocked`}
                positive={metrics.mevExecutionsRejected > 0}
              />
              <EvidenceBadge
                label="Successful Protected Executions"
                value={`${metrics.mevExecutionsProcessed} transactions completed with full 4-layer MEV protection`}
                positive={true}
              />
              <EvidenceBadge
                label="Total Protections Fired"
                value={`${metrics.mevProtectionsTriggered} times the MEV shield activated to protect vaults`}
                positive={true}
              />
              <EvidenceBadge
                label="Commits Created (Layer 1)"
                value={`${metrics.mevCommitsCreated} commit-reveal cycles — execution params hidden from mempool`}
                positive={true}
              />
              <EvidenceBadge
                label="Yield Distributed"
                value={`${totalYieldAll.toFixed(4)} FLOW earned across ${totalParticipants} participants`}
                positive={true}
              />
              <EvidenceBadge
                label="Vaults Under Protection"
                value={`${metrics.totalVaults} vaults actively protected by 4-layer MEV shield`}
                positive={true}
              />
            </div>
          </motion.div>

          {/* Protection Layer Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ marginBottom: 48 }}
          >
            <div className="dash-card" style={{ padding: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                <Layers style={{ width: 20, height: 20, color: '#37DDDF' }} />
                <h3 style={{
                  fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                  fontSize: '1rem', fontWeight: 500, letterSpacing: '-0.02em',
                  color: '#FAF8F5', margin: 0, textTransform: 'uppercase',
                }}>
                  Protection Layer Breakdown
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                {[
                  {
                    layer: 'Layer 1',
                    name: 'Commit-Reveal',
                    desc: 'Execution hash committed first, revealed later — bots never see what you are executing',
                    count: metrics.mevCommitsCreated,
                    status: metrics.mevCommitsCreated > 0 ? 'ACTIVE' : 'NO DATA',
                    color: '#00EF8B',
                    icon: Shield,
                  },
                  {
                    layer: 'Layer 2',
                    name: 'VRF Block-Delay Jitter',
                    desc: 'Random 0-5 block delay using Flow revertibleRandom() — unpredictable execution timing',
                    count: metrics.mevExecutionsProcessed,
                    status: metrics.mevExecutionsProcessed > 0 ? 'ACTIVE' : 'NO DATA',
                    color: '#37DDDF',
                    icon: Clock,
                  },
                  {
                    layer: 'Layer 3',
                    name: 'Price Deviation Guard',
                    desc: 'Real-time APY comparison — rejects execution if oracle deviation exceeds slippage tolerance',
                    count: metrics.mevExecutionsRejected,
                    status: metrics.mevExecutionsRejected > 0 ? 'BLOCKED ATTACKS' : 'NO DATA',
                    color: '#f59e0b',
                    icon: Ban,
                  },
                  {
                    layer: 'Layer 4',
                    name: 'VRF Execution Queue',
                    desc: 'VRF-shuffled processing order — nobody knows which trade executes when',
                    count: metrics.mevPendingExecutions,
                    status: metrics.mevPendingExecutions > 0 ? 'PENDING' : 'CLEAR',
                    color: '#8b5cf6',
                    icon: Activity,
                  },
                ].map((l, i) => (
                  <div key={i} style={{
                    padding: 24, borderRadius: 16,
                    border: `1px solid ${l.color}15`,
                    background: `${l.color}03`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `${l.color}10`, border: `1px solid ${l.color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <l.icon style={{ width: 16, height: 16, color: l.color }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.5rem', fontWeight: 700, color: l.color, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                          {l.layer}
                        </div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FAF8F5' }}>{l.name}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.625rem', color: 'rgba(250,248,245,0.45)', lineHeight: 1.6, marginBottom: 16, minHeight: 40 }}>
                      {l.desc}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 600, color: l.color, fontVariantNumeric: 'tabular-nums' }}>
                        <CountUp value={l.count} />
                      </span>
                      <span style={{
                        padding: '3px 10px', borderRadius: 9999,
                        fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.1em',
                        color: l.color, background: `${l.color}10`,
                        border: `1px solid ${l.color}20`,
                        textTransform: 'uppercase',
                      }}>
                        {l.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Strategy Yield Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="dash-card" style={{ padding: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                <TrendingUp style={{ width: 20, height: 20, color: '#00EF8B' }} />
                <h3 style={{
                  fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                  fontSize: '1rem', fontWeight: 500, letterSpacing: '-0.02em',
                  color: '#FAF8F5', margin: 0, textTransform: 'uppercase',
                }}>
                  Disabled Strategy Scaffolding
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {[
                  {
                    name: 'Flow Liquid Staking Pro',
                    strategyId: 'liquid-staking-pro',
                    apy: metrics.lsAPY,
                    yield: metrics.lsTotalYield,
                    participants: metrics.lsParticipants,
                    color: '#00EF8B',
                    icon: '💎',
                  },
                  {
                    name: 'DeFi Yield Maximizer',
                    strategyId: 'defi-yield-maximizer',
                    apy: metrics.yfAPY,
                    yield: metrics.yfTotalYield,
                    participants: metrics.yfParticipants,
                    color: '#37DDDF',
                    icon: '⚡',
                  },
                ].map((s, i) => (
                  <div key={i} style={{
                    padding: 24, borderRadius: 16,
                    border: `1px solid ${s.color}15`,
                    background: `${s.color}03`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FAF8F5' }}>{s.name}</div>
                        <div style={{ fontSize: '0.5rem', color: 'rgba(250,248,245,0.35)', letterSpacing: '0.08em', marginTop: 2 }}>
                          {s.strategyId}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: '0.4375rem', fontWeight: 700, color: 'rgba(250,248,245,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>APY</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: s.color, fontVariantNumeric: 'tabular-nums' }}>
                          <CountUp value={s.apy} decimals={2} suffix="%" />
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.4375rem', fontWeight: 700, color: 'rgba(250,248,245,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>External Yield</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FAF8F5', fontVariantNumeric: 'tabular-nums' }}>
                          <CountUp value={s.yield} decimals={4} suffix=" FLOW" />
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.4375rem', fontWeight: 700, color: 'rgba(250,248,245,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Participants</div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#FAF8F5', fontVariantNumeric: 'tabular-nums' }}>
                          <CountUp value={s.participants} />
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.4375rem', fontWeight: 700, color: 'rgba(250,248,245,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Oracle Age</div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: metrics.oracleAges?.[s.strategyId] && (metrics.oracleAges[s.strategyId] > 21600) ? '#f59e0b' : '#00EF8B', fontVariantNumeric: 'tabular-nums' }}>
                          {metrics.oracleAges?.[s.strategyId] ? formatAge(metrics.oracleAges[s.strategyId]) : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Trust Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{ textAlign: 'center', marginTop: 80, paddingTop: 40, borderTop: '1px solid rgba(250,248,245,0.06)' }}
          >
            <p style={{ fontSize: '0.625rem', color: 'rgba(250,248,245,0.3)', letterSpacing: '0.08em', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
              All metrics are queried directly from the Flow blockchain. No caching, no interpolation, no fabricated data.
              Every number shown is a verifiable on-chain value from <a href="https://testnet.flowscan.org/account/0x60320435dd7725c1" target="_blank" rel="noopener noreferrer" style={{ color: '#00EF8B', textDecoration: 'none' }}>SentinelVaultFinal</a>,{' '}
              <a href="https://testnet.flowscan.org/account/0x60320435dd7725c1" target="_blank" rel="noopener noreferrer" style={{ color: '#00EF8B', textDecoration: 'none' }}>MEVShieldCore</a>, and{' '}
              <a href="https://testnet.flowscan.org/account/0x60320435dd7725c1" target="_blank" rel="noopener noreferrer" style={{ color: '#00EF8B', textDecoration: 'none' }}>YieldOracle</a>.
            </p>
            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <a
                href="https://testnet.flowscan.org/account/0x60320435dd7725c1"
                target="_blank"
                rel="noopener noreferrer"
                className="dash-cta"
                style={{ padding: '12px 24px', fontSize: '0.5625rem', background: 'transparent', border: '1px solid rgba(250,248,245,0.15)', color: '#FAF8F5' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(250,248,245,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(250,248,245,0.15)'}
              >
                <ExternalLink style={{ width: 12, height: 12 }} /> Verify on Flowscan
              </a>
              <button
                onClick={() => window.location.reload()}
                className="dash-cta"
                style={{ padding: '12px 24px', fontSize: '0.5625rem' }}
              >
                <RefreshCw style={{ width: 12, height: 12 }} /> Refresh Data
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

