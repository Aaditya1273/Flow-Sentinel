'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Search,
  TrendingUp,
  Shield,
  Zap,
  DollarSign,
  Users,
  Star,
  ArrowUpRight
} from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
import { Card } from 'components/ui/card'
import { formatCurrency, formatPercentage } from 'lib/utils'
import { useFlow } from 'lib/flow'
import { FlowService } from 'lib/flow-service'

interface VaultStrategy {
  id: string
  name: string
  description: string
  expectedAPY: number
  tvl: number
  riskLevel: number
  category: string
  participants: number
  minDeposit: number
  featured: boolean
  creator: string
  verified: boolean
  performance24h: number
  performance7d: number
  performance30d: number
  features: string[]
  isActive: boolean
}

export default function VaultsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRisk, setSelectedRisk] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('expectedAPY')
  const [strategies, setStrategies] = useState<VaultStrategy[]>([])
  const [filteredStrategies, setFilteredStrategies] = useState<VaultStrategy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isConnected } = useFlow()
  const router = useRouter()

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'liquid-staking', label: 'Liquid Staking' },
    { value: 'yield-farming', label: 'Yield Farming' },
    { value: 'lending', label: 'Lending' },
    { value: 'arbitrage', label: 'Arbitrage' }
  ]

  const riskLevels = [
    { value: 'all', label: 'All Risk Levels' },
    { value: '1', label: 'Low Risk' },
    { value: '2', label: 'Medium Risk' },
    { value: '3', label: 'High Risk' }
  ]

  const sortOptions = [
    { value: 'expectedAPY', label: 'Highest APY' },
    { value: 'tvl', label: 'Highest TVL' },
    { value: 'participants', label: 'Most Popular' },
    { value: 'performance30d', label: 'Best 30d Performance' }
  ]

  // Load strategies from blockchain
  useEffect(() => {
    const loadStrategies = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all strategies from the blockchain
        const blockchainStrategies = await FlowService.getAllStrategies()

        if (blockchainStrategies && blockchainStrategies.length > 0) {
          // Transform blockchain data to match our interface
          const transformedStrategies: VaultStrategy[] = blockchainStrategies.map((strategy: any) => ({
            id: strategy.id,
            name: strategy.name,
            description: strategy.description,
            expectedAPY: parseFloat(strategy.expectedAPY || '0'),
            tvl: parseFloat(strategy.tvl || '0'),
            riskLevel: parseInt(strategy.riskLevel || '1'),
            category: strategy.category,
            participants: parseInt(strategy.participants || '0'),
            minDeposit: parseFloat(strategy.minDeposit || '0'),
            featured: strategy.featured === true,
            creator: strategy.creator || 'Unknown',
            verified: strategy.verified === true,
            performance24h: parseFloat(strategy.performance24h || '0'),
            performance7d: parseFloat(strategy.performance7d || '0'),
            performance30d: parseFloat(strategy.performance30d || '0'),
            features: strategy.features || [],
            isActive: strategy.isActive !== false
          }))

          setStrategies(transformedStrategies)
        } else {
          // Fallback to demo data if blockchain is not available
          console.warn('No strategies found on blockchain, using demo data')
          setStrategies([])
        }
      } catch (err) {
        console.error('Error loading strategies:', err)
        setError('Failed to load strategies from blockchain. Please try again.')
        setStrategies([])
      } finally {
        setLoading(false)
      }
    }

    loadStrategies()
  }, [])

  // Filter and sort strategies
  useEffect(() => {
    let filtered = strategies.filter(strategy => {
      const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || strategy.category === selectedCategory
      const matchesRisk = selectedRisk === 'all' || strategy.riskLevel.toString() === selectedRisk

      return matchesSearch && matchesCategory && matchesRisk && strategy.isActive
    })

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'expectedAPY':
          return b.expectedAPY - a.expectedAPY
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

    setFilteredStrategies(filtered)
  }, [strategies, searchTerm, selectedCategory, selectedRisk, sortBy])

  const handleInvestClick = async (strategy: VaultStrategy) => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    try {
      // Redirect to dashboard with strategy selection
      const params = new URLSearchParams({
        create: 'true',
        strategy: strategy.id,
        name: strategy.name,
        minDeposit: strategy.minDeposit.toString()
      })
      router.push(`/dashboard?${params.toString()}`)
    } catch (error) {
      console.error('Error handling invest click:', error)
      alert('Error preparing vault creation. Please try again.')
    }
  }

  const getRiskColor = (riskLevel: number) => {
    switch (riskLevel) {
      case 1: return 'text-green-400 bg-green-400/20'
      case 2: return 'text-yellow-400 bg-yellow-400/20'
      case 3: return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getRiskLabel = (riskLevel: number) => {
    switch (riskLevel) {
      case 1: return 'LOW'
      case 2: return 'MEDIUM'
      case 3: return 'HIGH'
      default: return 'UNKNOWN'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading strategies from blockchain...</p>
          </div>
        </div>
      </div>
    )
  }

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
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Vault Strategies
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Choose from proven DeFi strategies powered by Flow blockchain smart contracts
            </p>

            <div className="tool-card p-4 mb-6 border border-accent/20 bg-accent/5">
              <div className="flex items-center space-x-2 text-accent mb-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Real Blockchain Strategies</span>
              </div>
              <p className="text-sm text-muted-foreground">
                All strategies are powered by deployed smart contracts on Flow Testnet. Each strategy implements real DeFi logic with MEV protection and automated execution.
                {!isConnected && " Connect your wallet to create vaults with these strategies."}
              </p>
            </div>

            {error && (
              <div className="tool-card p-4 mb-6 border border-destructive/20 bg-destructive/5">
                <div className="flex items-center space-x-2 text-destructive mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Error Loading Strategies</span>
                </div>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            )}

            {/* Stats - Only show real data */}
            {strategies.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="tool-card p-4 border border-border">
                  <div className="text-2xl font-bold text-foreground financial-number">
                    {formatCurrency(strategies.reduce((sum, v) => sum + v.tvl, 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Value Locked</div>
                </div>
                <div className="tool-card p-4 border border-border">
                  <div className="text-2xl font-bold text-foreground">
                    {strategies.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Available Strategies</div>
                </div>
                <div className="tool-card p-4 border border-border">
                  <div className="text-2xl font-bold text-accent">
                    {strategies.reduce((sum, v) => sum + v.participants, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="tool-card p-4 border border-border">
                  <div className="text-2xl font-bold text-accent">
                    {Math.max(...strategies.map(v => v.expectedAPY)).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Highest APY</div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="tool-card p-6 border border-border mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search strategies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              {/* Risk Filter */}
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
              >
                {riskLevels.map(risk => (
                  <option key={risk.value} value={risk.value}>{risk.label}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Featured Strategies */}
          {filteredStrategies.some(v => v.featured) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">Featured Strategies</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredStrategies.filter(strategy => strategy.featured).map((strategy, index) => (
                  <motion.div
                    key={strategy.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="tool-card p-6 border border-border hover:border-accent/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-accent/20 rounded-lg">
                            {getCategoryIcon(strategy.category)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-foreground">{strategy.name}</h3>
                              {strategy.verified && <Star className="w-4 h-4 text-accent fill-current" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{strategy.creator}</p>
                          </div>
                        </div>
                        <Badge className={getRiskColor(strategy.riskLevel)}>
                          {getRiskLabel(strategy.riskLevel)}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground mb-4">{strategy.description}</p>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-2xl font-bold text-accent financial-number">
                            {strategy.expectedAPY.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">APY</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-foreground financial-number">
                            {formatCurrency(strategy.tvl)}
                          </div>
                          <div className="text-xs text-muted-foreground">TVL</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-accent">
                            {strategy.participants.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">Users</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {strategy.features.slice(0, 3).map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Min: {strategy.minDeposit} FLOW
                        </div>
                        <Button size="sm" onClick={() => handleInvestClick(strategy)}>
                          {isConnected ? 'Create Vault' : 'Connect Wallet'}
                          <ArrowUpRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* All Strategies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">All Strategies</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStrategies.filter(strategy => !strategy.featured).map((strategy, index) => (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <Card className="tool-card p-6 border border-border hover:border-accent/50 transition-colors cursor-pointer h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-accent/20 rounded">
                          {getCategoryIcon(strategy.category)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1">
                            <h3 className="font-semibold text-foreground">{strategy.name}</h3>
                            {strategy.verified && <Star className="w-3 h-3 text-accent fill-current" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{strategy.creator}</p>
                        </div>
                      </div>
                      <Badge className={getRiskColor(strategy.riskLevel)}>
                        {getRiskLabel(strategy.riskLevel)}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{strategy.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <div className="text-xl font-bold text-accent financial-number">
                          {strategy.expectedAPY.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">APY</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground financial-number">
                          {formatCurrency(strategy.tvl)}
                        </div>
                        <div className="text-xs text-muted-foreground">TVL</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {strategy.participants.toLocaleString()}
                      </div>
                      <div>Min: {strategy.minDeposit} FLOW</div>
                    </div>

                    <Button size="sm" className="w-full" onClick={() => handleInvestClick(strategy)}>
                      {isConnected ? 'Create Vault' : 'Connect Wallet'}
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {filteredStrategies.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {strategies.length === 0
                  ? 'No strategies available. Please check your blockchain connection.'
                  : 'No strategies found matching your criteria'
                }
              </div>
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