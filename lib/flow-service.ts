// ── Flow Service Layer ──
// Orchestrates blockchain queries and mutations. Handles errors, deduplication.
// Cadence scripts live in lib/cadence/. Analytics lives in lib/analytics.ts.

import '@/lib/storage-polyfill'
import * as fcl from '@onflow/fcl'
import { errorReporter } from '@/lib/sentry-wrapper'
import { FCLArg, FCLTypes, SENTINEL_VAULT_ADDRESS } from 'lib/addresses'
import {
  GET_VAULT_LIST,
  GET_ALL_STRATEGIES,
  GET_ALL_APYS,
  GET_FLOW_BALANCE,
  GET_PROTOCOL_STATS,
  GET_STRATEGY_LIVE_STATS,
} from 'lib/cadence/scripts'
import {
  DEPOSIT_TO_VAULT,
  WITHDRAW_FROM_VAULT,
  PAUSE_VAULT,
  RESUME_VAULT,
  CREATE_VAULT_WITH_STRATEGY,
  CLEANUP_STORAGE,
  TRIGGER_STRATEGY,
  CLAIM_YIELD,
  FUND_YIELD_RESERVE,
} from 'lib/cadence/transactions'
import {
  buildPerformanceHistory,
  getVaultAgeInDays,
  hasEnoughDataForTimeframe,
  getRemainingTimeForTimeframe,
} from 'lib/analytics'
import type { VaultEvent } from 'lib/analytics'

// ── Request deduplication cache ──
const inflightQueries = new Map<string, Promise<unknown>>()
const INFLIGHT_TTL = 2000

export class FlowService {
  static async query(cadence: string, args?: (arg: FCLArg, t: FCLTypes) => unknown[], deduplicate = true) {
    const cacheKey = deduplicate ? cadence : ''
    if (deduplicate && inflightQueries.has(cacheKey)) {
      return inflightQueries.get(cacheKey)!
    }

    const promise = (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await fcl.query({ cadence, args: args as any })
      } catch (error) {
        // Cadence script errors (400 InvalidArgument) are expected when the on-chain
        // contract version doesn't match the script — treat as a silent null return,
        // not a reportable exception. Only report genuinely unexpected errors.
        const msg = error instanceof Error ? error.message : String(error)
        const isCadenceError = msg.includes('Error Code: 1101') ||
          msg.includes('InvalidArgument') ||
          msg.includes('HTTP Request Error') ||
          msg.includes('statusCode=400')
        if (!isCadenceError) {
          errorReporter.captureException(error, { component: 'FlowService', action: 'query' })
        } else {
          console.warn('[FlowService] Script failed (on-chain mismatch — redeploy contracts):', msg.slice(0, 200))
        }
        return null
      } finally {
        if (deduplicate) setTimeout(() => inflightQueries.delete(cacheKey), INFLIGHT_TTL)
      }
    })()

    if (deduplicate) inflightQueries.set(cacheKey, promise)
    return promise
  }

  static async mutate(cadence: string, args?: (arg: FCLArg, t: FCLTypes) => unknown[]) {
    try {
      const transactionId = await fcl.mutate({
        cadence,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: args as any,
        payer: fcl.currentUser,
        proposer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      })
      return { transactionId, sealed: fcl.tx(transactionId).onceSealed() }
    } catch (error) {
      errorReporter.captureException(error, { component: 'FlowService', action: 'mutate' })
      throw error
    }
  }

  // Phase 3: getAllStrategies pulls live TVL, participants, and yield from real contract state
  static async getAllStrategies(): Promise<Array<Record<string, unknown>>> {
    try {
      const live = await this.query(GET_STRATEGY_LIVE_STATS) as Record<string, unknown> | null
      if (live?.strategies && Array.isArray(live.strategies)) {
        return live.strategies as Array<Record<string, unknown>>
      }
    } catch {
      // fallback to basic list if live stats script fails
    }
    return ((await this.query(GET_ALL_STRATEGIES)) || []) as Array<Record<string, unknown>>
  }

  static async getAllAPYs(): Promise<Record<string, number>> {
    const result = await this.query(GET_ALL_APYS)
    if (!result || typeof result !== 'object') return {}
    const apys: Record<string, number> = {}
    for (const [strategyId, data] of Object.entries(result as Record<string, unknown>)) {
      apys[strategyId] = parseFloat(String((data as Record<string, unknown>).apy ?? '0'))
    }
    return apys
  }

  // Phase 4: raw APY data with updatedAt, source, confidence for oracle freshness display
  static async getAllAPYsRaw(): Promise<Record<string, Record<string, unknown>>> {
    const result = await this.query(GET_ALL_APYS)
    if (!result || typeof result !== 'object') return {}
    return result as Record<string, Record<string, unknown>>
  }

  static async getVaultList(address: string): Promise<Array<Record<string, unknown>>> {
    return ((await this.query(GET_VAULT_LIST, (arg: FCLArg, t: FCLTypes) => [arg(address, t.Address)])) || []) as Array<Record<string, unknown>>
  }

  static async getUserFlowBalance(address: string) {
    try {
      const balance = await this.query(GET_FLOW_BALANCE, (arg: FCLArg, t: FCLTypes) => [arg(address, t.Address)])
      return balance || 0.0
    } catch {
      return 0.0
    }
  }

  // Phase 2: fetch full protocol stats including yield reserve balance + health
  static async getProtocolStats(): Promise<{
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
  }> {
    const raw = await this.query(GET_PROTOCOL_STATS, undefined, false) as Record<string, unknown> | null
    if (!raw) return {
      totalVaults: 0, totalValueLocked: 0, totalYieldDistributed: 0,
      totalFeesCollected: 0, yieldReserveBalance: 0, protocolFeeRateBps: 10,
      reserveStatus: 'CRITICAL', contractStatus: 'UNKNOWN',
      mevTotalProtections: 0, mevTotalCommits: 0, mevPendingExecutions: 0,
    }
    return {
      totalVaults: parseInt(String(raw.totalVaults ?? 0)),
      totalValueLocked: parseFloat(String(raw.totalValueLocked ?? 0)),
      totalYieldDistributed: parseFloat(String(raw.totalYieldDistributed ?? 0)),
      totalFeesCollected: parseFloat(String(raw.totalFeesCollected ?? 0)),
      yieldReserveBalance: parseFloat(String(raw.yieldReserveBalance ?? 0)),
      protocolFeeRateBps: parseFloat(String(raw.protocolFeeRateBps ?? 10)),
      reserveStatus: (String(raw.reserveStatus ?? 'CRITICAL')) as 'HEALTHY' | 'WARNING' | 'CRITICAL',
      contractStatus: String(raw.contractStatus ?? 'UNKNOWN'),
      mevTotalProtections: parseInt(String(raw.mevTotalProtections ?? 0)),
      mevTotalCommits: parseInt(String(raw.mevTotalCommits ?? 0)),
      mevPendingExecutions: parseInt(String(raw.mevPendingExecutions ?? 0)),
    }
  }

  // ── Event Queries ──
  static async getVaultEvents(address: string): Promise<VaultEvent[]> {
    try {
      const latestBlock = await fcl.block({ sealed: true })
      const startHeight = Math.max(0, latestBlock.height - 100000)
      const addr = SENTINEL_VAULT_ADDRESS.replace('0x', '')

      const eventTypes = [
        `A.${addr}.SentinelVaultFinal.VaultCreated`,
        `A.${addr}.SentinelVaultFinal.DepositMade`,
        `A.${addr}.SentinelVaultFinal.WithdrawalMade`,
      ]

      const events: VaultEvent[] = []

      for (const eventType of eventTypes) {
        try {
          const result = await fcl.send([fcl.getEventsAtBlockHeightRange(eventType, startHeight, latestBlock.height)])
          const decoded = await fcl.decode(result)
          if (decoded && Array.isArray(decoded)) {
            for (const event of decoded) {
              const d = event.data
              if (d.owner === address || d.vaultId !== undefined) {
                events.push({
                  type: eventType.includes('Created') ? 'created' : eventType.includes('Deposit') ? 'deposit' : 'withdraw',
                  vaultId: d.vaultId?.toString() || d.id?.toString() || '0',
                  amount: parseFloat(d.amount || '0'),
                  timestamp: event.blockTimestamp ? new Date(event.blockTimestamp).getTime() / 1000 : Date.now() / 1000,
                  blockHeight: event.blockHeight || 0,
                })
              }
            }
          }
        } catch (err) {
          console.warn(`Could not fetch events for ${eventType}:`, err)
        }
      }

      events.sort((a, b) => a.timestamp - b.timestamp)
      return events
    } catch (error) {
      errorReporter.captureException(error, { component: 'FlowService', action: 'getVaultEvents' })
      return []
    }
  }

  // ── Mutation Methods ──
  static async createVaultWithStrategy(strategyId: string, vaultName: string, initialDeposit: number) {
    return this.mutate(CREATE_VAULT_WITH_STRATEGY, (arg: FCLArg, t: FCLTypes) => [
      arg(strategyId, t.String), arg(vaultName, t.String), arg(initialDeposit.toFixed(8), t.UFix64),
    ])
  }

  static async deposit(vaultId: string, amount: number) {
    return this.mutate(DEPOSIT_TO_VAULT, (arg: FCLArg, t: FCLTypes) => [
      arg(vaultId, t.UInt64), arg(amount.toFixed(8), t.UFix64),
    ])
  }

  static async withdraw(vaultId: string, amount: number) {
    return this.mutate(WITHDRAW_FROM_VAULT, (arg: FCLArg, t: FCLTypes) => [
      arg(vaultId, t.UInt64), arg(amount.toFixed(8), t.UFix64),
    ])
  }

  static async pauseVault(vaultId: string) {
    return this.mutate(PAUSE_VAULT, (arg: FCLArg, t: FCLTypes) => [arg(vaultId, t.UInt64)])
  }

  static async resumeVault(vaultId: string) {
    return this.mutate(RESUME_VAULT, (arg: FCLArg, t: FCLTypes) => [arg(vaultId, t.UInt64)])
  }

  static async triggerStrategy(vaultId: string, commitHash: number[], nonce: bigint, expectedAPY: number) {
    return this.mutate(TRIGGER_STRATEGY, (arg: FCLArg, t: FCLTypes) => [
      arg(vaultId, t.UInt64),
      arg(commitHash.map(String), t.Array([t.UInt8])),
      arg(nonce.toString(), t.UInt64),
      arg(expectedAPY.toFixed(8), t.UFix64),
    ])
  }

  static async claimYield(vaultId: string) {
    return this.mutate(CLAIM_YIELD, (arg: FCLArg, t: FCLTypes) => [arg(vaultId, t.UInt64)])
  }

  static async cleanupIncompatibleStorage() {
    return this.mutate(CLEANUP_STORAGE, () => [])
  }

  // Phase 2: Fund the yield reserve from caller's wallet
  static async fundYieldReserve(amount: number) {
    return this.mutate(FUND_YIELD_RESERVE, (arg: FCLArg, t: FCLTypes) => [
      arg(amount.toFixed(8), t.UFix64),
    ])
  }
}

// Re-export analytics functions and types for convenience
export { buildPerformanceHistory, getVaultAgeInDays, hasEnoughDataForTimeframe, getRemainingTimeForTimeframe } from 'lib/analytics'
export type { PerformanceDataPoint, VaultEvent } from 'lib/analytics'
