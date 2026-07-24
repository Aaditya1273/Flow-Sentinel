'use client'

import React from 'react'
import { useFlow } from 'lib/flow'
import { FlowService } from 'lib/flow-service'
import { errorReporter } from '@/lib/sentry-wrapper'

export interface Activity {
  id: string
  type: 'deposit' | 'withdrawal' | 'execution' | 'success' | 'vault_created' | 'alert' | 'default'
  title: string
  description: string
  timestamp: number
  transactionId?: string
  amount?: number
  vault?: string
}

interface ActivityContextValue {
  activities: Activity[]
  loading: boolean
  addActivity: (activity: { type: string; title: string; description: string; amount?: number; vault?: string; transactionId?: string }) => void
  refetch: () => Promise<void>
}

const ActivityContext = React.createContext<ActivityContextValue | undefined>(undefined)

export function ActivityProvider(props: { children: React.ReactNode }) {
  const { user, isConnected } = useFlow()
  const [activities, setActivities] = React.useState<Activity[]>([])
  const [loading, setLoading] = React.useState(false)

  const fetchActivities = React.useCallback(async () => {
    if (!user.addr || !isConnected) {
      setActivities([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const events = await FlowService.getVaultEvents(user.addr)
      const mapped: Activity[] = []
      const slice = events.slice(-50)
      for (let i = 0; i < slice.length; i++) {
        const event = slice[i]
        const ts = event.timestamp * 1000
        const amt = event.amount
        if (event.type === 'created') {
          mapped.push({ id: 'evt-' + i + '-created-' + event.timestamp, type: 'vault_created', title: 'Vault Created', description: 'Vault #' + event.vaultId + ' initialized', timestamp: ts, amount: amt })
        } else if (event.type === 'deposit') {
          mapped.push({ id: 'evt-' + i + '-deposit-' + event.timestamp, type: 'deposit', title: 'Deposit Confirmed', description: 'Vault #' + event.vaultId, timestamp: ts, amount: amt })
        } else {
          mapped.push({ id: 'evt-' + i + '-withdraw-' + event.timestamp, type: 'withdrawal', title: 'Withdrawal Processed', description: 'Vault #' + event.vaultId, timestamp: ts, amount: amt })
        }
      }
      mapped.reverse()
      if (mapped.length === 0) {
        mapped.push({
          id: 'welcome-' + Date.now(),
          type: 'alert',
          title: 'System Ready',
          description: 'No vault activity yet. Create a vault to get started.',
          timestamp: Date.now(),
        })
      }
      setActivities(mapped)
    } catch (error) {
      errorReporter.captureException(error, { component: 'ActivityProvider', action: 'fetchActivities' })
      setActivities([{
        id: 'error-' + Date.now(),
        type: 'alert',
        title: 'Connection Issue',
        description: 'Unable to fetch vault activity. Please check your connection.',
        timestamp: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }, [user.addr, isConnected])

  React.useEffect(() => { fetchActivities() }, [fetchActivities])

  React.useEffect(() => {
    if (!isConnected) return
    const interval = setInterval(fetchActivities, 60000)
    return () => clearInterval(interval)
  }, [fetchActivities, isConnected])

  const addActivityCb = React.useCallback((input: { type: string; title: string; description: string; amount?: number; vault?: string; transactionId?: string }) => {
    const newItem: Activity = {
      id: 'manual-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      type: input.type as Activity['type'],
      title: input.title,
      description: input.description,
      timestamp: Date.now(),
      amount: input.amount,
      vault: input.vault,
      transactionId: input.transactionId,
    }
    setActivities(prev => {
      const next = [newItem, ...prev]
      return next.slice(0, 100)
    })
  }, [])

  return React.createElement(
    ActivityContext.Provider,
    { value: { activities, loading, addActivity: addActivityCb, refetch: fetchActivities } },
    props.children
  )
}

export function useActivityFeed(): ActivityContextValue {
  const context = React.useContext(ActivityContext)
  if (context === undefined) {
    throw new Error('useActivityFeed must be used within an ActivityProvider')
  }
  return context
}
