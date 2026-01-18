'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { useVaultData } from 'hooks/useVaultData'
import { formatCurrency } from 'lib/utils'

export function PortfolioChart() {
  const [timeframe, setTimeframe] = useState('7d')
  const { vaultData, performance, loading } = useVaultData()

  const timeframes = [
    { label: '24H', value: '1d' },
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
  ]

  const generateChartData = () => {
    if (!vaultData || !performance) return []
    const totalDeposits = vaultData.totalDeposits
    const pnl = performance.pnl || 0
    const numPoints = timeframe === '1d' ? 24 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90

    const dataPoints = []
    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1)
      const seedRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000
        return x - Math.floor(x)
      }

      const value = totalDeposits + (pnl * progress) + (seedRandom(i + 12345) - 0.5) * (pnl * 0.1)
      dataPoints.push({
        date: new Date(1640995200000 - (numPoints - 1 - i) * (timeframe === '1d' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)),
        value: Math.max(value, totalDeposits * 0.9)
      })
    }
    return dataPoints
  }

  const chartData = generateChartData()
  const chartWidth = 600
  const chartHeight = 300
  const padding = 40

  if (loading || chartData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="animate-pulse flex flex-col gap-2">
            <div className="h-8 bg-white/5 rounded-lg w-32"></div>
            <div className="h-4 bg-white/5 rounded-lg w-24"></div>
          </div>
          <div className="flex gap-2 glass p-1.5 rounded-xl">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-10 h-8 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
        <div className="h-[300px] glass rounded-2xl animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
      </div>
    )
  }

  const minValue = Math.min(...chartData.map(d => d.value))
  const maxValue = Math.max(...chartData.map(d => d.value))
  const valueRange = maxValue - minValue || 1

  const pathData = chartData.map((point, index) => {
    const x = padding + (index / (chartData.length - 1)) * (chartWidth - 2 * padding)
    const y = chartHeight - padding - ((point.value - minValue) / valueRange) * (chartHeight - 2 * padding)
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  const areaData = `${pathData} L ${chartWidth - padding} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`

  const currentValue = chartData[chartData.length - 1]?.value || 0
  const previousValue = chartData[0]?.value || 0
  const change = currentValue - previousValue
  const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-black tracking-tight text-white mb-1">
            {formatCurrency(currentValue)}
          </div>
          <div className={`flex items-center text-sm font-bold ${change >= 0 ? 'text-primary' : 'text-red-400'}`}>
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1.5" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1.5" />
            )}
            {change >= 0 ? '+' : ''}{formatCurrency(change)} ({changePercent.toFixed(2)}%)
          </div>
        </div>

        <div className="flex gap-1 glass p-1 rounded-xl">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${timeframe === tf.value
                  ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,239,139,0.3)]'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative glass rounded-2xl p-4 overflow-hidden group">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="w-full h-auto overflow-visible"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + (i * (chartHeight - 2 * padding)) / 4}
              x2={chartWidth - padding}
              y2={padding + (i * (chartHeight - 2 * padding)) / 4}
              stroke="white"
              strokeWidth="1"
              opacity="0.05"
            />
          ))}

          <motion.path
            d={areaData}
            fill="url(#chartGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          />

          <motion.path
            d={pathData}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {chartData.map((point, index) => {
            if (index % Math.floor(chartData.length / 5) !== 0 && index !== chartData.length - 1) return null
            const x = padding + (index / (chartData.length - 1)) * (chartWidth - 2 * padding)
            const y = chartHeight - padding - ((point.value - minValue) / valueRange) * (chartHeight - 2 * padding)

            return (
              <motion.g key={index} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + index * 0.05 }}>
                <circle cx={x} cy={y} r="6" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="2" />
                <circle cx={x} cy={y} r="2" fill="hsl(var(--primary))" />
              </motion.g>
            )
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground/50">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>Real-time Yield Projection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Forte Active</span>
        </div>
      </div>
    </div>
  )
}
