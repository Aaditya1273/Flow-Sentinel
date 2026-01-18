'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  ArrowUpRight,
  ArrowDownLeft,
  Target,
  Shield,
  ChevronRight,
  Info
} from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
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
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
        <Navbar />
        <div className="flex items-center justify-center min-h-screen pt-16 relative z-10">
          <div className="text-center max-w-lg px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-20 h-20 glass rounded-3xl flex items-center justify-center mx-auto mb-8 bg-primary/5 border-primary/20 shadow-[0_0_30px_rgba(0,239,139,0.1)]"
            >
              <Shield className="w-10 h-10 text-primary" />
            </motion.div>
            <h1 className="text-4xl font-black mb-4 tracking-tighter text-white uppercase italic">
              Authentication Required
            </h1>
            <p className="text-muted-foreground mb-10 leading-relaxed font-medium">
              Access your Portfolio Analytics by establishing a secure link with your Flow wallet.
            </p>
            <button
              onClick={logIn}
              className="btn-primary px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest"
            >
              Connect Flow Wallet
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen pt-16">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-primary animate-pulse">Analyzing Assets...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[40%] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      <Navbar />

      <div className="pt-32 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Live Analytics</span>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                  Portfolio Analytics
                </h1>
              </div>

              <div className="flex items-center gap-2 p-1.5 glass rounded-xl border-white/5 bg-white/5">
                {timeframes.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === tf.value
                        ? 'bg-primary text-black shadow-[0_0_20px_rgba(0,239,139,0.3)]'
                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Core Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <div className="lg:col-span-2 tool-card p-10 border-0 glass relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <BarChart3 className="w-32 h-32 text-primary" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Total Managed Assets</div>
                    <div className="text-6xl font-black text-white tracking-tighter mb-2 italic">
                      {formatCurrency(performance?.totalBalance || 0)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-primary mb-1 justify-end">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xl font-black italic tracking-tighter">
                        {formatPercentage(performance?.totalPnlPercent || 8.42)}
                      </span>
                    </div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Across All Strategies</div>
                  </div>
                </div>

                <div className="h-48 flex items-end gap-3 mt-10">
                  {[40, 60, 45, 70, 55, 90, 80, 100, 85, 95, 75, 110].map((h, i) => (
                    <div key={i} className="flex-1 group relative">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 1 }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${i === 11 ? 'bg-primary shadow-[0_0_20px_rgba(0,239,139,0.4)]' : 'bg-white/10 group-hover:bg-primary/30'
                          }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="tool-card p-8 border-0 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center bg-secondary/10 text-secondary">
                    <Activity className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-black tracking-widest border-secondary/20 text-secondary italic">OPTIMIZED</Badge>
                </div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Health Index</div>
                <div className="text-4xl font-black text-white mb-2 tracking-tighter italic">98.4 / 100</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocol Integrity Normal</div>
              </div>

              <div className="tool-card p-8 border-0 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
                    <Shield className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-black tracking-widest border-primary/20 text-primary italic">SECURED</Badge>
                </div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Asset Exposure</div>
                <div className="text-4xl font-black text-white mb-2 tracking-tighter italic">LOW RISK</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">VRF Jitter Enabled</div>
              </div>
            </div>
          </div>

          {/* Allocation Table */}
          <div className="tool-card p-10 border-0 glass overflow-hidden relative">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                Strategy Allocation
              </h3>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground hover:text-white transition-all tracking-widest">
                  <Download className="w-4 h-4" /> EXPORT REPORT
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Sentinel / Strategy</th>
                    <th className="pb-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Current Value</th>
                    <th className="pb-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Total Yield</th>
                    <th className="pb-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Allocation</th>
                    <th className="pb-6 text-right text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vaults.map((vault) => (
                    <tr key={vault.id} className="group hover:bg-white/[0.02] transition-all">
                      <td className="py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 glass rounded-xl flex items-center justify-center bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-black text-white uppercase tracking-tighter">{vault.name}</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{vault.strategy}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-8">
                        <div className="text-lg font-black text-white tracking-tighter italic">{formatCurrency(vault.balance)}</div>
                      </td>
                      <td className="py-8">
                        <div className="flex items-center gap-2 text-primary">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span className="text-sm font-bold tracking-tighter">{formatCurrency(vault.pnl || 0)}</span>
                        </div>
                      </td>
                      <td className="py-8">
                        <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(vault.balance / (performance?.totalBalance || 1)) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-8 text-right">
                        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all">
                          DETAILS <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {vaults.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="max-w-xs mx-auto">
                          <Info className="w-8 h-8 text-muted-foreground mx-auto mb-4 opacity-20" />
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No active sentinels detected in portfolio</p>
                        </div>
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