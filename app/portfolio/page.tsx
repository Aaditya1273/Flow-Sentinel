'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Activity,
  Shield,
  ChevronRight,
  Info,
  Target
} from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'
import { useFlow } from 'lib/flow'
import { useVaultData } from 'hooks/useVaultData'
import { formatCurrency, formatPercentage } from 'lib/utils'

export default function PortfolioPage() {
  const { user, logIn, isConnected } = useFlow()
  const { vaults, performance, flowBalance, loading, refetch } = useVaultData()
  const [timeframe, setTimeframe] = useState('30d')

  const timeframes = [
    { label: '24H', value: '1d' },
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: '1Y', value: '1y' }
  ]

  if (!isConnected) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(ellipse at center, rgba(0,239,139,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: 64, position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 16px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ width: 80, height: 80, borderRadius: 32, border: '1px solid rgba(0,239,139,0.2)', background: 'rgba(0,239,139,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
              <Shield style={{ width: 40, height: 40, color: '#00EF8B' }} />
            </motion.div>
            <h1 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: '2.25rem', fontWeight: 500, letterSpacing: '-0.02em', color: '#FAF8F5', margin: '0 0 16px', textTransform: 'uppercase' }}>
              Authentication Required
            </h1>
            <p style={{ color: 'rgba(250,248,245,0.55)', marginBottom: 40, lineHeight: 1.6, fontWeight: 500 }}>
              Access your Portfolio Analytics by establishing a secure link with your Flow wallet.
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
            <p className="dash-label" style={{ color: '#00EF8B', animation: 'pulse 2s infinite' }}>Analyzing Assets...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', background: 'radial-gradient(ellipse at center, rgba(0,239,139,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '30%', height: '40%', background: 'radial-gradient(ellipse at center, rgba(55,221,223,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <Navbar />

      <div style={{ paddingTop: 128, paddingBottom: 80, position: 'relative', zIndex: 10 }}>
        <div className="w-container">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dash-page-header">
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 }}>
              <div>
                <h1>Portfolio Analytics</h1>
              </div>

              <div className="dash-filter-bar" style={{ alignSelf: 'flex-start' }}>
                {timeframes.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className={`dash-filter-btn ${timeframe === tf.value ? 'active' : ''}`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Core Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6" style={{ marginBottom: 48 }}>
            <div className="dash-chart" style={{ paddingBottom: 20 }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
                  <div>
                    <div className="dash-label" style={{ marginBottom: 8 }}>Total Managed Assets</div>
                    <div className="dash-value" style={{ fontSize: '3rem', marginBottom: 8 }}>
                      {formatCurrency(performance?.totalBalance || 0)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#00EF8B', justifyContent: 'flex-end' }}>
                      <TrendingUp style={{ width: 16, height: 16 }} />
                      <span className="dash-value" style={{ fontSize: '1.5rem', color: '#00EF8B' }}>
                        {formatPercentage(performance?.totalPnlPercent || 8.42)}
                      </span>
                    </div>
                    <div className="dash-label">Across All Strategies</div>
                  </div>
                </div>

                <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                  {[40, 60, 45, 70, 55, 90, 80, 100, 85, 95, 75, 110].map((h, i) => (
                    <div key={i} style={{ flex: 1, position: 'relative' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 1 }}
                        style={{
                          width: '100%',
                          borderRadius: '4px 4px 0 0',
                          background: i === 11 ? '#00EF8B' : 'rgba(250,248,245,0.06)',
                          transition: 'background 0.3s',
                          minHeight: 4,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="dash-stat" style={{ padding: '28px 32px' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 24, border: '1px solid rgba(55,221,223,0.15)', background: 'rgba(55,221,223,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#37DDDF' }}>
                      <Activity style={{ width: 24, height: 24 }} />
                    </div>
                    <span className="dash-badge dash-badge-cyan">Optimized</span>
                  </div>
                  <div className="dash-label" style={{ marginBottom: 8 }}>Health Index</div>
                  <div className="dash-value" style={{ fontSize: '2rem', marginBottom: 8 }}>98.4 / 100</div>
                  <div className="dash-label">Protocol Integrity Normal</div>
                </div>
              </div>

              <div className="dash-stat" style={{ padding: '28px 32px' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 24, border: '1px solid rgba(0,239,139,0.15)', background: 'rgba(0,239,139,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00EF8B' }}>
                      <Shield style={{ width: 24, height: 24 }} />
                    </div>
                    <span className="dash-badge dash-badge-green">Secured</span>
                  </div>
                  <div className="dash-label" style={{ marginBottom: 8 }}>Asset Exposure</div>
                  <div className="dash-value" style={{ fontSize: '2rem', marginBottom: 8, color: '#00EF8B' }}>Low Risk</div>
                  <div className="dash-label">VRF Jitter Enabled</div>
                </div>
              </div>
            </div>
          </div>

          {/* Allocation Table */}
          <div className="dash-card" style={{ padding: 32, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
              <h3 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: '1.25rem', fontWeight: 500, letterSpacing: '-0.02em', color: '#FAF8F5', margin: 0, textTransform: 'uppercase' }}>
                Strategy Allocation
              </h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Sentinel / Strategy</th>
                    <th>Current Value</th>
                    <th>Total Yield</th>
                    <th>Allocation</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vaults.map((vault) => (
                    <tr key={vault.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 16, border: '1px solid rgba(0,239,139,0.1)', background: 'rgba(0,239,139,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00EF8B', transition: 'all 0.3s' }}>
                            <Target style={{ width: 18, height: 18 }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#FAF8F5', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>{vault.name}</div>
                            <div className="dash-label">{vault.strategy}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="dash-value" style={{ fontSize: '1rem' }}>{formatCurrency(vault.balance)}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00EF8B' }}>
                          <TrendingUp style={{ width: 12, height: 12 }} />
                          <span style={{ fontSize: '0.8125rem', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(vault.pnl || 0)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="dash-progress" style={{ width: 120 }}>
                          <div className="dash-progress-bar" style={{ width: `${(vault.balance / (performance?.totalBalance || 1)) * 100}%` }} />
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.625rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(250,248,245,0.4)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#00EF8B'}
                          onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,248,245,0.4)'}>
                          Details <ChevronRight style={{ width: 12, height: 12 }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {vaults.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '80px 0' }}>
                        <Info style={{ width: 32, height: 32, color: 'rgba(250,248,245,0.2)', margin: '0 auto 16px' }} />
                        <p className="dash-label">No active sentinels detected in portfolio</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
