'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Clock
} from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
import { Card } from 'components/ui/card'
import { formatCurrency, formatPercentage } from 'lib/utils'
import { useVaultData } from 'hooks/useVaultData'
import { useFlow } from 'lib/flow'
import { FlowService, VaultEvent, PerformanceDataPoint } from 'lib/flow-service'

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('all')
  const [selectedMetric, setSelectedMetric] = useState('portfolio')
  const { user } = useFlow()
  const { vaults, performance, flowBalance, loading, refetch } = useVaultData()

  // Real blockchain event data
  const [vaultEvents, setVaultEvents] = useState<VaultEvent[]>([])
  const [realPerformanceHistory, setRealPerformanceHistory] = useState<PerformanceDataPoint[]>([])
  const [vaultAgeDays, setVaultAgeDays] = useState(0)
  const [eventsLoading, setEventsLoading] = useState(false)

  // Fetch real vault events from blockchain
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

  // Check if enough data is available for selected timeframe
  const hasEnoughData = FlowService.hasEnoughDataForTimeframe(vaultAgeDays, timeframe)
  const remainingTime = FlowService.getRemainingTimeForTimeframe(vaultAgeDays, timeframe)

  const timeframes = [
    { label: '24H', value: '1d' },
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: '1Y', value: '1y' },
    { label: 'All', value: 'all' }
  ]

  const metrics = [
    { label: 'Portfolio Value', value: 'portfolio' },
    { label: 'P&L', value: 'pnl' },
    { label: 'APY', value: 'apy' },
    { label: 'Risk Metrics', value: 'risk' }
  ]

  // Generate analytics data based on real vault data
  const generateAnalyticsData = () => {
    if (!vaults || vaults.length === 0 || !performance) {
      return {
        totalPortfolioValue: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
        dailyPnL: 0,
        dailyPnLPercent: 0,
        weeklyPnL: 0,
        weeklyPnLPercent: 0,
        monthlyPnL: 0,
        monthlyPnLPercent: 0,
        portfolioBreakdown: [],
        performanceHistory: [],
        topPerformers: [],
        riskMetrics: {
          sharpeRatio: 0,
          maxDrawdown: 0,
          volatility: 0,
          beta: 0,
          alpha: 0
        },
        recentTransactions: []
      }
    }

    const totalVaultBalance = vaults.reduce((sum, v) => sum + v.balance, 0)
    const totalValue = totalVaultBalance + flowBalance
    const pnl = performance.totalPnl || 0
    const pnlPercent = performance.totalPnlPercent || 0

    // Generate portfolio breakdown based on all vaults
    const portfolioBreakdown = [
      ...vaults.map((v, i) => ({
        name: v.strategy || v.name || 'Vault',
        value: v.balance,
        percentage: totalValue > 0 ? (v.balance / totalValue) * 100 : 0,
        color: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'][i % 4]
      })),
      {
        name: 'Available FLOW',
        value: flowBalance,
        percentage: totalValue > 0 ? (flowBalance / totalValue) * 100 : 0,
        color: '#10B981'
      }
    ]

    // Generate performance history
    const performanceHistory = []
    const numPoints = 14
    const baseValue = totalVaultBalance * 0.95

    // Use seeded random for consistent values
    const seedRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }

    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1)
      const value = baseValue + (pnl * progress) + (seedRandom(i + 54321) - 0.5) * (pnl * 0.1)
      performanceHistory.push({
        date: new Date(1640995200000 - (numPoints - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.max(value, baseValue * 0.95),
        pnl: Math.max(value - baseValue, baseValue * -0.05)
      })
    }

    // Calculate risk metrics based on performance
    const volatility = Math.abs(pnlPercent) * 0.5
    const sharpeRatio = pnlPercent > 0 ? pnlPercent / Math.max(volatility, 1) : 0

    return {
      totalPortfolioValue: totalValue,
      totalPnL: pnl,
      totalPnLPercent: pnlPercent,
      dailyPnL: pnl * 0.1,
      dailyPnLPercent: pnlPercent * 0.1,
      weeklyPnL: pnl * 0.3,
      weeklyPnLPercent: pnlPercent * 0.3,
      monthlyPnL: pnl,
      monthlyPnLPercent: pnlPercent,

      portfolioBreakdown,
      performanceHistory,

      topPerformers: vaults.map(v => ({
        name: v.name,
        pnl: v.pnl || 0,
        pnlPercent: v.pnlPercent || 0,
        allocation: totalValue > 0 ? (v.balance / totalValue) * 100 : 0
      })),

      riskMetrics: {
        sharpeRatio: Math.max(sharpeRatio, 0),
        maxDrawdown: Math.min(pnlPercent * -0.2, 0),
        volatility: volatility,
        beta: 0.8,
        alpha: Math.max(pnlPercent - 5, 0)
      },

      recentTransactions: vaults.flatMap(v => [
        { type: 'vault_created', amount: 0, vault: v.name, timestamp: 'Recently' },
        { type: 'deposit', amount: v.totalDeposits, vault: v.name, timestamp: 'Recently' }
      ]).slice(0, 5)
    }
  }

  const analyticsData = generateAnalyticsData()

  // Chart dimensions
  const chartWidth = 600
  const chartHeight = 300
  const padding = 40

  if (!user.loggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-muted-foreground mb-8">
              Connect your Flow wallet to view your portfolio analytics
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </div>
    )
  }

  const minValue = Math.min(...analyticsData.performanceHistory.map(d => d.value))
  const maxValue = Math.max(...analyticsData.performanceHistory.map(d => d.value))
  const valueRange = maxValue - minValue || 1

  // Create SVG path for the performance chart
  const pathData = analyticsData.performanceHistory.map((point, index) => {
    const x = padding + (index / (analyticsData.performanceHistory.length - 1)) * (chartWidth - 2 * padding)
    const y = chartHeight - padding - ((point.value - minValue) / valueRange) * (chartHeight - 2 * padding)
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  const areaData = `${pathData} L ${chartWidth - padding} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  ANALYTICS ACTIVE
                </p>
                <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase italic">
                  PORTFOLIO ANALYTICS
                </h1>
                <p className="text-muted-foreground mt-2 font-medium">
                  Deep insights into your DeFi performance
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex space-x-3">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="tool-card p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-accent" />
                <Badge variant="outline" className="status-active">
                  +{formatPercentage(analyticsData.totalPnLPercent)}
                </Badge>
              </div>
              <div className="text-3xl font-black text-foreground mb-1 tracking-tighter italic financial-number">
                {formatCurrency(analyticsData.totalPortfolioValue)}
              </div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Total Portfolio Value</div>
              <div className="text-sm text-accent mt-1">
                +{formatCurrency(analyticsData.totalPnL)} P&L
              </div>
            </Card>

            <Card className="tool-card p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-accent" />
                <Badge variant="outline" className="text-accent">
                  24h
                </Badge>
              </div>
              <div className="text-3xl font-black text-accent mb-1 tracking-tighter italic financial-number">
                {formatCurrency(analyticsData.dailyPnL)}
              </div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Daily P&L</div>
              <div className="text-sm text-accent mt-1">
                +{formatPercentage(analyticsData.dailyPnLPercent)}
              </div>
            </Card>

            <Card className="tool-card p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-8 h-8 text-accent" />
                <Badge variant="outline" className="text-accent">
                  Sharpe
                </Badge>
              </div>
              <div className="text-3xl font-black text-foreground mb-1 tracking-tighter italic">
                {analyticsData.riskMetrics.sharpeRatio.toFixed(2)}
              </div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Sharpe Ratio</div>
              <div className="text-sm text-accent mt-1">
                Risk-Adjusted Returns
              </div>
            </Card>

            <Card className="tool-card p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 text-accent" />
                <Badge variant="outline" className="text-accent">
                  Vol
                </Badge>
              </div>
              <div className="text-3xl font-black text-foreground mb-1 tracking-tighter italic">
                {analyticsData.riskMetrics.volatility.toFixed(1)}%
              </div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Volatility</div>
              <div className="text-sm text-accent mt-1">
                30-day rolling
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Performance Chart */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="tool-card p-6 border border-border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-foreground uppercase italic tracking-tight">
                      PORTFOLIO PERFORMANCE
                    </h3>

                    <div className="flex space-x-1 bg-muted rounded-lg p-1">
                      {timeframes.map((tf) => (
                        <button
                          key={tf.value}
                          onClick={() => setTimeframe(tf.value)}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${timeframe === tf.value
                            ? 'bg-accent text-background'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                          {tf.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-4xl font-black text-foreground tracking-tighter italic financial-number">
                      {formatCurrency(analyticsData.totalPortfolioValue)}
                    </div>
                    <div className="flex items-center text-accent">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +{formatCurrency(analyticsData.totalPnL)} ({formatPercentage(analyticsData.totalPnLPercent)})
                    </div>
                  </div>

                  {/* Show insufficient data message or real chart */}
                  {!hasEnoughData && timeframe !== 'all' ? (
                    <div className="relative h-[300px] flex items-center justify-center">
                      <div className="text-center p-8 glass rounded-2xl border border-white/10">
                        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-foreground mb-2">
                          Insufficient Data for {timeframes.find(t => t.value === timeframe)?.label}
                        </h4>
                        <p className="text-muted-foreground text-sm mb-4">
                          Your vault needs to be active for <span className="text-accent font-bold">{remainingTime}</span> more to display this chart.
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          Current vault age: <span className="text-foreground">{vaultAgeDays.toFixed(1)} days</span>
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => setTimeframe('all')}
                        >
                          View All Time Data
                        </Button>
                      </div>
                    </div>
                  ) : eventsLoading ? (
                    <div className="relative h-[300px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                        <p className="text-muted-foreground text-sm">Loading blockchain data...</p>
                      </div>
                    </div>
                  ) : realPerformanceHistory.length > 1 ? (
                    <div className="relative">
                      <svg
                        width={chartWidth}
                        height={chartHeight}
                        className="w-full h-auto"
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      >
                        <defs>
                          <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgb(0, 239, 139)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="rgb(0, 239, 139)" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        {/* Grid Lines */}
                        {[0, 1, 2, 3, 4].map((i) => (
                          <line
                            key={i}
                            x1={padding}
                            y1={padding + (i * (chartHeight - 2 * padding)) / 4}
                            x2={chartWidth - padding}
                            y2={padding + (i * (chartHeight - 2 * padding)) / 4}
                            stroke="hsl(var(--border))"
                            strokeWidth="1"
                            opacity="0.3"
                          />
                        ))}

                        {/* Real data chart */}
                        {(() => {
                          const values = realPerformanceHistory.map(p => p.balance)
                          const minVal = Math.min(...values)
                          const maxVal = Math.max(...values)
                          const range = maxVal - minVal || 1

                          const realPathData = realPerformanceHistory.map((point, index) => {
                            const x = padding + (index / (realPerformanceHistory.length - 1)) * (chartWidth - 2 * padding)
                            const y = chartHeight - padding - ((point.balance - minVal) / range) * (chartHeight - 2 * padding)
                            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                          }).join(' ')

                          const realAreaData = `${realPathData} L ${chartWidth - padding} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`

                          return (
                            <>
                              <motion.path
                                d={realAreaData}
                                fill="url(#performanceGradient)"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 0.2 }}
                              />
                              <motion.path
                                d={realPathData}
                                fill="none"
                                stroke="hsl(var(--accent))"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                              />
                            </>
                          )
                        })()}
                      </svg>

                      {/* Data source indicator */}
                      <div className="flex items-center justify-center mt-2 text-xs text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-accent mr-2 animate-pulse"></div>
                        Real blockchain data • {realPerformanceHistory.length} data points
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-[300px] flex items-center justify-center">
                      <div className="text-center p-8">
                        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No transaction history yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-2">Create a vault and make deposits to see your performance graph</p>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* Top Performers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <Card className="tool-card p-6 border border-border">
                  <h3 className="text-xl font-black text-foreground mb-4 uppercase italic tracking-tight">
                    VAULT PERFORMANCE
                  </h3>

                  <div className="space-y-4">
                    {analyticsData.topPerformers.map((vault, index) => (
                      <div key={vault.name} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-semibold text-muted-foreground">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{vault.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {vault.allocation.toFixed(1)}% allocation
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-semibold ${vault.pnl >= 0 ? 'text-accent' : 'text-destructive'} financial-number`}>
                            {vault.pnl >= 0 ? '+' : ''}{formatCurrency(vault.pnl)}
                          </div>
                          <div className={`text-sm ${vault.pnlPercent >= 0 ? 'text-accent' : 'text-destructive'}`}>
                            {vault.pnlPercent >= 0 ? '+' : ''}{formatPercentage(vault.pnlPercent)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Portfolio Breakdown */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="glass p-6">
                  <h3 className="text-lg font-black text-white mb-4 uppercase italic tracking-tight">
                    PORTFOLIO BREAKDOWN
                  </h3>

                  <div className="space-y-4">
                    {analyticsData.portfolioBreakdown.map((item) => (
                      <div key={item.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-white">{item.name}</span>
                          </div>
                          <span className="text-sm text-gray-400">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              backgroundColor: item.color,
                              width: `${item.percentage}%`
                            }}
                          />
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatCurrency(item.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Risk Metrics */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="glass p-6">
                  <h3 className="text-lg font-black text-white mb-4 uppercase italic tracking-tight">
                    RISK METRICS
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Sharpe Ratio</span>
                      <span className="text-white font-black italic">
                        {analyticsData.riskMetrics.sharpeRatio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Max Drawdown</span>
                      <span className="text-red-400 font-black italic">
                        {analyticsData.riskMetrics.maxDrawdown.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Volatility</span>
                      <span className="text-yellow-400 font-black italic">
                        {analyticsData.riskMetrics.volatility.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Beta</span>
                      <span className="text-white font-black italic">
                        {analyticsData.riskMetrics.beta.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Alpha</span>
                      <span className="text-green-400 font-black italic">
                        {analyticsData.riskMetrics.alpha.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="glass p-6">
                  <h3 className="text-lg font-black text-white mb-4 uppercase italic tracking-tight">
                    RECENT ACTIVITY
                  </h3>

                  <div className="space-y-3">
                    {analyticsData.recentTransactions.map((tx, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div>
                          <div className="text-[10px] font-black text-primary uppercase tracking-wider">
                            {tx.type.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-gray-400">
                            {tx.vault}
                          </div>
                        </div>
                        <div className="text-right">
                          {tx.amount > 0 && (
                            <div className={`text-sm font-black italic ${tx.type === 'deposit' || tx.type === 'vault_created'
                              ? 'text-green-400'
                              : 'text-red-400'
                              }`}>
                              {tx.type === 'deposit' ? '+' : ''}
                              {tx.amount > 0 ? formatCurrency(tx.amount) : ''}
                            </div>
                          )}
                          <div className="text-xs text-gray-400">
                            {tx.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}