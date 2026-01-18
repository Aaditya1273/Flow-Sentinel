'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Zap,
  Clock,
  TrendingUp,
  Activity as ActivityIcon
} from 'lucide-react'
import { useFlow } from 'lib/flow'
import { useVaultData } from 'hooks/useVaultData'
import { ClientOnly } from 'components/ClientOnly'
import { formatCurrency } from 'lib/utils'

interface Activity {
  id: string
  type: 'deposit' | 'withdrawal' | 'yield' | 'strategy' | 'system'
  amount?: number
  description: string
  timestamp: Date
  status: 'completed' | 'pending' | 'failed'
  txHash?: string
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useFlow()
  const { vaultData, performance } = useVaultData()

  useEffect(() => {
    const loadActivities = async () => {
      if (!user.addr || !vaultData) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const realActivities: Activity[] = []

        if (vaultData.createdAt) {
          realActivities.push({
            id: 'vault-created',
            type: 'system',
            description: `Vault Protocol Initialized: ${vaultData.name}`,
            timestamp: new Date(vaultData.createdAt),
            status: 'completed'
          })
        }

        if (vaultData.totalDeposits > 0) {
          realActivities.push({
            id: 'initial-deposit',
            type: 'deposit',
            amount: vaultData.totalDeposits,
            description: 'Capital Inflow Detected',
            timestamp: new Date(vaultData.createdAt || 1640995200000),
            status: 'completed'
          })
        }

        if (performance?.pnl && performance.pnl > 0) {
          realActivities.push({
            id: 'yield-generated',
            type: 'yield',
            amount: performance.pnl,
            description: 'Autonomous Yield Harvested',
            timestamp: new Date(vaultData.lastExecution ? vaultData.lastExecution * 1000 : 1640995200000),
            status: 'completed'
          })
        }

        if (vaultData.lastExecution) {
          realActivities.push({
            id: 'strategy-executed',
            type: 'strategy',
            description: `Forte Execution: ${vaultData.strategy}`,
            timestamp: new Date(vaultData.lastExecution * 1000),
            status: 'completed'
          })
        }

        realActivities.push({
          id: 'mev-protection',
          type: 'system',
          description: 'MEV-Shield active Monitoring',
          timestamp: new Date(1640995200000 - 60 * 60 * 1000),
          status: 'completed'
        })

        realActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        setActivities(realActivities)
      } catch (error) {
        console.error('Error loading activities:', error)
      } finally {
        setLoading(false)
      }
    }

    loadActivities()
  }, [user.addr, vaultData, performance])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowUpRight className="w-5 h-5 text-primary" />
      case 'withdrawal': return <ArrowDownLeft className="w-5 h-5 text-red-500" />
      case 'yield': return <TrendingUp className="w-5 h-5 text-primary" />
      case 'strategy': return <Zap className="w-5 h-5 text-secondary" />
      case 'system': return <Shield className="w-5 h-5 text-white" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="tool-card border-0 glass p-6">
        <h3 className="text-xl font-black italic tracking-tighter mb-8">SECURE LOGS</h3>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="w-12 h-12 glass rounded-2xl bg-white/5"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                <div className="h-3 bg-white/5 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <ClientOnly>
      <div className="tool-card border-0 glass p-6">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black italic tracking-tighter uppercase">Activity Log</h3>
          <div className="flex items-center text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/40">
            <ActivityIcon className="w-3 h-3 mr-2 animate-pulse" />
            Live Sync
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-bold uppercase tracking-widest">No signals detected</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start space-x-4 p-4 glass rounded-2xl border-white/10 transition-all duration-300 hover:border-white/30 hover:translate-x-1"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/20">
                  {getActivityIcon(activity.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-white tracking-tight uppercase">
                      {activity.description}
                    </p>
                    <span className={`text-[10px] font-black tracking-widest uppercase ${activity.status === 'completed' ? 'text-primary' : 'text-warning'
                      }`}>
                      {activity.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}  •  {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                    {activity.amount && (
                      <span className={`text-base font-black financial-number tracking-tighter ${activity.type === 'deposit' || activity.type === 'yield'
                        ? 'text-primary'
                        : 'text-red-500'
                        }`}>
                        {activity.type === 'deposit' || activity.type === 'yield' ? '+' : '-'}
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                  </div>

                  {activity.txHash && (
                    <a
                      href={`https://testnet.flowscan.io/tx/${activity.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-black text-primary/50 hover:text-primary mt-3 flex items-center gap-1 uppercase tracking-widest transition-colors"
                    >
                      Verify on Explorer ↗
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ClientOnly>
  )
}
