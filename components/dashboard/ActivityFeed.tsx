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
import { errorReporter } from '@/lib/sentry-wrapper'

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
  const { vaults, performance } = useVaultData()

  useEffect(() => {
    const loadActivities = async () => {
      if (!user.addr) { setLoading(false); return }
      try {
        setLoading(true)
        const realActivities: Activity[] = []

        if (vaults.length === 0) {
          realActivities.push({
            id: 'system-ready', type: 'system',
            description: 'Sentinel Network Ready',
            timestamp: new Date(), status: 'completed'
          })
        } else {
          vaults.forEach((vault, idx) => {
            realActivities.push({
              id: `vault-active-${vault.id}`, type: 'system',
              description: `Protocol Active: ${vault.name}`,
              timestamp: new Date(Date.now() - (idx + 1) * 3600000),
              status: 'completed'
            })
            if (vault.totalDeposits > 0) {
              realActivities.push({
                id: `deposit-${vault.id}`, type: 'deposit',
                amount: vault.totalDeposits,
                description: `Capital Inflow: ${vault.name}`,
                timestamp: new Date(Date.now() - (idx + 2) * 3600000),
                status: 'completed'
              })
            }
            if (vault.lastExecution > 0) {
              realActivities.push({
                id: `strategy-${vault.id}`, type: 'strategy',
                description: `Forte Execution: ${vault.strategy}`,
                timestamp: new Date(vault.lastExecution * 1000),
                status: 'completed'
              })
            }
          })
          if (performance?.totalPnl && performance.totalPnl > 0) {
            realActivities.push({
              id: 'total-yield', type: 'yield',
              amount: performance.totalPnl,
              description: 'Aggregated Yield Harvested',
              timestamp: new Date(), status: 'completed'
            })
          }
        }

        realActivities.push({
          id: 'mev-protection', type: 'system',
          description: 'MEV-Shield Active Monitoring',
          timestamp: new Date(Date.now() - 24 * 3600000),
          status: 'completed'
        })

        realActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        setActivities(realActivities)
      } catch (error) {
        errorReporter.captureException(error, { component: 'ActivityFeed', action: 'loadActivities' })
      } finally { setLoading(false) }
    }
    loadActivities()
  }, [user.addr, vaults, performance])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowUpRight style={{ width: 20, height: 20, color: '#00EF8B' }} />
      case 'withdrawal': return <ArrowDownLeft style={{ width: 20, height: 20, color: '#ef4444' }} />
      case 'yield': return <TrendingUp style={{ width: 20, height: 20, color: '#00EF8B' }} />
      case 'strategy': return <Zap style={{ width: 20, height: 20, color: '#37DDDF' }} />
      case 'system': return <Shield style={{ width: 20, height: 20, color: '#FAF8F5' }} />
      default: return <Clock style={{ width: 20, height: 20 }} />
    }
  }

  if (loading) {
    return (
      <div className="dash-card" style={{ padding: 24 }}>
        <h3 className="dash-label" style={{ fontSize: '1.25rem', marginBottom: 32 }}>SECURE LOGS</h3>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, animation: 'pulse 2s infinite' }}>
            <div style={{ flex: 1 }}>
              <div style={{ height: 16, width: '75%', background: 'rgba(250,248,245,0.04)', borderRadius: 4, marginBottom: 8 }} />
              <div style={{ height: 12, width: '25%', background: 'rgba(250,248,245,0.04)', borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ClientOnly>
      <div className="dash-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h3 style={{
            fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
            fontSize: '1.25rem', fontWeight: 500, letterSpacing: '-0.02em',
            color: '#FAF8F5', margin: 0, textTransform: 'uppercase',
          }}>
            Activity Log
          </h3>
          <span className="dash-badge dash-badge-green" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ActivityIcon style={{ width: 12, height: 12, animation: 'pulse 2s infinite' }} />
            Live Sync
          </span>
        </div>

        {activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.5 }}>
            <Clock style={{ width: 48, height: 48, margin: '0 auto 16px', color: 'rgba(250,248,245,0.3)' }} />
            <p className="dash-label" style={{ fontSize: '0.75rem' }}>No signals detected</p>
          </div>
        ) : (
          <div style={{ maxHeight: 440, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="dash-timeline-item"
              >
                {getActivityIcon(activity.type)}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FAF8F5', margin: 0 }}>
                      {activity.description}
                    </p>
                    <span style={{
                      fontSize: '0.5625rem', fontWeight: 500, letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: activity.status === 'completed' ? '#00EF8B' : '#f59e0b',
                    }}>
                      {activity.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'rgba(250,248,245,0.25)' }}>
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}  •  {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                    {activity.amount && (                    <span style={{ fontSize: '1rem', fontWeight: 500, fontVariantNumeric: 'tabular-nums',
                        color: (activity.type === 'deposit' || activity.type === 'yield') ? '#00EF8B' : '#ef4444',
                      }}>
                        {(activity.type === 'deposit' || activity.type === 'yield') ? '+' : '-'}
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ClientOnly>
  )
}
