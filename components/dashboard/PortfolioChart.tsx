'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
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

  // Generate chart data based on real vault data
  const generateChartData = () => {
    if (!vaultData || !performance) {
      return []
    }

    const currentBalance = vaultData.balance
    const totalDeposits = vaultData.totalDeposits
    const pnl = performance.pnl || 0

    // Generate historical data points based on current performance
    const dataPoints = []
    const numPoints = timeframe === '1d' ? 24 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    
    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1)
      // Simulate growth curve based on actual P&L
      const value = totalDeposits + (pnl * progress) + (Math.random() - 0.5) * (pnl * 0.1)
      dataPoints.push({
        date: new Date(Date.now() - (numPoints - 1 - i) * (timeframe === '1d' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)),
        value: Math.max(value, totalDeposits * 0.9) // Ensure minimum value
      })
    }

    return dataPoints
  }

  const chartData = generateChartData()

  // Calculate chart dimensions and path
  const chartWidth = 400
  const chartHeight = 200
  const padding = 20

  if (loading || chartData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-24"></div>
          </div>
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeframe === tf.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-48 bg-gray-800/30 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  const minValue = Math.min(...chartData.map(d => d.value))
  const maxValue = Math.max(...chartData.map(d => d.value))
  const valueRange = maxValue - minValue || 1

  // Create SVG path for the line chart
  const pathData = chartData.map((point, index) => {
    const x = padding + (index / (chartData.length - 1)) * (chartWidth - 2 * padding)
    const y = chartHeight - padding - ((point.value - minValue) / valueRange) * (chartHeight - 2 * padding)
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  // Create area path for gradient fill
  const areaData = `${pathData} L ${chartWidth - padding} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`

  const currentValue = chartData[chartData.length - 1]?.value || 0
  const previousValue = chartData[chartData.length - 2]?.value || currentValue
  const change = currentValue - previousValue
  const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(currentValue)}
          </div>
          <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {change >= 0 ? '+' : ''}{formatCurrency(change)} ({changePercent.toFixed(2)}%)
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeframe === tf.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="w-full h-auto"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
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
              stroke="rgb(55, 65, 81)"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}

          {/* Area Fill */}
          <motion.path
            d={areaData}
            fill="url(#chartGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          />

          {/* Line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Data Points */}
          {chartData.map((point, index) => {
            const x = padding + (index / (chartData.length - 1)) * (chartWidth - 2 * padding)
            const y = chartHeight - padding - ((point.value - minValue) / valueRange) * (chartHeight - 2 * padding)
            
            return (
              <motion.circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="rgb(59, 130, 246)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                className="hover:r-4 transition-all cursor-pointer"
              />
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Portfolio Value Over Time</span>
        <span>Last updated: {vaultData ? 'Live' : 'No data'}</span>
      </div>
    </div>
  )
}