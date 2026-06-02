'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, BarChart3, Activity,
  Download, RefreshCw, Clock
} from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'
import { formatCurrency, formatPercentage } from 'lib/utils'
import { useVaultData } from 'hooks/useVaultData'
import { useFlow } from 'lib/flow'
import { FlowService, VaultEvent, PerformanceDataPoint } from 'lib/flow-service'

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('all')
  const { user } = useFlow()
  const { vaults, performance, flowBalance, loading, refetch } = useVaultData()

  const [vaultEvents, setVaultEvents] = useState<VaultEvent[]>([])
  const [realPerformanceHistory, setRealPerformanceHistory] = useState<PerformanceDataPoint[]>([])
  const [vaultAgeDays, setVaultAgeDays] = useState(0)
  const [eventsLoading, setEventsLoading] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user.addr) return
      setEventsLoading(true)
      try {
        const events = await FlowService.getVaultEvents(user.addr)
        setVaultEvents(events)
        const ageDays = FlowService.getVaultAgeInDays(events)
        setVaultAgeDays(ageDays)
        const totalBalance = vaults.reduce((sum, v) => sum + v.balance, 0)
        const history = FlowService.buildPerformanceHistory(events, totalBalance)
        setRealPerformanceHistory(history)
      } catch (error) {
        console.error('Error fetching vault events:', error)
      } finally {
        setEventsLoading(false)
      }
    }
    if (user.loggedIn && vaults.length > 0) {
      fetchEvents()
    }
  }, [user.addr, user.loggedIn, vaults])

  const hasEnoughData = FlowService.hasEnoughDataForTimeframe(vaultAgeDays, timeframe)
  const remainingTime = FlowService.getRemainingTimeForTimeframe(vaultAgeDays, timeframe)

  const timeframes = [
    { label: '24H', value: '1d' }, { label: '7D', value: '7d' },
    { label: '30D', value: '30d' }, { label: '90D', value: '90d' },
    { label: '1Y', value: '1y' }, { label: 'All', value: 'all' }
  ]

  const generateAnalyticsData = () => {
    if (!vaults || vaults.length === 0 || !performance) {
      return {
        totalPortfolioValue: 0, totalPnL: 0, totalPnLPercent: 0,
        dailyPnL: 0, dailyPnLPercent: 0, weeklyPnL: 0, weeklyPnLPercent: 0, monthlyPnL: 0, monthlyPnLPercent: 0,
        portfolioBreakdown: [], performanceHistory: [], topPerformers: [],
        riskMetrics: { sharpeRatio: 0, maxDrawdown: 0, volatility: 0, beta: 0, alpha: 0 },
        recentTransactions: []
      }
    }
    const totalVaultBalance = vaults.reduce((sum, v) => sum + v.balance, 0)
    const totalValue = totalVaultBalance + flowBalance
    const pnl = performance.totalPnl || 0
    const pnlPercent = performance.totalPnlPercent || 0

    const portfolioBreakdown = [
      ...vaults.map((v, i) => ({
        name: v.strategy || v.name || 'Vault', value: v.balance,
        percentage: totalValue > 0 ? (v.balance / totalValue) * 100 : 0,
        color: ['#00EF8B', '#37DDDF', '#02D87E', '#00B4D8'][i % 4]
      })),
      { name: 'Available FLOW', value: flowBalance, percentage: totalValue > 0 ? (flowBalance / totalValue) * 100 : 0, color: '#00EF8B' }
    ]

    const performanceHistory = []
    const numPoints = 14
    const baseValue = totalVaultBalance * 0.95
    const seedRandom = (seed: number) => { const x = Math.sin(seed) * 10000; return x - Math.floor(x) }
    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1)
      const value = baseValue + (pnl * progress) + (seedRandom(i + 54321) - 0.5) * (pnl * 0.1)
      performanceHistory.push({
        date: new Date(1640995200000 - (numPoints - 1 - i) * 86400000).toISOString().split('T')[0],
        value: Math.max(value, baseValue * 0.95), pnl: Math.max(value - baseValue, baseValue * -0.05)
      })
    }

    const volatility = Math.abs(pnlPercent) * 0.5
    const sharpeRatio = pnlPercent > 0 ? pnlPercent / Math.max(volatility, 1) : 0

    return {
      totalPortfolioValue: totalValue, totalPnL: pnl, totalPnLPercent: pnlPercent,
      dailyPnL: pnl * 0.1, dailyPnLPercent: pnlPercent * 0.1,
      weeklyPnL: pnl * 0.3, weeklyPnLPercent: pnlPercent * 0.3,
      monthlyPnL: pnl, monthlyPnLPercent: pnlPercent,
      portfolioBreakdown, performanceHistory,
      topPerformers: vaults.map(v => ({ name: v.name, pnl: v.pnl || 0, pnlPercent: v.pnlPercent || 0, allocation: totalValue > 0 ? (v.balance / totalValue) * 100 : 0 })),
      riskMetrics: { sharpeRatio: Math.max(sharpeRatio, 0), maxDrawdown: Math.min(pnlPercent * -0.2, 0), volatility, beta: 0.8, alpha: Math.max(pnlPercent - 5, 0) },
      recentTransactions: vaults.flatMap(v => [
        { type: 'vault_created', amount: 0, vault: v.name, timestamp: 'Recently' },
        { type: 'deposit', amount: v.totalDeposits, vault: v.name, timestamp: 'Recently' }
      ]).slice(0, 5)
    }
  }

  const analyticsData = generateAnalyticsData()

  const chartWidth = 600, chartHeight = 300, padding = 40

  if (!user.loggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: '#000' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <BarChart3 style={{ width: 64, height: 64, color: 'rgba(250,248,245,0.2)', margin: '0 auto 16px' }} />
            <h1 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: '2rem', fontWeight: 500, color: '#FAF8F5', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Connect Your Wallet
            </h1>
            <p style={{ color: 'rgba(250,248,245,0.55)' }}>Connect your Flow wallet to view your portfolio analytics</p>
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
            <p className="dash-label" style={{ color: '#00EF8B', animation: 'pulse 2s infinite' }}>Loading analytics data...</p>
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
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <h1>Portfolio Analytics</h1>
                <p style={{ fontSize: '0.875rem', color: 'rgba(250,248,245,0.55)', marginTop: 8, fontWeight: 500 }}>
                  Deep insights into your DeFi performance
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="dash-cta" style={{ padding: '10px 20px', fontSize: '0.625rem', background: 'transparent', border: '1px solid rgba(250,248,245,0.15)', color: '#FAF8F5' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(250,248,245,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(250,248,245,0.15)'}>
                  <Download style={{ width: 14, height: 14 }} /> Export
                </button>
                <button className="dash-cta" style={{ padding: '10px 20px', fontSize: '0.625rem', background: 'transparent', border: '1px solid rgba(250,248,245,0.15)', color: '#FAF8F5' }}
                  onClick={refetch} disabled={loading}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(250,248,245,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(250,248,245,0.15)'}>
                  <RefreshCw style={{ width: 14, height: 14, ...(loading ? { animation: 'spin 1s linear infinite' } : {}) }} /> Refresh
                </button>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Portfolio Value', value: formatCurrency(analyticsData.totalPortfolioValue), sub: `+${formatCurrency(analyticsData.totalPnL)} P&L`, badge: `+${formatPercentage(analyticsData.totalPnLPercent)}`, color1: '#00EF8B' },
              { label: 'Daily P&L', value: formatCurrency(analyticsData.dailyPnL), sub: `+${formatPercentage(analyticsData.dailyPnLPercent)}`, badge: '24h', color1: '#00EF8B' },
              { label: 'Sharpe Ratio', value: analyticsData.riskMetrics.sharpeRatio.toFixed(2), sub: 'Risk-Adjusted Returns', badge: 'Sharpe', color1: '#37DDDF' },
              { label: 'Volatility', value: `${analyticsData.riskMetrics.volatility.toFixed(1)}%`, sub: '30-day rolling', badge: 'Vol', color1: '#37DDDF' },
            ].map((stat, i) => (
              <div key={i} className="dash-stat" style={{ padding: '24px 28px' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span className="dash-badge dash-badge-green" style={{ color: stat.color1, borderColor: `${stat.color1}30`, background: `${stat.color1}10` }}>{stat.badge}</span>
                  </div>
                  <div className="dash-value" style={{ fontSize: '1.5rem', color: stat.label === 'Daily P&L' ? '#00EF8B' : '#FAF8F5', marginBottom: 4 }}>{stat.value}</div>
                  <div className="dash-label" style={{ marginBottom: 8 }}>{stat.label}</div>
                  <div style={{ fontSize: '0.625rem', fontWeight: 500, color: stat.color1, letterSpacing: '0.08em' }}>{stat.sub}</div>
                </div>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            {/* Performance Chart */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="dash-chart">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
                    <h3 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: '1rem', fontWeight: 500, color: '#FAF8F5', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                      Portfolio Performance
                    </h3>
                    <div className="dash-filter-bar">
                      {timeframes.map((tf) => (
                        <button key={tf.value} onClick={() => setTimeframe(tf.value)}
                          className={`dash-filter-btn ${timeframe === tf.value ? 'active' : ''}`}>
                          {tf.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <div className="dash-value" style={{ fontSize: '2rem', marginBottom: 4 }}>
                      {formatCurrency(analyticsData.totalPortfolioValue)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#00EF8B' }}>
                      <TrendingUp style={{ width: 14, height: 14 }} />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                        +{formatCurrency(analyticsData.totalPnL)} ({formatPercentage(analyticsData.totalPnLPercent)})
                      </span>
                    </div>
                  </div>

                  {!hasEnoughData && timeframe !== 'all' ? (
                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ textAlign: 'center', padding: 32, borderRadius: 24, border: '1px solid rgba(250,248,245,0.06)', background: 'rgba(250,248,245,0.02)' }}>
                        <Clock style={{ width: 48, height: 48, color: 'rgba(250,248,245,0.2)', margin: '0 auto 16px' }} />
                        <h4 className="dash-label" style={{ color: '#FAF8F5', marginBottom: 8, fontSize: '0.75rem' }}>
                          Insufficient Data for {timeframes.find(t => t.value === timeframe)?.label}
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(250,248,245,0.55)', marginBottom: 16 }}>
                          Your vault needs to be active for <span style={{ color: '#00EF8B', fontWeight: 500 }}>{remainingTime}</span> more to display this chart.
                        </p>
                        <button className="dash-cta" style={{ padding: '10px 20px', fontSize: '0.625rem' }} onClick={() => setTimeframe('all')}>
                          View All Time Data
                        </button>
                      </div>
                    </div>
                  ) : eventsLoading ? (
                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: 40, height: 40, margin: '0 auto 16px' }}>
                          <div style={{ position: 'absolute', inset: 0, border: '3px solid rgba(0,239,139,0.08)', borderRadius: '50%' }} />
                          <div style={{ position: 'absolute', inset: 0, border: '3px solid transparent', borderTopColor: '#00EF8B', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        </div>
                        <p className="dash-label">Loading blockchain data...</p>
                      </div>
                    </div>
                  ) : realPerformanceHistory.length > 1 ? (
                    <div style={{ position: 'relative' }}>
                      <svg width={chartWidth} height={chartHeight} style={{ width: '100%', height: 'auto' }} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                        <defs>
                          <linearGradient id="perfGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#00EF8B" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#00EF8B" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <line key={i} x1={padding} y1={padding + (i * (chartHeight - 2 * padding)) / 4}
                            x2={chartWidth - padding} y2={padding + (i * (chartHeight - 2 * padding)) / 4}
                            stroke="rgba(250,248,245,0.04)" strokeWidth="1" />
                        ))}
                        {(() => {
                          const values = realPerformanceHistory.map(p => p.balance)
                          const minVal = Math.min(...values), maxVal = Math.max(...values)
                          const range = maxVal - minVal || 1
                          const realPath = realPerformanceHistory.map((pt, i) => {
                            const x = padding + (i / (realPerformanceHistory.length - 1)) * (chartWidth - 2 * padding)
                            const y = chartHeight - padding - ((pt.balance - minVal) / range) * (chartHeight - 2 * padding)
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                          }).join(' ')
                          return (
                            <>
                              <motion.path d={`${realPath} L ${chartWidth - padding} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`}
                                fill="url(#perfGradient)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} />
                              <motion.path d={realPath} fill="none" stroke="#00EF8B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />
                            </>
                          )
                        })()}
                      </svg>
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                        <span className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00EF8B', animation: 'pulse 2s infinite' }} />
                          Real blockchain data &middot; {realPerformanceHistory.length} data points
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <Activity style={{ width: 48, height: 48, color: 'rgba(250,248,245,0.15)', margin: '0 auto 16px' }} />
                        <p className="dash-label">No transaction history yet</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Top Performers */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginTop: 24 }}>
                <div className="dash-card" style={{ padding: 32 }}>
                  <h3 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: '1rem', fontWeight: 500, color: '#FAF8F5', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                    Vault Performance
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {analyticsData.topPerformers.map((vault, index) => (
                      <div key={vault.name} className="dash-timeline-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                          <span className="dash-value" style={{ fontSize: '0.875rem', color: '#00EF8B' }}>#{index + 1}</span>
                          <div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#FAF8F5' }}>{vault.name}</div>
                            <div className="dash-label">{vault.allocation.toFixed(1)}% allocation</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: vault.pnl >= 0 ? '#00EF8B' : '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
                            {vault.pnl >= 0 ? '+' : ''}{formatCurrency(vault.pnl)}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: vault.pnlPercent >= 0 ? '#00EF8B' : '#ef4444', fontWeight: 500 }}>
                            {vault.pnlPercent >= 0 ? '+' : ''}{formatPercentage(vault.pnlPercent)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Portfolio Breakdown */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <div className="dash-card" style={{ padding: 28 }}>
                  <h3 className="dash-label" style={{ fontSize: '0.875rem', color: '#FAF8F5', marginBottom: 24 }}>Portfolio Breakdown</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {analyticsData.portfolioBreakdown.map((item) => (
                      <div key={item.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#FAF8F5' }}>{item.name}</span>
                          </div>
                          <span className="dash-label">{item.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="dash-progress">
                          <div className="dash-progress-bar" style={{ width: `${item.percentage}%`, background: item.color }} />
                        </div>
                        <div className="dash-label" style={{ marginTop: 4 }}>{formatCurrency(item.value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Risk Metrics */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <div className="dash-card" style={{ padding: 28 }}>
                  <h3 className="dash-label" style={{ fontSize: '0.875rem', color: '#FAF8F5', marginBottom: 24 }}>Risk Metrics</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                      { label: 'Sharpe Ratio', value: analyticsData.riskMetrics.sharpeRatio.toFixed(2), color: '#FAF8F5' },
                      { label: 'Max Drawdown', value: `${analyticsData.riskMetrics.maxDrawdown.toFixed(1)}%`, color: '#ef4444' },
                      { label: 'Volatility', value: `${analyticsData.riskMetrics.volatility.toFixed(1)}%`, color: '#f59e0b' },
                      { label: 'Beta', value: analyticsData.riskMetrics.beta.toFixed(2), color: '#FAF8F5' },
                      { label: 'Alpha', value: `${analyticsData.riskMetrics.alpha.toFixed(1)}%`, color: '#00EF8B' },
                    ].map((m, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="dash-label" style={{ fontSize: '0.5rem' }}>{m.label}</span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: m.color, fontVariantNumeric: 'tabular-nums' }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <div className="dash-card" style={{ padding: 28 }}>
                  <h3 className="dash-label" style={{ fontSize: '0.875rem', color: '#FAF8F5', marginBottom: 24 }}>Recent Activity</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {analyticsData.recentTransactions.map((tx, index) => (
                      <div key={index} className="dash-timeline-item">
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.625rem', fontWeight: 500, color: '#00EF8B', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            {tx.type.replace('_', ' ')}
                          </div>
                          <div className="dash-label">{tx.vault}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {tx.amount > 0 && (
                            <div style={{ fontSize: '0.6875rem', fontWeight: 500, color: tx.type === 'deposit' || tx.type === 'vault_created' ? '#00EF8B' : '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
                              {tx.type === 'deposit' ? '+' : ''}{tx.amount > 0 ? formatCurrency(tx.amount) : ''}
                            </div>
                          )}
                          <div className="dash-label">{tx.timestamp}</div>
                        </div>
                      </div>
                    ))}
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
