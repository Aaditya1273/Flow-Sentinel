'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Shield,
  Zap,
  DollarSign,
  Clock,
  AlertTriangle,
  Plus,
  Settings,
  Activity,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  Target
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from 'components/layout/Navbar'
import { VaultCard } from 'components/dashboard/VaultCard'
import { PortfolioChart } from 'components/dashboard/PortfolioChart'
import { ActivityFeed } from 'components/dashboard/ActivityFeed'
import { CreateVaultModal } from 'components/dashboard/CreateVaultModal'
import { useFlow } from 'lib/flow'
import { useVaultData } from 'hooks/useVaultData'
import { formatCurrency, formatPercentage } from 'lib/utils'
import { Badge } from 'components/ui/badge'

import { Suspense } from 'react'

function DashboardContent() {
  const { user, logIn, isConnected } = useFlow()
  const { vaults, performance, flowBalance, loading, error, refetch } = useVaultData()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isConnected && !loading) {
      router.push('/')
    }
  }, [isConnected, loading, mounted, router])

  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreateModal(true)
    }
  }, [searchParams])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[120px] rounded-full" />

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
              Access the Sentinel Command Center by establishing a secure link with your Flow wallet.
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
            <p className="text-sm font-black uppercase tracking-[0.2em] text-primary animate-pulse">Establishing Secure Link...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show create vault interface if no vault exists
  if (vaults.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full" />
        <Navbar />
        <div className="flex items-center justify-center min-h-screen pt-16 relative z-10">
          <div className="text-center max-w-xl px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-20 h-20 glass rounded-3xl flex items-center justify-center mx-auto mb-8 bg-primary/5 border-primary/20"
            >
              <Target className="w-10 h-10 text-primary" />
            </motion.div>
            <h1 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">
              Deploy Your Sentinel
            </h1>
            <p className="text-muted-foreground mb-10 leading-relaxed font-medium">
              Your command center is ready. Initialize your first autonomous vault to start capturing on-chain growth through Flow's native DeFi protocols.
            </p>

            <div className="tool-card p-10 mb-10 border-0 glass relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative z-10">
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">
                  Available Capital
                </div>
                <div className="text-5xl font-black text-white mb-2 tracking-tighter financial-number">
                  {formatCurrency(flowBalance)}
                </div>
                <div className="text-xs font-bold text-muted-foreground uppercase opacity-50">Flow Token (Testnet)</div>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(0,239,139,0.2)] hover:shadow-[0_10px_50px_rgba(0,239,139,0.4)] transition-all"
            >
              Initialize First Vault
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showCreateModal && (
            <CreateVaultModal
              onClose={() => setShowCreateModal(false)}
              onSuccess={() => refetch()}
              preselectedStrategy={searchParams.get('strategy') || undefined}
            />
          )}
        </AnimatePresence>
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
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Protocol Active</span>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                  Command Center
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary flex items-center h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Vault
                </button>

                <button className="glass border-white/5 hover:bg-white/10 flex items-center h-12 px-4 rounded-xl transition-all">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {[
              {
                label: 'TOTAL NET ASSET VALUE',
                value: formatCurrency(performance?.totalBalance || 0),
                sub: performance?.totalPnlPercent ? formatPercentage(performance.totalPnlPercent) : '+0%',
                icon: DollarSign,
                color: 'text-primary'
              },
              {
                label: 'AVAILABLE CAPITAL',
                value: formatCurrency(flowBalance),
                sub: 'Ready for Deployment',
                icon: TrendingUp,
                color: 'text-secondary'
              },
              {
                label: 'MANAGED SENTINELS',
                value: vaults.length.toString(),
                sub: 'Secured & Active',
                icon: Shield,
                color: 'text-primary'
              },
              {
                label: 'TOTAL CAPTURED PNL',
                value: formatCurrency(performance?.totalPnl || 0),
                sub: 'Across All Vaults',
                icon: Target,
                color: 'text-white'
              }
            ].map((stat, i) => (
              <div key={i} className="tool-card p-8 border-0 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <stat.icon className={`w-12 h-12 ${stat.color}`} />
                </div>
                <div className="relative z-10">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
                    {stat.label}
                  </div>
                  <div className="text-3xl font-black text-white mb-2 tracking-tighter financial-number">
                    {stat.value}
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${stat.color} flex items-center gap-1.5`}>
                    {stat.sub}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Vault Section */}
            <div className="lg:col-span-2 space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                    Managed Sentinels
                  </h2>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    SORT BY <ChevronRight className="w-3 h-3 rotate-90" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {vaults.map((v) => (
                    <VaultCard
                      key={v.id}
                      vault={{
                        id: v.id,
                        name: v.name,
                        balance: v.balance,
                        apy: 8.5,
                        status: v.isActive ? 'active' : 'paused',
                        lastExecution: new Date(v.lastExecution * 1000),
                        strategy: v.strategy,
                        risk: 'low' as const,
                        pnl: v.pnl,
                        pnlPercent: v.pnlPercent
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Portfolio Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="tool-card p-10 border-0 glass overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                    Strategic Projection
                  </h3>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black px-3 py-1">
                    REAL-TIME UPDATES
                  </Badge>
                </div>
                <PortfolioChart />
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-10">
              {/* Activity Feed */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <ActivityFeed />
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="tool-card p-8 border-0 glass relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8">
                  Fast Actions
                </h3>

                <div className="space-y-4">
                  {[
                    { icon: Plus, label: 'DEPLOY NEW VAULT', action: () => setShowCreateModal(true) },
                    { icon: ArrowUpRight, label: 'EXTERNAL BRIDGE', action: () => { } },
                    { icon: Activity, label: 'GENERATE AUDIT', action: () => { } },
                  ].map((act, i) => (
                    <button
                      key={i}
                      onClick={act.action}
                      className="w-full flex items-center justify-between p-4 glass hover:bg-white/5 border-white/5 hover:border-white/20 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 glass rounded-xl flex items-center justify-center bg-white/5 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                          <act.icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{act.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Security Guard */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="tool-card p-8 border-0 bg-primary/5 border-primary/10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Protocol Guard</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  Your Sentinels are currently protected by Flow Native VRF Jitter and Biometric Passkeys.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase">
                    <span className="text-muted-foreground">Encryption</span>
                    <span className="text-primary">SHA-256</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase">
                    <span className="text-muted-foreground">MEV Shield</span>
                    <span className="text-primary">100% Active</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 p-6 glass border-destructive/20 bg-destructive/5 rounded-2xl flex items-center gap-4"
            >
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-[10px] font-black text-destructive uppercase tracking-widest">System Warning</p>
                <p className="text-sm font-bold text-white">{error}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <CreateVaultModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => refetch()}
            preselectedStrategy={searchParams.get('strategy') || undefined}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen pt-16">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-primary animate-pulse">Initializing System...</p>
          </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
