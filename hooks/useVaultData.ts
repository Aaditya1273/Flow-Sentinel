import { useState, useEffect, useCallback } from 'react'
import { useFlow } from 'lib/flow'
import { useBalance } from 'wagmi'
import { FlowService } from 'lib/flow-service'
import { errorReporter } from '@/lib/sentry-wrapper'

export interface VaultData {
  id: string
  name: string
  balance: number
  strategy: string
  strategyId: string
  isActive: boolean
  lastExecution: number
  totalDeposits: number
  pnl?: number
  pnlPercent?: number
  totalYieldAccrued?: number
  apy?: number
  // Phase 5: scheduling
  nextScheduledExecution?: number
  executionIntervalSeconds?: number
  // MEV Shield fields
  protectionLevel?: number
  slippageBps?: number
  commitRevealEnabled?: boolean
  blockDelayEnabled?: boolean
  mevProtectionsTriggered?: number
  mevShieldStatus?: string
}

// Phase 2: Protocol-level stats including yield reserve health
// Phase 4: per-strategy oracle data including freshness timestamps
export interface OracleAPYEntry {
  apy: number
  source: string
  updatedAt: number
  confidence: number
  dailyRate?: number
  weeklyRate?: number
}

export interface ProtocolStats {
  totalVaults: number
  totalValueLocked: number
  totalYieldDistributed: number
  totalFeesCollected: number
  yieldReserveBalance: number
  protocolFeeRateBps: number
  reserveStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  contractStatus: string
  mevTotalProtections: number
  mevTotalCommits: number
  mevPendingExecutions: number
}

export function useVaultData() {
  const { user, walletType } = useFlow()
  const [vaults, setVaults] = useState<VaultData[]>([])
  const [performance, setPerformance] = useState<{ totalBalance: number; totalPnl: number; totalPnlPercent: number } | null>(null)
  const [flowBalance, setFlowBalance] = useState<number>(0)
  const [protocolStats, setProtocolStats] = useState<ProtocolStats | null>(null)
  const [oracleData, setOracleData] = useState<Record<string, OracleAPYEntry>>({})  // Phase 4
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: evmBalance } = useBalance({
    address: user.addr as `0x${string}`,
    query: { enabled: walletType === 'evm' && !!user.addr },
  })

  // EVM balance — separate effect, doesn't trigger vault re-fetch
  useEffect(() => {
    if (walletType === 'evm' && evmBalance) {
      const bal = parseFloat(evmBalance.value.toString()) / Math.pow(10, evmBalance.decimals)
      setFlowBalance(bal)
    }
  }, [evmBalance, walletType])

  const fetchVaultData = useCallback(async () => {
    if (!user.addr) return

    setLoading(true)
    setError(null)

    try {
      // Fetch vaults, APYs, and protocol stats in parallel — maximum efficiency
      const [vaultList, apyData, stats] = await Promise.all([
        FlowService.getVaultList(user.addr),
        FlowService.getAllAPYs(),
        FlowService.getProtocolStats(),
      ])

      setProtocolStats(stats)

      // Phase 4: store full oracle entries (with updatedAt timestamps for freshness display)
      const oracleEntries: Record<string, OracleAPYEntry> = {}
      const rawApyMap = await FlowService.getAllAPYsRaw()
      for (const [id, raw] of Object.entries(rawApyMap as Record<string, Record<string, unknown>>)) {
        oracleEntries[id] = {
          apy: parseFloat(String(raw.apy ?? 0)),
          source: String(raw.source ?? 'oracle'),
          updatedAt: parseFloat(String(raw.updatedAt ?? 0)),
          confidence: parseFloat(String(raw.confidence ?? 0.8)),
          dailyRate: parseFloat(String(raw.dailyRate ?? 0)),
          weeklyRate: parseFloat(String(raw.weeklyRate ?? 0)),
        }
      }
      setOracleData(oracleEntries)

      if (vaultList && Array.isArray(vaultList)) {
        const transformedVaults: VaultData[] = vaultList.map((v: Record<string, unknown>) => {
          const strategyId = String(v.strategyId ?? v.strategy ?? '')
          const balance = parseFloat(String(v.balance ?? '0'))
          const yieldAccrued = parseFloat(String(v.totalYieldAccrued ?? '0'))
          // totalDeposits = balance minus accrued yield (what user actually put in)
          const totalDeposits = balance - yieldAccrued
          const pnlPercent = totalDeposits > 0 ? (yieldAccrued / totalDeposits) * 100 : 0

          return {
            id: String(v.id ?? ''),
            name: String(v.name ?? 'Unnamed Vault'),
            balance,
            strategy: String(v.strategy ?? strategyId),
            strategyId,
            isActive: Boolean(v.isActive),
            lastExecution: parseFloat(String(v.lastExecution ?? '0')),
            totalDeposits,
            pnl: yieldAccrued,
            pnlPercent,
            totalYieldAccrued: yieldAccrued,
            // Real APY from on-chain YieldOracle
            apy: apyData[strategyId] ?? 0,
            // MEV Shield fields
            protectionLevel: v.protectionLevel !== undefined ? parseInt(String(v.protectionLevel)) : undefined,
            slippageBps: v.slippageBps !== undefined ? parseFloat(String(v.slippageBps)) : undefined,
            commitRevealEnabled: Boolean(v.commitRevealEnabled),
            blockDelayEnabled: Boolean(v.blockDelayEnabled),
            mevProtectionsTriggered: v.mevProtectionsTriggered !== undefined ? parseInt(String(v.mevProtectionsTriggered)) : undefined,
            mevShieldStatus: String(v.mevShieldStatus ?? ''),
            // Phase 5: scheduling
            nextScheduledExecution: v.nextScheduledExecution !== undefined && v.nextScheduledExecution !== null
              ? parseFloat(String(v.nextScheduledExecution))
              : undefined,
            executionIntervalSeconds: v.executionIntervalSeconds !== undefined
              ? parseFloat(String(v.executionIntervalSeconds))
              : undefined,
          }
        })

        setVaults(transformedVaults)

        // Performance summary
        const totalBalance = transformedVaults.reduce((s, v) => s + v.balance, 0)
        const totalPnl = transformedVaults.reduce((s, v) => s + (v.pnl ?? 0), 0)
        const totalInitial = totalBalance - totalPnl
        setPerformance({
          totalBalance,
          totalPnl,
          totalPnlPercent: totalInitial > 0 ? (totalPnl / totalInitial) * 100 : 0,
        })
      }

      // Flow balance (non-EVM path)
      if (walletType !== 'evm') {
        const balance = await FlowService.getUserFlowBalance(user.addr)
        setFlowBalance(parseFloat(String(balance ?? 0)))
      }

    } catch (err) {
      errorReporter.captureException(err, { component: 'useVaultData', action: 'fetchVaultData' })
      setError(err instanceof Error ? err.message : 'Failed to fetch vault data')
    } finally {
      setLoading(false)
    }
  }, [user.addr, user.loggedIn, walletType]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user.loggedIn && user.addr) {
      fetchVaultData()
    } else {
      setVaults([])
      setPerformance(null)
      setFlowBalance(0)
      setProtocolStats(null)
      setOracleData({})
    }
  }, [user.loggedIn, user.addr, walletType]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    vaults,
    performance,
    flowBalance,
    protocolStats,
    oracleData,     // Phase 4: full oracle entries with timestamps for freshness display
    loading,
    error,
    refetch: fetchVaultData,
  }
}
