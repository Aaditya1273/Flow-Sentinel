'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Clock,
  ChevronDown,
  Plus,
  ArrowRight,
  Pause,
  Play,
  Settings,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  Shield,
  Lock,
  ExternalLink,
  ChevronUp,
  Activity
} from 'lucide-react'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
import { Progress } from 'components/ui/progress'
import { formatCurrency, formatPercentage } from 'lib/utils'
import { FlowService } from 'lib/flow-service'
import Link from 'next/link'

interface Vault {
  id: string
  name: string
  balance: number
  apy: number
  status: 'active' | 'paused' | 'creating'
  lastExecution: Date
  strategy: string
  risk: 'low' | 'medium' | 'high'
  pnl?: number
  pnlPercent?: number
}

interface VaultCardProps {
  vault: Vault
}

export function VaultCard({ vault }: VaultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isEpoch = vault.lastExecution.getTime() <= 0 || vault.lastExecution.getFullYear() <= 1970

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-primary/10 text-primary border-primary/40'
      case 'medium': return 'bg-warning/10 text-warning border-warning/40'
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/40'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  const handlePause = async () => {
    try {
      setLoading(true)
      if (vault.status === 'active') {
        await FlowService.pauseVault()
      } else {
        await FlowService.resumeVault()
      }
      window.location.reload()
    } catch (error) {
      console.error('Error toggling vault status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async () => {
    const amount = window.prompt(`Enter FLOW amount to deposit into ${vault.name}:`, '10.0')
    if (!amount || isNaN(Number(amount))) return

    try {
      setLoading(true)
      await FlowService.deposit(Number(amount))
      alert('Deposit successful!')
      window.location.reload()
    } catch (error) {
      console.error('Error depositing:', error)
      alert('Failed to deposit. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    const amount = window.prompt(`Enter FLOW amount to withdraw from ${vault.name}:`, '5.0')
    if (!amount || isNaN(Number(amount))) return

    try {
      setLoading(true)
      await FlowService.withdraw(Number(amount))
      alert('Withdrawal successful!')
      window.location.reload()
    } catch (error) {
      console.error('Error withdrawing:', error)
      alert('Failed to withdraw. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool-card group border-0 p-0 overflow-visible">
      {/* Decorative top border glow */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 glass rounded-2xl flex items-center justify-center bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300`}>
              <Zap className={`w-7 h-7 ${vault.status === 'active' ? 'text-primary fill-primary/20' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-black text-white tracking-tight">{vault.name}</h3>
                <Badge className={`${getRiskBadge(vault.risk)} text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border`}>
                  {vault.risk} RISK
                </Badge>
              </div>
              <p className="text-muted-foreground font-medium text-sm">
                Strategic Protocol: <span className="text-foreground">{vault.strategy}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            <div className="glass-pill border-primary/40 bg-primary/5 text-primary text-[10px] font-black px-3 py-1 flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> FORTE AUTONOMY
            </div>
            <div className="glass-pill border-secondary/40 bg-secondary/5 text-secondary text-[10px] font-black px-3 py-1 flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> MEV-SHIELD ACTIVE
            </div>
            <div className="glass-pill border-white/20 bg-white/5 text-white text-[10px] font-black uppercase px-3 py-1 flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${vault.status === 'active' ? 'bg-primary shadow-[0_0_8px_rgba(0,239,139,0.8)] animate-pulse' : 'bg-warning'}`} />
              {vault.status}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Available Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white financial-number tracking-tighter">
                {formatCurrency(vault.balance)}
              </span>
              <span className="text-xs font-bold text-muted-foreground font-mono uppercase">Flow</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Projected APY</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-primary financial-number tracking-tighter">
                {formatPercentage(vault.apy)}
              </span>
              <span className="text-primary/50 font-bold animate-pulse">▲</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Last Execution</p>
            <div className="flex items-center gap-2 mt-2" suppressHydrationWarning>
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm font-bold text-foreground">
                {mounted ? (isEpoch ? 'NEVER' : vault.lastExecution.toLocaleDateString()) : '---'}
              </span>
              {!isEpoch && mounted && (
                <span className="text-xs text-muted-foreground italic">
                  @{vault.lastExecution.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-6 border-t border-white/15">
          <Button
            className="btn-primary flex-1 min-w-[140px] gap-2 rounded-xl h-12"
            onClick={handleDeposit}
            disabled={loading}
          >
            <Plus className="w-4 h-4" /> Deposit
          </Button>
          <Button
            variant="outline"
            className="btn-secondary transition-all hover:bg-white/10 flex-1 min-w-[140px] gap-2 rounded-xl h-12"
            onClick={handleWithdraw}
            disabled={loading}
          >
            <ArrowDownLeft className="w-4 h-4" /> Withdraw
          </Button>
          <Button
            variant="outline"
            className="btn-secondary transition-all hover:bg-white/10 flex-1 min-w-[140px] gap-2 group/btn rounded-xl h-12"
            disabled={loading}
            onClick={handlePause}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : vault.status === 'active' ? (
              <>
                <Lock className="w-4 h-4 group-hover/btn:text-primary transition-colors" />
                <span>Pause (Passkey)</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 group-hover/btn:text-primary" />
                <span>Resume System</span>
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-xl glass border-white/10 hover:bg-white/10 h-12 w-12 ${isExpanded ? 'bg-white/10' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass rounded-2xl p-6 bg-white/[0.02] border-white/15">
                  <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Real-time Performance
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground font-bold">7D P&L</span>
                      <span className="text-sm font-black text-primary">+12.4 FLOW</span>
                    </div>
                    <Progress value={65} className="h-1 bg-white/5" />
                    <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <span>Liquidity Score</span>
                      <span>94/100</span>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 bg-white/[0.02] border-white/15">
                  <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shield className="w-3 h-3" /> Security Report
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground font-bold">MEV Resistance: </span>
                      <span className="font-black text-white uppercase text-[10px] tracking-widest">Maximum</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground font-bold">Vault Latency: </span>
                      <span className="font-black text-white uppercase text-[10px] tracking-widest">2ms</span>
                    </div>
                    <Link href="#" className="text-[10px] font-black text-primary hover:text-white transition-colors flex items-center gap-1 mt-4 tracking-widest">
                      VIEW AUDIT REPORT <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white/[0.02] px-8 py-4 flex items-center justify-between border-t border-white/10">
        <div className="flex items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          <Settings className="w-3 h-3 mr-2" />
          Protocol Configurations
        </div>
        <div className="flex items-center text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">
          <Shield className="w-3 h-3 mr-2" />
          E2E Encrypted
        </div>
      </div>
    </div>
  )
}
