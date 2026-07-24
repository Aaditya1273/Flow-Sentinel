'use client'

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
import { ClientOnly } from 'components/ClientOnly'
import { formatCurrency } from 'lib/utils'
import { useActivityFeed } from 'hooks/useActivityFeed'

export function ActivityFeed() {
  const { activities, loading } = useActivityFeed()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowUpRight style={{ width: 20, height: 20, color: '#00EF8B' }} />
      case 'withdrawal': return <ArrowDownLeft style={{ width: 20, height: 20, color: '#ef4444' }} />
      case 'execution': return <Zap style={{ width: 20, height: 20, color: '#37DDDF' }} />
      case 'success': return <TrendingUp style={{ width: 20, height: 20, color: '#00EF8B' }} />
      case 'vault_created': return <Shield style={{ width: 20, height: 20, color: '#00EF8B' }} />
      case 'alert': return <Shield style={{ width: 20, height: 20, color: '#FAF8F5' }} />
      default: return <Clock style={{ width: 20, height: 20 }} />
    }
  }

  if (loading) {
    return (
      <div className="dash-card" style={{ padding: 24 }}>
        <h3 className="dash-label" style={{ fontSize: '1.25rem', marginBottom: 32 }}>SECURE LOGS</h3>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <div className="dash-skeleton dash-skeleton-text" />
              <div className="dash-skeleton dash-skeleton-text short" />
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
                      {activity.title}
                    </p>
                    {activity.transactionId && (
                      <span style={{
                        fontSize: '0.4375rem', fontWeight: 500, letterSpacing: '0.08em',
                        color: 'rgba(250,248,245,0.3)', fontFamily: 'monospace',
                      }}>
                        {activity.transactionId.slice(0, 10)}...
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'rgba(250,248,245,0.25)' }}>
                      {activity.description}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'rgba(250,248,245,0.25)' }}>
                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}  •  {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                      {activity.amount && (
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, fontVariantNumeric: 'tabular-nums',
                          color: (activity.type === 'deposit' || activity.type === 'success') ? '#00EF8B' : '#ef4444',
                        }}>
                          {(activity.type === 'deposit' || activity.type === 'success') ? '+' : '-'}
                          {formatCurrency(activity.amount)}
                        </span>
                      )}
                    </div>
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
