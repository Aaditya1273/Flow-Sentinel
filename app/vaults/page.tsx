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
import { formatCurrency } from 'lib/utils'
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
    { value: 'performance30d', label: 'Best 30d' }
  ]

  useEffect(() => {
    const loadStrategies = async () => {
      try { setLoading(true); setError(null)
        const blockchainStrategies = await FlowService.getAllStrategies()
        if (blockchainStrategies && blockchainStrategies.length > 0) {
          setStrategies(blockchainStrategies.map((s: any) => ({
            id: s.id, name: s.name, description: s.description,
            expectedAPY: parseFloat(s.expectedAPY || '0'),
            tvl: parseFloat(s.tvl || '0'),
            riskLevel: parseInt(s.riskLevel || '1'),
            category: s.category,
            participants: parseInt(s.participants || '0'),
            minDeposit: parseFloat(s.minDeposit || '0'),
            featured: s.featured === true,
            creator: s.creator || 'Unknown',
            verified: s.verified === true,
            performance24h: parseFloat(s.performance24h || '0'),
            performance7d: parseFloat(s.performance7d || '0'),
            performance30d: parseFloat(s.performance30d || '0'),
            features: s.features || [],
            isActive: s.isActive !== false
          })))
        }
      } catch (err) {
        setError('Failed to load strategies from blockchain.'); setStrategies([])
      } finally { setLoading(false) }
    }
    loadStrategies()
  }, [])

  useEffect(() => {
    let filtered = strategies.filter(s =>
      (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === 'all' || s.category === selectedCategory) &&
      (selectedRisk === 'all' || s.riskLevel.toString() === selectedRisk) && s.isActive
    )
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'expectedAPY': return b.expectedAPY - a.expectedAPY
        case 'tvl': return b.tvl - a.tvl
        case 'participants': return b.participants - a.participants
        case 'performance30d': return b.performance30d - a.performance30d
        default: return 0
      }
    })
    setFilteredStrategies(filtered)
  }, [strategies, searchTerm, selectedCategory, selectedRisk, sortBy])

  const handleInvestClick = async (strategy: VaultStrategy) => {
    if (!isConnected) { alert('Please connect your wallet first'); return }
    const params = new URLSearchParams({ create: 'true', strategy: strategy.id, name: strategy.name, minDeposit: strategy.minDeposit.toString() })
    router.push(`/dashboard?${params.toString()}`)
  }

  const getCategoryIcon = (category: string, size = 16) => {
    switch (category) {
      case 'liquid-staking': return <Shield style={{ width: size, height: size }} />
      case 'yield-farming': return <TrendingUp style={{ width: size, height: size }} />
      case 'lending': return <DollarSign style={{ width: size, height: size }} />
      case 'arbitrage': return <Zap style={{ width: size, height: size }} />
      default: return <Shield style={{ width: size, height: size }} />
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', background: 'radial-gradient(ellipse at center, rgba(0,239,139,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: 64 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 24px' }}>
              <div style={{ position: 'absolute', inset: 0, border: '3px solid rgba(0,239,139,0.08)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', inset: 0, border: '3px solid transparent', borderTopColor: '#00EF8B', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
            <p className="dash-label" style={{ color: '#00EF8B', animation: 'pulse 2s infinite' }}>Loading Strategies...</p>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dash-page-header">
            <h1>Vault Strategies</h1>
            <p style={{ fontSize: '1rem', color: 'rgba(250,248,245,0.55)', marginTop: 12, fontWeight: 500 }}>
              Proven DeFi strategies powered by Flow blockchain smart contracts
            </p>

            <div className="dash-card" style={{ padding: 20, marginTop: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#00EF8B', marginBottom: 8 }}>
                <Shield style={{ width: 16, height: 16 }} />
                <span className="dash-label" style={{ color: '#00EF8B' }}>Real Blockchain Strategies</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'rgba(250,248,245,0.55)', lineHeight: 1.6, margin: 0 }}>
                All strategies are powered by deployed smart contracts on Flow Testnet.
                {!isConnected && ' Connect your wallet to create vaults.'}
              </p>
            </div>

            {error && (
              <div style={{ padding: 20, marginTop: 16, borderRadius: 20, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#ef4444' }}>{error}</p>
              </div>
            )}

            {strategies.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 32 }}>
                {[
                  { label: 'Total Value Locked', value: formatCurrency(strategies.reduce((s, v) => s + v.tvl, 0)) },
                  { label: 'Available Strategies', value: strategies.length.toString() },
                  { label: 'Total Users', value: strategies.reduce((s, v) => s + v.participants, 0).toLocaleString() },
                  { label: 'Highest APY', value: `${Math.max(...strategies.map(v => v.expectedAPY)).toFixed(1)}%` },
                ].map((stat, i) => (
                  <div key={i} className="dash-stat" style={{ padding: '24px 20px' }}>
                    <div className="dash-value" style={{ fontSize: '1.5rem' }}>{stat.value}</div>
                    <div className="dash-label" style={{ marginTop: 4 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="dash-card" style={{ padding: 24, marginBottom: 40 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(250,248,245,0.3)' }} />
                <input type="text" placeholder="Search strategies..." value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)} className="dash-input" style={{ paddingLeft: 44 }} />
              </div>
              {[
                { value: selectedCategory, onChange: setSelectedCategory, options: categories },
                { value: selectedRisk, onChange: setSelectedRisk, options: riskLevels },
                { value: sortBy, onChange: setSortBy, options: sortOptions },
              ].map((sel, i) => (
                <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)} className="dash-select">
                  {sel.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ))}
            </div>
          </motion.div>

          {filteredStrategies.some(v => v.featured) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: 40 }}>
              <h2 className="dash-label" style={{ fontSize: '1.25rem', color: '#FAF8F5', marginBottom: 24 }}>Featured Strategies</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                {filteredStrategies.filter(s => s.featured).map((strategy, index) => (
                  <motion.div key={strategy.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.1 }}>
                    <div className="dash-card" style={{ padding: 32, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: 20,
                            background: 'rgba(0,239,139,0.08)',
                            border: '1px solid rgba(0,239,139,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#00EF8B',
                          }}>{getCategoryIcon(strategy.category, 20)}</div>
                          <div>
                            <h3 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: '1rem', fontWeight: 500, color: '#FAF8F5', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
                              {strategy.name}
                              {strategy.verified && <Star style={{ width: 14, height: 14, color: '#00EF8B', fill: '#00EF8B', marginLeft: 6, display: 'inline' }} />}
                            </h3>
                            <p className="dash-label">{strategy.creator}</p>
                          </div>
                        </div>
                        <span className={`dash-badge ${strategy.riskLevel === 1 ? 'dash-badge-green' : strategy.riskLevel === 2 ? 'dash-badge-cyan' : 'dash-badge-muted'}`}>
                          {strategy.riskLevel === 1 ? 'Low' : strategy.riskLevel === 2 ? 'Medium' : 'High'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'rgba(250,248,245,0.55)', marginBottom: 24, lineHeight: 1.6 }}>{strategy.description}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                        <div><div className="dash-value" style={{ fontSize: '1.25rem', color: '#00EF8B' }}>{strategy.expectedAPY.toFixed(1)}%</div><div className="dash-label">APY</div></div>
                        <div><div className="dash-value" style={{ fontSize: '1rem' }}>{formatCurrency(strategy.tvl)}</div><div className="dash-label">TVL</div></div>
                        <div><div style={{ fontSize: '1rem', fontWeight: 500, color: '#00EF8B', fontVariantNumeric: 'tabular-nums' }}>{strategy.participants.toLocaleString()}</div><div className="dash-label">Users</div></div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid rgba(250,248,245,0.06)' }}>
                        <div className="dash-label">Min: {strategy.minDeposit} FLOW</div>
                        <button onClick={() => handleInvestClick(strategy)} className="dash-cta" style={{ padding: '12px 24px', fontSize: '0.625rem' }}>
                          {isConnected ? 'Create Vault' : 'Connect Wallet'} <ArrowUpRight style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="dash-label" style={{ fontSize: '1.25rem', color: '#FAF8F5', marginBottom: 24 }}>All Strategies</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
              {filteredStrategies.filter(s => !s.featured).map((strategy, index) => (
                <motion.div key={strategy.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + index * 0.05 }}>
                  <div className="dash-card" style={{ padding: 24, cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 16,
                          background: 'rgba(0,239,139,0.06)',
                          border: '1px solid rgba(0,239,139,0.12)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#00EF8B',
                        }}>{getCategoryIcon(strategy.category, 16)}</div>
                        <div>
                          <h3 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: '0.8125rem', fontWeight: 500, color: '#FAF8F5', margin: 0, textTransform: 'uppercase' }}>
                            {strategy.name}
                            {strategy.verified && <Star style={{ width: 10, height: 10, color: '#00EF8B', fill: '#00EF8B', marginLeft: 4, display: 'inline' }} />}
                          </h3>
                          <p className="dash-label">{strategy.creator}</p>
                        </div>
                      </div>
                      <span className={`dash-badge ${strategy.riskLevel === 1 ? 'dash-badge-green' : strategy.riskLevel === 2 ? 'dash-badge-cyan' : 'dash-badge-muted'}`}>
                        {strategy.riskLevel === 1 ? 'Low' : strategy.riskLevel === 2 ? 'Medium' : 'High'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(250,248,245,0.55)', marginBottom: 16, lineHeight: 1.6, flex: 1 }}>{strategy.description}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <div><div className="dash-value" style={{ fontSize: '1rem', color: '#00EF8B' }}>{strategy.expectedAPY.toFixed(1)}%</div><div className="dash-label">APY</div></div>
                      <div><div className="dash-value" style={{ fontSize: '0.875rem' }}>{formatCurrency(strategy.tvl)}</div><div className="dash-label">TVL</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users style={{ width: 12, height: 12 }} />{strategy.participants.toLocaleString()}
                      </div>
                      <div className="dash-label">Min: {strategy.minDeposit} FLOW</div>
                    </div>
                    <button onClick={() => handleInvestClick(strategy)} className="dash-cta" style={{ width: '100%', padding: '12px 0', fontSize: '0.625rem' }}>
                      {isConnected ? 'Create Vault' : 'Connect Wallet'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {filteredStrategies.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              {/* Only show the icon when strategies were loaded (filtering returned nothing), hide on first load */}
              {strategies.length > 0 && (
                <div style={{ width: 64, height: 64, borderRadius: 24, border: '1px solid rgba(250,248,245,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', background: 'rgba(250,248,245,0.02)' }}>
                  <Search style={{ width: 32, height: 32, color: 'rgba(250,248,245,0.2)' }} />
                </div>
              )}
              <p className="dash-label" style={{ marginBottom: 24 }}>
                {strategies.length === 0 ? 'No strategies on blockchain' : 'No strategies match your criteria'}
              </p>
              {strategies.length > 0 && (
                <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSelectedRisk('all') }} className="dash-cta" style={{ padding: '12px 24px' }}>
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
