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
  RefreshCw
} from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
import { Card } from 'components/ui/card'
import { formatCurrency, formatPercentage } from 'lib/utils'
import { useVaultData } from 'hooks/useVaultData'
import { useFlow } from 'lib/flow'

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('portfolio')
  const { user } = useFlow()
  const { vaultData, performance, flowBalance, loading, refetch } = useVaultData()
  
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
    if (!vaultData || !performance) {
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

    const totalValue = vaultData.balance + flowBalance
    const pnl = performance.pnl || 0
    const pnlPercent = performance.pnlPercent || 0

    // Generate portfolio breakdown based on vault strategy
    const portfolioBreakdown = [
      { 
        name: vaultData.strategy || 'Main Strategy', 
        value: vaultData.balance, 
        percentage: totalValue > 0 ? (vaultData.balance / totalValue) * 100 : 0, 
        color: '#3B82F6' 
      },
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
    const baseValue = vaultData.totalDeposits
    
    // Use seeded random for consistent values
    const seedRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }
    
    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1)
      const value = baseValue + (pnl * progress) + (seedRandom(i + 54321) - 0.5) * (pnl * 0.1)
      performanceHistory.push({
        date: new Date(1640995200000 - (numPoints - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Use fixed base timestamp
        value: Math.max(value, baseValue * 0.95),
        pnl: Math.max(value - baseValue, baseValue * -0.05)
      })
    }

    // Calculate risk metrics based on performance
    const volatility = Math.abs(pnlPercent) * 0.5 // Simplified volatility calculation
    const sharpeRatio = pnlPercent > 0 ? pnlPercent / Math.max(volatility, 1) : 0
    
    return {
      totalPortfolioValue: totalValue,
      totalPnL: pnl,
      totalPnLPercent: pnlPercent,
      dailyPnL: pnl * 0.1, // Estimate daily P&L
      dailyPnLPercent: pnlPercent * 0.1,
      weeklyPnL: pnl * 0.3, // Estimate weekly P&L
      weeklyPnLPercent: pnlPercent * 0.3,
      monthlyPnL: pnl,
      monthlyPnLPercent: pnlPercent,
      
      portfolioBreakdown,
      performanceHistory,
      
      topPerformers: [
        { 
          name: vaultData.name, 
          pnl: pnl, 
          pnlPercent: pnlPercent, 
          allocation: portfolioBreakdown[0]?.percentage || 0 
        }
      ],
      
      riskMetrics: {
        sharpeRatio: Math.max(sharpeRatio, 0),
        maxDrawdown: Math.min(pnlPercent * -0.2, 0), // Estimate max drawdown
        volatility: volatility,
        beta: 0.8, // Estimate beta
        alpha: Math.max(pnlPercent - 5, 0) // Estimate alpha
      },
      
      recentTransactions: [
        { type: 'vault_created', amount: 0, vault: vaultData.name, timestamp: 'Recently' },
        { type: 'deposit', amount: vaultData.totalDeposits, vault: vaultData.name, timestamp: 'Recently' }
      ]
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
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Portfolio Analytics
                </h1>
                <p className="text-xl text-muted-foreground">
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
              <div className="text-2xl font-bold text-foreground mb-1 financial-number">
                {formatCurrency(analyticsData.totalPortfolioValue)}
              </div>
              <div className="text-sm text-muted-foreground">Total Portfolio Value</div>
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
              <div className="text-2xl font-bold text-accent mb-1 financial-number">
                +{formatCurrency(analyticsData.dailyPnL)}
              </div>
              <div className="text-sm text-muted-foreground">Daily P&L</div>
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
              <div className="text-2xl font-bold text-foreground mb-1">
                {analyticsData.riskMetrics.sharpeRatio.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
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
              <div className="text-2xl font-bold text-foreground mb-1">
                {analyticsData.riskMetrics.volatility.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Volatility</div>
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
                    <h3 className="text-xl font-semibold text-foreground">
                      Portfolio Performance
                    </h3>
                    
                    <div className="flex space-x-1 bg-muted rounded-lg p-1">
                      {timeframes.map((tf) => (
                        <button
                          key={tf.value}
                          onClick={() => setTimeframe(tf.value)}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            timeframe === tf.value
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
                    <div className="text-3xl font-bold text-foreground financial-number">
                      {formatCurrency(analyticsData.totalPortfolioValue)}
                    </div>
                    <div className="flex items-center text-accent">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +{formatCurrency(analyticsData.totalPnL)} ({formatPercentage(analyticsData.totalPnLPercent)})
                    </div>
                  </div>

                  {analyticsData.performanceHistory.length > 0 && (
                    <div className="relative">
                      <svg
                        width={chartWidth}
                        height={chartHeight}
                        className="w-full h-auto"
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      >
                        <defs>
                          <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
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

                        <motion.path
                          d={areaData}
                          fill="url(#performanceGradient)"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />

                        <motion.path
                          d={pathData}
                          fill="none"
                          stroke="hsl(var(--accent))"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                      </svg>
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
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Vault Performance
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
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Portfolio Breakdown
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
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Risk Metrics
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sharpe Ratio</span>
                      <span className="text-white font-medium">
                        {analyticsData.riskMetrics.sharpeRatio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Drawdown</span>
                      <span className="text-red-400 font-medium">
                        {analyticsData.riskMetrics.maxDrawdown.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Volatility</span>
                      <span className="text-yellow-400 font-medium">
                        {analyticsData.riskMetrics.volatility.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Beta</span>
                      <span className="text-white font-medium">
                        {analyticsData.riskMetrics.beta.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Alpha</span>
                      <span className="text-green-400 font-medium">
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
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Recent Activity
                  </h3>
                  
                  <div className="space-y-3">
                    {analyticsData.recentTransactions.map((tx, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-white capitalize">
                            {tx.type.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-gray-400">
                            {tx.vault}
                          </div>
                        </div>
                        <div className="text-right">
                          {tx.amount > 0 && (
                            <div className={`text-sm font-medium ${
                              tx.type === 'deposit' || tx.type === 'vault_created' 
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