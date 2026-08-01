// ── Agent API — AI-Agent-Ready Execution ──
// REST endpoints for autonomous agents to manage vaults, execute strategies,
// query protocol metrics, and rebalance allocations.
//
// All responses return structured JSON with consistent error handling.
// Compatible with any AI agent framework (LangChain, AutoGPT, Eliza, etc.)
//
// Endpoints:
//   GET    /api/agent                  — API info + available endpoints
//   GET    /api/agent/vaults           — list all vaults with status
//   GET    /api/agent/vaults/:id       — get specific vault details
//   POST   /api/agent/execute          — trigger strategy execution
//   GET    /api/agent/metrics          — protocol metrics
//   GET    /api/agent/events           — structured event feed
//   POST   /api/agent/rebalance        — rebalance vault allocation
//
// Auth: Bearer token in Authorization header, or wallet-signed auth headers.

import { NextRequest, NextResponse } from 'next/server'
import * as fcl from '@onflow/fcl'
import * as t from '@onflow/types'

const SENTINEL_VAULT_ADDRESS = process.env.NEXT_PUBLIC_SENTINEL_VAULT_ADDRESS ?? '0x60320435dd7725c1'
const AGENT_API_KEY = process.env.AGENT_API_KEY ?? ''
const AGENT_DEV_KEY = process.env.AGENT_DEV_KEY ?? ''
const FLOW_ACCESS_NODE = process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE ?? 'https://rest-testnet.onflow.org'

fcl.config({
  'accessNode.api': FLOW_ACCESS_NODE,
  'flow.network': process.env.NEXT_PUBLIC_FLOW_NETWORK ?? 'testnet',
  '0xSentinelVaultFinal': SENTINEL_VAULT_ADDRESS,
})

// ── Auth ──
function authenticate(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    if (AGENT_API_KEY && token === AGENT_API_KEY) return 'agent'
    // Accept simple key for demo/dev
    if (AGENT_DEV_KEY && token === AGENT_DEV_KEY) return 'agent-dev'
  }
  // Allow unauthenticated for GET queries (public data)
  const method = req.method
  if (method === 'GET') return 'anonymous'
  return null
}

// ── CORS helper ──
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }
}

// ── Error response ──
function errorResponse(message: string, status: number, details?: string) {
  return NextResponse.json(
    { success: false, error: message, details, timestamp: new Date().toISOString() },
    { status, headers: corsHeaders() }
  )
}

// ── Success response ──
function successResponse(data: unknown) {
  return NextResponse.json(
    { success: true, data, timestamp: new Date().toISOString() },
    { headers: corsHeaders() }
  )
}

// ── OPTIONS handler (CORS preflight) ──
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

// ── GET /api/agent — API info + endpoints ──
// Also handles /api/agent/vaults, /api/agent/metrics, /api/agent/events via path
export async function GET(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl

    // /api/agent — API info
    if (pathname === '/api/agent' || pathname === '/api/agent/') {
      return successResponse({
        name: 'Flow Sentinel Agent API',
        version: '1.0.0',
        network: process.env.NEXT_PUBLIC_FLOW_NETWORK ?? 'testnet',
        contractAddress: SENTINEL_VAULT_ADDRESS,
        documentation: '/docs/agent-api',
        endpoints: {
          'GET /api/agent': 'API info and available endpoints',
          'GET /api/agent/vaults': 'List all vaults with status',
          'GET /api/agent/vaults/:id': 'Get specific vault details',
          'POST /api/agent/execute': 'Trigger strategy execution',
          'GET /api/agent/metrics': 'Protocol metrics (TVL, yield, MEV stats)',
          'GET /api/agent/events': 'Structured event feed',
          'POST /api/agent/rebalance': 'Rebalance vault allocation',
        },
        auth: {
          type: 'Bearer token',
          config: 'Set AGENT_API_KEY env var, or use "flow-sentinel-agent-dev" for development',
        },
        example: 'curl -H "Authorization: Bearer $AGENT_API_KEY" https://flow-sentinel.netlify.app/api/agent/metrics',
      })
    }

    // /api/agent/metrics — protocol metrics
    if (pathname === '/api/agent/metrics') {
      const cadence = `
        import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}
        import MEVShieldCore from ${SENTINEL_VAULT_ADDRESS}
        import YieldOracle from ${SENTINEL_VAULT_ADDRESS}
        import LiquidStakingStrategy from ${SENTINEL_VAULT_ADDRESS}
        import YieldFarmingStrategy from ${SENTINEL_VAULT_ADDRESS}

        access(all) fun main(): {String: AnyStruct} {
          let protocol = SentinelVaultFinal.getProtocolStats()
          let mev = MEVShieldCore.getMEVStats()
          let lsInfo = LiquidStakingStrategy.getStrategyInfo()
          let yfInfo = YieldFarmingStrategy.getStrategyInfo()

          // Oracle freshness per strategy
          var oracleAges: {String: UFix64} = {}
          let strategies = ["liquid-staking-pro", "defi-yield-maximizer"]
          for id in strategies {
            if let data = YieldOracle.getYieldData(id) {
              oracleAges[id] = getCurrentBlock().timestamp - data.updatedAt
            }
          }

          return {
            "totalVaults": protocol["totalVaults"] ?? 0,
            "totalValueLocked": protocol["totalValueLocked"] ?? 0.0,
            "totalYieldDistributed": protocol["totalYieldDistributed"] ?? 0.0,
            "totalFeesCollected": protocol["totalFeesCollected"] ?? 0.0,
            "yieldReserveBalance": protocol["yieldReserveBalance"] ?? 0.0,
            "protocolFeeRateBps": protocol["protocolFeeRateBps"] ?? 0.0,
            "contractStatus": protocol["contractStatus"] ?? "UNKNOWN",
            "reserveStatus": protocol["reserveStatus"] ?? "CRITICAL",
            "mevTotalProtections": mev["totalProtectionsTriggered"] ?? 0,
            "mevTotalCommits": mev["totalCommitsCreated"] ?? 0,
            "mevTotalExecutions": mev["totalExecutionsProcessed"] ?? 0,
            "mevTotalRejected": mev["totalExecutionsRejected"] ?? 0,
            "mevPendingExecutions": mev["pendingExecutionCount"] ?? 0,
            "strategies": {
              "liquid-staking-pro": {
                "apy": lsInfo["expectedAPY"] ?? 0.0,
                "tvl": lsInfo["tvl"] ?? 0.0,
                "participants": lsInfo["participants"] ?? 0,
                "totalYieldGenerated": lsInfo["totalYieldGenerated"] ?? 0.0,
                "isActive": lsInfo["isActive"] ?? true,
                "minDeposit": lsInfo["minDeposit"] ?? 10.0
              },
              "defi-yield-maximizer": {
                "apy": yfInfo["expectedAPY"] ?? 0.0,
                "tvl": yfInfo["tvl"] ?? 0.0,
                "participants": yfInfo["participants"] ?? 0,
                "totalYieldGenerated": yfInfo["totalYieldGenerated"] ?? 0.0,
                "isActive": yfInfo["isActive"] ?? true,
                "minDeposit": yfInfo["minDeposit"] ?? 100.0
              }
            },
            "oracleFreshness": oracleAges
          }
        }
      `
      const result = await fcl.query({ cadence })
      return successResponse(result)
    }

    // /api/agent/events — structured event feed
    if (pathname === '/api/agent/events') {
      const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '20')
      const startHeight = parseInt(req.nextUrl.searchParams.get('fromBlock') ?? '0')
      const addr = SENTINEL_VAULT_ADDRESS.replace('0x', '')

      const latestBlock = await fcl.block({ sealed: true }) as { height: number }
      const fromHeight = startHeight > 0 ? startHeight : Math.max(0, latestBlock.height - 10000)

      const eventTypes = [
        `A.${addr}.SentinelVaultFinal.VaultCreated`,
        `A.${addr}.SentinelVaultFinal.DepositMade`,
        `A.${addr}.SentinelVaultFinal.WithdrawalMade`,
        `A.${addr}.SentinelVaultFinal.StrategyExecuted`,
        `A.${addr}.MEVShieldCore.ExecutionRejected`,
        `A.${addr}.MEVShieldCore.ExecutionCompleted`,
        `A.${addr}.MEVShieldCore.CommitCreated`,
      ]

      const events: Array<Record<string, unknown>> = []

      for (const eventType of eventTypes) {
        if (events.length >= limit) break
        try {
          const result = await fcl.send([
            fcl.getEventsAtBlockHeightRange(eventType, fromHeight, latestBlock.height),
          ])
          const decoded = await fcl.decode(result)
          if (decoded && Array.isArray(decoded)) {
            for (const evt of decoded) {
              if (events.length >= limit) break
              events.push({
                type: eventType.split('.').pop() || 'Unknown',
                blockHeight: evt.blockHeight,
                blockTimestamp: evt.blockTimestamp,
                data: evt.data,
                transactionId: evt.transactionId,
              })
            }
          }
        } catch (eventErr) {
          console.warn('[agent-api] Event query failed for', eventType, ':', eventErr instanceof Error ? eventErr.message : String(eventErr))
        }
      }

      events.sort((a, b) => (b.blockHeight as number) - (a.blockHeight as number))

      return successResponse({
        fromBlock: fromHeight,
        toBlock: latestBlock.height,
        totalReturned: events.length,
        events: events.slice(0, limit),
      })
    }

    // /api/agent/vaults — list vaults for a given address
    if (pathname === '/api/agent/vaults') {
      const address = req.nextUrl.searchParams.get('address')
      if (!address) {
        return errorResponse('Missing "address" query parameter (Flow wallet address)', 400)
      }

      const cadence = `
        import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}

        access(all) fun main(address: Address): {String: AnyStruct} {
          let account = getAccount(address)
          if let collectionRef = account.capabilities.borrow<&{SentinelVaultFinal.CollectionPublic}>(
            SentinelVaultFinal.VaultCollectionPublicPath
          ) {
            let infos = collectionRef.getVaultInfos()
            let vaultList: [{String: AnyStruct}] = []
            for info in infos {
              vaultList.append({
                "id": info.id,
                "name": info.name,
                "balance": info.balance,
                "status": info.status,
                "isActive": info.isActive,
                "strategy": info.strategy,
                "strategyId": info.strategyId,
                "totalYieldAccrued": info.totalYieldAccrued,
                "lastExecution": info.lastExecution,
                "executionIntervalSeconds": info.executionIntervalSeconds,
                "nextScheduledExecution": info.nextScheduledExecution
              })
            }
            return {"vaults": vaultList, "count": vaultList.length}
          }
          return {"vaults": [], "count": 0}
        }
      `
      const result = await fcl.query({ cadence, args: (arg: typeof fcl.arg, ty: typeof t) => [arg(address, ty.Address)] })
      return successResponse(result)
    }

    // /api/agent/vaults/:id — get specific vault details
    // Pattern match: /api/agent/vaults/123
    const vaultMatch = pathname.match(/^\/api\/agent\/vaults\/(\d+)$/)
    if (vaultMatch) {
      const vaultId = vaultMatch[1]
      const address = req.nextUrl.searchParams.get('address')
      if (!address) {
        return errorResponse('Missing "address" query parameter', 400)
      }

      const cadence = `
        import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}
        import MEVShieldCore from ${SENTINEL_VAULT_ADDRESS}
        import YieldOracle from ${SENTINEL_VAULT_ADDRESS}

        access(all) fun main(address: Address, vaultId: UInt64): {String: AnyStruct} {
          let account = getAccount(address)
          if let collectionRef = account.capabilities.borrow<&{SentinelVaultFinal.CollectionPublic}>(
            SentinelVaultFinal.VaultCollectionPublicPath
          ) {
            let infos = collectionRef.getVaultInfos()
            for info in infos {
              if info.id == vaultId {
                var protectionLevel: UInt8 = 3
                var slippageBps: UFix64 = 300.0
                var mevStats: {String: AnyStruct} = {}
                if let config = MEVShieldCore.getVaultMEVConfig(vaultId: vaultId) {
                  protectionLevel = config.protectionLevel
                  slippageBps = config.slippageBps
                  mevStats = {
                    "protectionLevel": config.protectionLevel,
                    "slippageBps": config.slippageBps,
                    "blockDelayEnabled": config.blockDelayEnabled,
                    "commitRevealEnabled": config.commitRevealEnabled,
                    "totalProtectionsTriggered": config.totalProtectionsTriggered,
                    "lastExecutionBlock": config.lastExecutionBlock
                  }
                }
                var apy: UFix64 = 0.0
                if let data = YieldOracle.getYieldData(info.strategyId) {
                  apy = data.apy
                }
                return {
                  "vault": {
                    "id": info.id, "name": info.name,
                    "balance": info.balance, "status": info.status,
                    "isActive": info.isActive, "strategy": info.strategy,
                    "strategyId": info.strategyId,
                    "totalYieldAccrued": info.totalYieldAccrued,
                    "lastExecution": info.lastExecution,
                    "executionIntervalSeconds": info.executionIntervalSeconds,
                    "nextScheduledExecution": info.nextScheduledExecution,
                    "apy": apy,
                    "mevShield": mevStats
                  }
                }
              }
            }
          }
          return {"error": "Vault not found"}
        }
      `
      const result = await fcl.query({
        cadence,
        args: (arg: typeof fcl.arg, ty: typeof t) => [arg(address, ty.Address), arg(vaultId, ty.UInt64)],
      }) as Record<string, unknown>
      // Cadence returned an error (vault not found) — return proper 404
      if (result && typeof result === 'object' && 'error' in result) {
        return errorResponse(String(result.error), 404)
      }
      return successResponse(result)
    }

    return errorResponse(`Unknown endpoint: ${pathname}. See GET /api/agent for available endpoints.`, 404)

  } catch (err) {
    console.error('[agent-api] GET error:', err)
    return errorResponse('Internal server error', 500, err instanceof Error ? err.message : String(err))
  }
}

// ── POST /api/agent — execute, rebalance ──
export async function POST(req: NextRequest) {
  const auth = authenticate(req)
  if (!auth) {
    return errorResponse('Unauthorized — provide Authorization: Bearer <AGENT_API_KEY> header', 401)
  }

  try {
    const body: { action?: string; vaultId?: string; strategyId?: string; address?: string; amount?: number } =
      await req.json().catch(() => ({}))

    const { action, vaultId, strategyId, address, amount } = body

    if (!action) {
      return errorResponse('Missing "action" field. Available: execute, rebalance', 400)
    }

    // POST /api/agent — execute strategy
    if (action === 'execute') {
      if (!vaultId || !strategyId) {
        return errorResponse('Missing "vaultId" and/or "strategyId" fields', 400)
      }

      return errorResponse(
        'Strategy execution is disabled until a real audited protocol adapter is deployed.',
        503
      )

      /* Build commit hash off-chain
      const { buildCommitHash, generateNonce } = await import('@/lib/mev-hash')
      const block = await fcl.block({ sealed: true }) as { height: number }
      const nonce = generateNonce()
      const deadlineBlock = block.height + 200
      const hashBytes = await buildCommitHash({
        vaultId,
        nonce,
        amount: '0.0',
        strategyId,
        deadlineBlock,
        committer: address || '0x0000000000000000',
      })
      const commitHash = Array.from(hashBytes)

      // Fetch expected APY
      const apyCadence = `
        import YieldOracle from ${SENTINEL_VAULT_ADDRESS}
        access(all) fun main(strategyId: String): UFix64 {
          if let data = YieldOracle.getYieldData(strategyId) {
            return data.apy
          }
          return 0.0
        }
      `
      const expectedAPY = await fcl.query({
        cadence: apyCadence,
        args: (arg: typeof fcl.arg, ty: typeof t) => [arg(strategyId, ty.String)],
      }) as number

      return successResponse({
        action: 'execute',
        prepared: true,
        vaultId,
        strategyId,
        commitHash,
        nonce: nonce.toString(),
        deadlineBlock,
        expectedAPY,
        note: 'Submit via trigger_strategy_v2.cdc or mev_reveal.cdc transaction. See docs/agent-api.md for details.',
        cadenceTemplate: 'transactions/trigger_strategy_v2.cdc',
      }) */
    }

    // POST /api/agent — rebalance
    if (action === 'rebalance') {
      if (!vaultId || !strategyId || !amount) {
        return errorResponse('Missing "vaultId", "strategyId", and/or "amount" fields', 400)
      }

      return errorResponse(
        'Rebalancing is disabled until real audited strategy adapters are deployed.',
        503,
      )
    }

    return errorResponse(`Unknown action: "${action}". Strategy execution is currently disabled.`, 400)

  } catch (err) {
    console.error('[agent-api] POST error:', err)
    return errorResponse('Internal server error', 500, err instanceof Error ? err.message : String(err))
  }
}
