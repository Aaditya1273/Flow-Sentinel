'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Shield, 
  Zap, 
  DollarSign,
  Users,
  Clock,
  Star,
  ArrowUpRight
} from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
import { Card } from 'components/ui/card'
import { formatCurrency } from 'lib/utils'
import { useFlow } from 'lib/flow'
import { formatCurrency, formatPercentage } from 'lib/utils'

interface VaultStrategy {
  id: string
  name: string
  description: string
  apy: number
  tvl: number
  risk: 'low' | 'medium' | 'high'
  category: 'yield-farming' | 'liquid-staking' | 'lending' | 'arbitrage'
  participants: number
  minDeposit: number
  featured: boolean
  creator: string
  verified: boolean
  performance24h: number
  performance7d: number
  performance30d: number
  features: string[]
  strategy: string
}

const mockVaultStrategies: VaultStrategy[] = [
  {
    id: '1',
    name: 'Flow Liquid Staking Pro',
    description: 'Maximize staking rewards with automated delegation and MEV protection',
    apy: 12.5,
    tvl: 2500000,
    risk: 'low',
    category: 'liquid-staking',
    participants: 1247,
    minDeposit: 10,
    featured: true,
    creator: 'Flow Foundation',
    verified: true,
    performance24h: 0.8,
    performance7d: 5.2,
    performance30d: 18.7,
    features: ['Auto-Delegation', 'MEV Protection', 'Instant Liquidity'],
    strategy: 'Automated liquid staking with optimal validator selection'
  },
  {
    id: '2',
    name: 'DeFi Yield Maximizer',
    description: 'Multi-protocol yield farming with automatic rebalancing',
    apy: 24.8,
    tvl: 1800000,
    risk: 'medium',
    category: 'yield-farming',
    participants: 892,
    minDeposit: 100,
    featured: true,
    creator: 'Sentinel Labs',
    verified: true,
    performance24h: 1.2,
    performance7d: 8.9,
    performance30d: 32.1,
    features: ['Multi-Protocol', 'Auto-Compound', 'Risk Management'],
    strategy: 'Diversified farming across top DeFi protocols'
  },
  {
    id: '3',
    name: 'Arbitrage Hunter',
    description: 'Capture arbitrage opportunities across DEXs with MEV protection',
    apy: 18.3,
    tvl: 950000,
    risk: 'medium',
    category: 'arbitrage',
    participants: 456,
    minDeposit: 250,
    featured: false,
    creator: 'Alpha Strategies',
    verified: true,
    performance24h: 0.6,
    performance7d: 4.1,
    performance30d: 15.8,
    features: ['MEV Protection', 'Cross-DEX', 'Flash Loans'],
    strategy: 'Automated arbitrage with advanced MEV protection'
  },
  {
    id: '4',
    name: 'Conservative Lending',
    description: 'Safe lending strategies with blue-chip collateral',
    apy: 8.7,
    tvl: 3200000,
    risk: 'low',
    category: 'lending',
    participants: 2156,
    minDeposit: 50,
    featured: false,
    creator: 'Secure Finance',
    verified: true,
    performance24h: 0.3,
    performance7d: 2.1,
    performance30d: 9.4,
    features: ['Blue-chip Only', 'Over-collateralized', 'Insurance'],
    strategy: 'Conservative lending with premium collateral'
  },
  {
    id: '5',
    name: 'High-Yield Farming',
    description: 'Aggressive yield farming with leverage and advanced strategies',
    apy: 45.2,
    tvl: 680000,
    risk: 'high',
    category: 'yield-farming',
    participants: 234,
    minDeposit: 500,
    featured: false,
    creator: 'Degen Capital',
    verified: false,
    performance24h: 2.8,
    performance7d: 15.6,
    performance30d: 67.3,
    features: ['Leveraged', 'High-Risk', 'Expert Only'],
    strategy: 'Leveraged farming with sophisticated risk management'
  },
  {
    id: '6',
    name: 'Stable Yield Plus',
    description: 'Enhanced stablecoin yields through optimized lending',
    apy: 6.4,
    tvl: 4100000,
    risk: 'low',
    category: 'lending',
    participants: 3421,
    minDeposit: 25,
    featured: false,
    creator: 'Stable Protocol',
    verified: true,
    performance24h: 0.2,
    performance7d: 1.3,
    performance30d: 5.8,
    features: ['Stablecoin Only', 'Low Risk', 'High Liquidity'],
    strategy: 'Optimized stablecoin lending across multiple protocols'
  }
]

export default function VaultsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRisk, setSelectedRisk] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('apy')
  const [filteredVaults, setFilteredVaults] = useState(mockVaultStrategies)
  const { isConnected } = useFlow()

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'liquid-staking', label: 'Liquid Staking' },
    { value: 'yield-farming', label: 'Yield Farming' },
    { value: 'lending', label: 'Lending' },
    { value: 'arbitrage', label: 'Arbitrage' }
  ]

  const riskLevels = [
    { value: 'all', label: 'All Risk Levels' },
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' }
  ]

  const sortOptions = [
    { value: 'apy', label: 'Highest APY' },
    { value: 'tvl', label: 'Highest TVL' },
    { value: 'participants', label: 'Most Popular' },
    { value: 'performance30d', label: 'Best 30d Performance' }
  ]

  useEffect(() => {
    // Always show available strategies that users can create vaults for
    let filtered = mockVaultStrategies.filter(vault => {
      const matchesSearch = vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vault.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || vault.category === selectedCategory
      const matchesRisk = selectedRisk === 'all' || vault.risk === selectedRisk
      
      return matchesSearch && matchesCategory && matchesRisk
    })

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'apy':
          return b.apy - a.apy
        case 'tvl':
          return b.tvl - a.tvl
        case 'participants':
          return b.participants - a.participants
        case 'performance30d':
          return b.performance30d - a.performance30d
        default:
          return 0
      }
    })

    setFilteredVaults(filtered)
  }, [searchTerm, selectedCategory, selectedRisk, sortBy])

  const handleInvestClick = (vault: VaultStrategy) => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }
    // Redirect to dashboard with vault creation
    window.location.href = `/dashboard?create=true&strategy=${vault.id}`
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'high': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'liquid-staking': return <Shield className="w-4 h-4" />
      case 'yield-farming': return <TrendingUp className="w-4 h-4" />
      case 'lending': return <DollarSign className="w-4 h-4" />
      case 'arbitrage': return <Zap className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Vault Strategies
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Choose from proven DeFi strategies and create your own autonomous vault
            </p>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-blue-400 mb-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Strategy Templates</span>
              </div>
              <p className="text-sm text-blue-300">
                These are proven DeFi strategies available for vault creation. Click "Invest Now" to create your own vault using any strategy.
                {!isConnected && " Connect your wallet to get started."}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="glass p-4 rounded-xl">
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(mockVaultStrategies.reduce((sum, v) => sum + v.tvl, 0))}
                </div>
                <div className="text-sm text-gray-400">Total Value Locked</div>
              </div>
              <div className="glass p-4 rounded-xl">
                <div className="text-2xl font-bold text-white">
                  {mockVaultStrategies.length}
                </div>
                <div className="text-sm text-gray-400">Available Strategies</div>
              </div>
              <div className="glass p-4 rounded-xl">
                <div className="text-2xl font-bold text-blue-400">
                  {mockVaultStrategies.reduce((sum, v) => sum + v.participants, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Users</div>
              </div>
              <div className="glass p-4 rounded-xl">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.max(...mockVaultStrategies.map(v => v.apy)).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Highest APY</div>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-xl mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search strategies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              {/* Risk Filter */}
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {riskLevels.map(risk => (
                  <option key={risk.value} value={risk.value}>{risk.label}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Featured Vaults */}
          {filteredVaults.some(v => v.featured) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Featured Strategies</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredVaults.filter(vault => vault.featured).map((vault, index) => (
                  <motion.div
                    key={vault.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="glass p-6 hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            {getCategoryIcon(vault.category)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-white">{vault.name}</h3>
                              {vault.verified && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                            </div>
                            <p className="text-sm text-gray-400">{vault.creator}</p>
                          </div>
                        </div>
                        <Badge className={getRiskColor(vault.risk)}>
                          {vault.risk.toUpperCase()}
                        </Badge>
                      </div>

                      <p className="text-gray-300 mb-4">{vault.description}</p>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-2xl font-bold text-green-400">
                            {vault.apy.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-400">APY</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-white">
                            {formatCurrency(vault.tvl)}
                          </div>
                          <div className="text-xs text-gray-400">TVL</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-blue-400">
                            {vault.participants.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">Users</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {vault.features.slice(0, 3).map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          Min: {vault.minDeposit} FLOW
                        </div>
                        <Button size="sm">
                          <span onClick={() => handleInvestClick(vault)}>
                            Invest Now
                            <ArrowUpRight className="w-4 h-4 ml-1" />
                          </span>
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* All Vaults */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">All Strategies</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVaults.filter(vault => !vault.featured).map((vault, index) => (
                <motion.div
                  key={vault.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <Card className="glass p-6 hover:bg-white/5 transition-colors cursor-pointer h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-blue-500/20 rounded">
                          {getCategoryIcon(vault.category)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1">
                            <h3 className="font-semibold text-white">{vault.name}</h3>
                            {vault.verified && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
                          </div>
                          <p className="text-xs text-gray-400">{vault.creator}</p>
                        </div>
                      </div>
                      <Badge className={getRiskColor(vault.risk)} size="sm">
                        {vault.risk.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-300 mb-4 line-clamp-2">{vault.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <div className="text-xl font-bold text-green-400">
                          {vault.apy.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400">APY</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {formatCurrency(vault.tvl)}
                        </div>
                        <div className="text-xs text-gray-400">TVL</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {vault.participants.toLocaleString()}
                      </div>
                      <div>Min: {vault.minDeposit} FLOW</div>
                    </div>

                    <Button size="sm" className="w-full" onClick={() => handleInvestClick(vault)}>
                      View Details
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {filteredVaults.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No strategies found matching your criteria</div>
              <Button onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedRisk('all')
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}