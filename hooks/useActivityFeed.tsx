// ── Activity Feed ──
// Shared context for live blockchain activity.
// Cadence scripts and FCL types imported from lib/addresses + lib/cadence/scripts.

import '@/lib/storage-polyfill'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useFlow } from 'lib/flow'
import * as fcl from '@onflow/fcl'
import { errorReporter } from '@/lib/sentry-wrapper'
import { SENTINEL_VAULT_ADDRESS, stripAddress } from 'lib/addresses'
import { GET_USER_VAULT_IDS, GET_VAULT_LIST } from 'lib/cadence/scripts'

export interface Activity {
  id: string
  type: 'deposit' | 'withdrawal' | 'execution' | 'alert' | 'success' | 'vault_created'
  title: string
  description: string
  amount?: number
  timestamp: Date
  vault?: string
  transactionId?: string
}

interface ActivityContextType {
  activities: Activity[]
  loading: boolean
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void
  refetch: () => void
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined)

export function ActivityProvider({ children }: { children: ReactNode }) {
  const { user } = useFlow()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [refetchCounter, setRefetchCounter] = useState(0)

  useEffect(() => {
    if (!user.loggedIn || !user.addr) {
      setActivities([])
      return
    }

    let cancelled = false

    const fetchData = async () => {
      setLoading(true)
      try {
        const addr = user.addr!
        const items: Activity[] = []

        // Step 1: Get user's vault IDs to scope event filtering
        const userVaultIds = new Set<string>()
        let vaultList: Array<Record<string, unknown>> = []
        try {
          const ids = (await fcl.query({
            cadence: GET_USER_VAULT_IDS,
            args: (arg: (v: unknown, t: unknown) => unknown, t: { Address: unknown }) => [arg(addr, t.Address)],
          })) as Array<{ toString: () => string }> | undefined
          ids?.forEach((id) => userVaultIds.add(String(id)))

          const list = (await fcl.query({
            cadence: GET_VAULT_LIST,
            args: (arg: (v: unknown, t: unknown) => unknown, t: { Address: unknown }) => [arg(addr, t.Address)],
          })) as Array<Record<string, unknown>>
          vaultList = list || []
        } catch { /* no vaults yet */ }

        // Step 2: Query blockchain events scoped to user's vaults
        if (userVaultIds.size > 0) {
          const latestBlock = await fcl.block({ sealed: true })
          const startHeight = Math.max(0, latestBlock.height - 100000)
          const strippedAddr = stripAddress(SENTINEL_VAULT_ADDRESS)

          const eventTypes = [
            `A.${strippedAddr}.SentinelVaultFinal.VaultCreated`,
            `A.${strippedAddr}.SentinelVaultFinal.DepositMade`,
            `A.${strippedAddr}.SentinelVaultFinal.WithdrawalMade`,
            `A.${strippedAddr}.SentinelVaultFinal.StrategyExecuted`,
            `A.${strippedAddr}.SentinelVaultFinal.YieldClaimed`,
          ]

          for (const eventType of eventTypes) {
            try {
              const result = await fcl.send([fcl.getEventsAtBlockHeightRange(eventType, startHeight, latestBlock.height)])
              const decoded = await fcl.decode(result)
              if (decoded && Array.isArray(decoded)) {
                for (const event of decoded) {
                  const data = event.data
                  const vaultIdStr = String(data.vaultId ?? data.id ?? '')
                  if (!userVaultIds.has(vaultIdStr)) continue

                  const ts = event.blockTimestamp ? new Date(event.blockTimestamp) : new Date()

                  if (eventType.includes('VaultCreated')) {
                    items.push({
                      id: `created-${event.blockHeight}`,
                      type: 'vault_created',
                      title: 'Vault Deployed',
                      description: `Sentinel vault created: ${data.name || `#${vaultIdStr}`}`,
                      timestamp: ts,
                      vault: data.name || `Vault #${vaultIdStr}`,
                      transactionId: event.transactionId,
                    })
                  } else if (eventType.includes('DepositMade')) {
                    const amount = parseFloat(data.amount || '0')
                    items.push({
                      id: `deposit-${event.blockHeight}`,
                      type: 'deposit',
                      title: 'Capital Injected',
                      description: `Deposited ${amount.toFixed(2)} FLOW`,
                      amount,
                      timestamp: ts,
                      vault: `Vault #${vaultIdStr}`,
                      transactionId: event.transactionId,
                    })
                  } else if (eventType.includes('WithdrawalMade')) {
                    const amount = parseFloat(data.amount || '0')
                    items.push({
                      id: `withdraw-${event.blockHeight}`,
                      type: 'withdrawal',
                      title: 'Funds Extracted',
                      description: `Withdrew ${amount.toFixed(2)} FLOW`,
                      amount,
                      timestamp: ts,
                      vault: `Vault #${vaultIdStr}`,
                      transactionId: event.transactionId,
                    })
                  } else if (eventType.includes('StrategyExecuted')) {
                    const yieldGen = parseFloat(data.yieldGenerated || '0')
                    items.push({
                      id: `strategy-${event.blockHeight}`,
                      type: 'execution',
                      title: 'Forte Executed',
                      description: yieldGen > 0 ? `Generated ${yieldGen.toFixed(6)} FLOW yield` : 'Executed (no yield this cycle)',
                      amount: yieldGen > 0 ? yieldGen : undefined,
                      timestamp: ts,
                      vault: `Vault #${vaultIdStr}`,
                      transactionId: event.transactionId,
                    })
                  } else if (eventType.includes('YieldClaimed')) {
                    const amount = parseFloat(data.amount || '0')
                    items.push({
                      id: `yield-${event.blockHeight}`,
                      type: 'success',
                      title: 'Yield Harvested',
                      description: `Claimed ${amount.toFixed(6)} FLOW profit`,
                      amount,
                      timestamp: ts,
                      vault: `Vault #${vaultIdStr}`,
                      transactionId: event.transactionId,
                    })
                  }
                }
              }
            } catch { /* skip event types with no events yet */ }
          }
        }

        // Fallback: show vault statuses if no events found
        if (items.length === 0 && vaultList.length > 0) {
          for (const vault of vaultList) {
            const balance = parseFloat(String(vault.balance ?? '0'))
            const vaultActive = Boolean(vault.isActive)
            if (balance > 0 || vaultActive) {
              items.push({
                id: `vault-${String(vault.id)}`,
                type: 'success',
                title: vaultActive ? 'Vault Active' : 'Vault Paused',
                description: `${String(vault.name)} · ${balance.toFixed(2)} FLOW${vaultActive ? '' : ' · Paused'}`,
                timestamp: new Date(vault.lastExecution ? parseInt(String(vault.lastExecution)) * 1000 : Date.now()),
                vault: String(vault.name),
              })
            }
          }
        }

        if (items.length === 0) {
          items.push({
            id: 'welcome',
            type: 'alert',
            title: 'System Ready',
            description: 'Connected to Flow Testnet. Deploy your first vault to see on-chain activity.',
            timestamp: new Date(),
          })
        }

        items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        if (!cancelled) setActivities(items)
      } catch (error) {
        errorReporter.captureException(error, { component: 'useActivityFeed', action: 'fetchData' })
        if (!cancelled) {
          setActivities([{
            id: 'network-err',
            type: 'alert',
            title: 'Connection Issue',
            description: 'Could not query Flow blockchain. Check your network connection.',
            timestamp: new Date(),
          }])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [user.loggedIn, user.addr, refetchCounter])

  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `local-${Date.now()}`,
      timestamp: new Date(),
    }
    setActivities(prev => [newActivity, ...prev])
  }, [])

  return (
    <ActivityContext.Provider value={{
      activities,
      loading,
      addActivity,
      refetch: () => setRefetchCounter(c => c + 1),
    }}>
      {children}
    </ActivityContext.Provider>
  )
}

export function useActivityFeed() {
  const context = useContext(ActivityContext)
  if (!context) throw new Error('useActivityFeed must be used within an ActivityProvider')
  return context
}
