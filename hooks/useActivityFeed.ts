import '@/lib/storage-polyfill'
import { useState, useEffect } from 'react'
import { useFlow } from 'lib/flow'
import * as fcl from '@onflow/fcl'
import { errorReporter } from '@/lib/sentry-wrapper'

// FCL type helpers (defined locally)
type FCLArg = (value: unknown, type: unknown) => unknown
type FCLTypes = {
  Address: unknown
  UInt64: unknown
  UFix64: unknown
  String: unknown
  UInt8: unknown
}

const SENTINEL_VAULT_ADDRESS = process.env.NEXT_PUBLIC_SENTINEL_VAULT_ADDRESS || '0xc13b08053be24e87'

// Cache: Cadence script to get user's vault IDs
const GET_USER_VAULT_IDS = `
import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}
access(all) fun main(address: Address): [UInt64] {
  let account = getAccount(address)
  if let collectionRef = account.capabilities.borrow<&{SentinelVaultFinal.CollectionPublic}>(
    SentinelVaultFinal.VaultCollectionPublicPath
  ) {
    return collectionRef.getIDs()
  }
  return []
}
`

const GET_VAULT_LIST = `
import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}
access(all) fun main(address: Address): [SentinelVaultFinal.VaultInfo] {
  let account = getAccount(address)
  if let collectionRef = account.capabilities.borrow<&{SentinelVaultFinal.CollectionPublic}>(
    SentinelVaultFinal.VaultCollectionPublicPath
  ) {
    return collectionRef.getVaultInfos()
  }
  return []
}
`

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

export function useActivityFeed() {
  const { user } = useFlow()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)

  // Ref counter to allow imperative refetch
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

        // Step 1: Get this user's vault IDs FIRST to scope event filtering
        const userVaultIds = new Set<string>()
        let vaultList: Array<Record<string, unknown>> = []
        try {
          const ids = (await fcl.query({
            cadence: GET_USER_VAULT_IDS,
            args: (arg: FCLArg, t: FCLTypes) => [arg(addr, t.Address)],
          })) as Array<{ toString: () => string }> | undefined
          ids?.forEach((id) => userVaultIds.add(String(id)))

          const list = (await fcl.query({
            cadence: GET_VAULT_LIST,
            args: (arg: FCLArg, t: FCLTypes) => [arg(addr, t.Address)],
          })) as Array<Record<string, unknown>>
          vaultList = list || []
        } catch { /* no vaults yet */ }

        // Step 2: Query blockchain events, scoped to this user's vaults
        if (userVaultIds.size > 0) {
          const latestBlock = await fcl.block({ sealed: true })
          const startHeight = Math.max(0, latestBlock.height - 100000)

          const eventTypes = [
            `A.${SENTINEL_VAULT_ADDRESS.replace('0x', '')}.SentinelVaultFinal.VaultCreated`,
            `A.${SENTINEL_VAULT_ADDRESS.replace('0x', '')}.SentinelVaultFinal.DepositMade`,
            `A.${SENTINEL_VAULT_ADDRESS.replace('0x', '')}.SentinelVaultFinal.WithdrawalMade`,
            `A.${SENTINEL_VAULT_ADDRESS.replace('0x', '')}.SentinelVaultFinal.StrategyExecuted`,
            `A.${SENTINEL_VAULT_ADDRESS.replace('0x', '')}.SentinelVaultFinal.YieldClaimed`,
          ]

          for (const eventType of eventTypes) {
            try {
              const result = await fcl.send([
                fcl.getEventsAtBlockHeightRange(eventType, startHeight, latestBlock.height)
              ])
              const decoded = await fcl.decode(result)

              if (decoded && Array.isArray(decoded)) {
                for (const event of decoded) {
                  const data = event.data
                  // vaultId can be in data.vaultId OR data.id (VaultCreated uses 'id')
                  const vaultIdStr = String(data.vaultId ?? data.id ?? '')

                  // CRITICAL: Only include events for this user's vaults
                  if (!userVaultIds.has(vaultIdStr)) continue

                  const ts = event.blockTimestamp
                    ? new Date(event.blockTimestamp)
                    : new Date()

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
                      description: yieldGen > 0
                        ? `Generated ${yieldGen.toFixed(6)} FLOW yield`
                        : 'Executed (no yield this cycle)',
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
            } catch {
              // Skip event types that have no events yet
            }
          }
        }

        // If no events but vaults exist, show vault statuses
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

        // If absolutely nothing found, show welcome state
        if (items.length === 0) {
          items.push({
            id: 'welcome',
            type: 'alert',
            title: 'System Ready',
            description: 'Connected to Flow Testnet. Deploy your first vault to see on-chain activity.',
            timestamp: new Date(),
          })
        }

        // Sort newest first
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

  // Expose a refetch function that re-triggers the effect
  // (setRefetchCounter changes the dependency, causing useEffect to re-run)

  const addActivity = (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `local-${Date.now()}`,
      timestamp: new Date()
    }
    setActivities(prev => [newActivity, ...prev])
  }

  return {
    activities,
    loading,
    refetch: () => setRefetchCounter(c => c + 1),
    addActivity
  }
}
