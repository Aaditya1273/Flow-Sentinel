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
      case 1: return 'text-primary bg-primary/10 border-primary/20'
      case 2: return 'text-warning bg-warning/10 border-warning/20'
      case 3: return 'text-destructive bg-destructive/10 border-destructive/20'
      default: return 'text-muted-foreground bg-white/5 border-white/10'
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
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <Navbar />
        <div className="flex items-center justify-center min-h-screen pt-16">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-primary animate-pulse">Loading Strategies...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[40%] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />
      <Navbar />

      <div className="pt-32 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Live Strategies</span>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Vault Strategies</h1>
                <p className="text-muted-foreground mt-3 font-medium">
                  Proven DeFi strategies powered by Flow blockchain smart contracts
                </p>
              </div>
            </div>

            <div className="tool-card p-5 mt-8 border-0 bg-primary/5 border border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="flex items-center gap-3 text-primary mb-2">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Real Blockchain Strategies</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All strategies are powered by deployed smart contracts on Flow Testnet with MEV protection and automated execution.
                {!isConnected && ' Connect your wallet to create vaults.'}
              </p>
            </div>

            {error && (
              <div className="tool-card p-5 mt-4 border-0 bg-destructive/5 border border-destructive/20">
                <div className="flex items-center gap-3 text-destructive mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Error Loading Strategies</span>
                </div>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            )}

            {/* Stats */}
            {strategies.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                {[
                  { label: 'Total Value Locked', value: formatCurrency(strategies.reduce((s, v) => s + v.tvl, 0)), color: 'text-white' },
                  { label: 'Available Strategies', value: strategies.length.toString(), color: 'text-white' },
                  { label: 'Total Users', value: strategies.reduce((s, v) => s + v.participants, 0).toLocaleString(), color: 'text-primary' },
                  { label: 'Highest APY', value: `${Math.max(...strategies.map(v => v.expectedAPY)).toFixed(1)}%`, color: 'text-primary' },
                ].map((stat, i) => (
                  <div key={i} className="tool-card p-6 border-0 glass relative overflow-hidden">
                    <div className={`text-2xl font-black tracking-tighter financial-number ${stat.color}`}>{stat.value}</div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Filters */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="tool-card p-6 border-0 glass mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search strategies..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary/50 text-sm"
                />
              </div>
              {[
                { value: selectedCategory, onChange: setSelectedCategory, options: categories },
                { value: selectedRisk, onChange: setSelectedRisk, options: riskLevels },
                { value: sortBy, onChange: setSortBy, options: sortOptions },
              ].map((sel, i) => (
                <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)}
                  className="px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 text-sm cursor-pointer">
                  {sel.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ))}
            </div>
          </motion.div>

          {/* Featured Strategies */}
          {filteredStrategies.some(v => v.featured) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-6">Featured Strategies</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredStrategies.filter(s => s.featured).map((strategy, index) => (
                  <motion.div key={strategy.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.1 }}>
                    <div className="tool-card p-8 border-0 glass hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                            {getCategoryIcon(strategy.category)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-black text-white uppercase tracking-tighter">{strategy.name}</h3>
                              {strategy.verified && <Star className="w-4 h-4 text-primary fill-current" />}
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{strategy.creator}</p>
                          </div>
                        </div>
                        <Badge className={`${getRiskColor(strategy.riskLevel)} text-[10px] font-black uppercase tracking-widest border`}>
                          {getRiskLabel(strategy.riskLevel)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{strategy.description}</p>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div><div className="text-2xl font-black text-primary financial-number">{strategy.expectedAPY.toFixed(1)}%</div><div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">APY</div></div>
                        <div><div className="text-lg font-black text-white financial-number">{formatCurrency(strategy.tvl)}</div><div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">TVL</div></div>
                        <div><div className="text-lg font-black text-primary">{strategy.participants.toLocaleString()}</div><div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Users</div></div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Min: {strategy.minDeposit} FLOW</div>
                        <Button size="sm" className="btn-primary text-[10px] font-black uppercase tracking-widest" onClick={() => handleInvestClick(strategy)}>
                          {isConnected ? 'Create Vault' : 'Connect Wallet'} <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* All Strategies */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-6">All Strategies</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStrategies.filter(s => !s.featured).map((strategy, index) => (
                <motion.div key={strategy.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + index * 0.05 }}>
                  <div className="tool-card p-6 border-0 glass hover:border-primary/30 transition-all cursor-pointer h-full group relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 glass rounded-xl flex items-center justify-center bg-primary/5 text-primary">
                          {getCategoryIcon(strategy.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-black text-white uppercase tracking-tighter">{strategy.name}</h3>
                            {strategy.verified && <Star className="w-3 h-3 text-primary fill-current" />}
                          </div>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{strategy.creator}</p>
                        </div>
                      </div>
                      <Badge className={`${getRiskColor(strategy.riskLevel)} text-[9px] font-black uppercase tracking-widest border`}>
                        {getRiskLabel(strategy.riskLevel)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed line-clamp-2 flex-1">{strategy.description}</p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div><div className="text-xl font-black text-primary financial-number">{strategy.expectedAPY.toFixed(1)}%</div><div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">APY</div></div>
                      <div><div className="text-sm font-black text-white financial-number">{formatCurrency(strategy.tvl)}</div><div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">TVL</div></div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-4">
                      <div className="flex items-center gap-1"><Users className="w-3 h-3" />{strategy.participants.toLocaleString()}</div>
                      <div>Min: {strategy.minDeposit} FLOW</div>
                    </div>
                    <Button size="sm" className="w-full btn-primary text-[10px] font-black uppercase tracking-widest" onClick={() => handleInvestClick(strategy)}>
                      {isConnected ? 'Create Vault' : 'Connect Wallet'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {filteredStrategies.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="w-16 h-16 glass rounded-3xl flex items-center justify-center mx-auto mb-6 bg-white/5">
                <Search className="w-8 h-8 text-muted-foreground opacity-40" />
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6">
                {strategies.length === 0 ? 'No strategies available on blockchain' : 'No strategies match your criteria'}
              </p>
              <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSelectedRisk('all') }}
                className="btn-primary text-[10px] font-black uppercase tracking-widest">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}