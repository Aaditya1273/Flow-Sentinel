import type { Handler } from '@netlify/functions'
import * as fcl from '@onflow/fcl'

// ── Strategy Keeper — Netlify Scheduled Function (Phase 5) ──
// Queries all active vaults due for execution and triggers them automatically.
// Schedule: every hour (see netlify.toml)
// This is the fallback keeper until Forte FlowTransactionScheduler is live on mainnet.

const FLOW_ACCESS_NODE = process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE ?? 'https://rest-testnet.onflow.org'
const SENTINEL_VAULT_ADDRESS = process.env.NEXT_PUBLIC_SENTINEL_VAULT_ADDRESS ?? '0xc13b08053be24e87'
const KEEPER_ADDRESS = process.env.KEEPER_ADDRESS ?? ''
const KEEPER_PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY ?? ''
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET ?? ''

fcl.config({
  'accessNode.api': FLOW_ACCESS_NODE,
  'flow.network': process.env.NEXT_PUBLIC_FLOW_NETWORK ?? 'testnet',
})

interface VaultDue {
  vaultId: string
  owner: string
  strategyId: string
  secondsOverdue: number
}

async function getVaultsDue(): Promise<VaultDue[]> {
  try {
    const result = await fcl.query({
      cadence: `
        import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}
        access(all) fun main(): [{String: AnyStruct}] {
          return SentinelVaultFinal.getVaultsDueForExecution()
        }
      `,
    }) as Array<Record<string, unknown>>
    return (result ?? []).map(v => ({
      vaultId: String(v.vaultId ?? v.id ?? ''),
      owner: String(v.owner ?? ''),
      strategyId: String(v.strategyId ?? ''),
      secondsOverdue: parseInt(String(v.secondsOverdue ?? 0)),
    }))
  } catch (err) {
    console.error('[strategy-keeper] getVaultsDue failed:', err)
    return []
  }
}

function createKeeperAuth() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (account: any) => {
    const EC = (await import('elliptic')).ec
    const { sha3_256 } = await import('js-sha3')
    const ec = new EC('p256')
    const key = ec.keyFromPrivate(Buffer.from(KEEPER_PRIVATE_KEY, 'hex'))
    return {
      ...account,
      addr: KEEPER_ADDRESS,
      keyId: 0,
      signingFunction: async (signable: { message: string }) => {
        const msgBuffer = Buffer.from(signable.message, 'hex')
        const hash = Buffer.from(sha3_256.arrayBuffer(msgBuffer))
        const sig = key.sign(hash)
        const n = 32
        const r = sig.r.toArrayLike(Buffer, 'be', n)
        const s = sig.s.toArrayLike(Buffer, 'be', n)
        return {
          addr: KEEPER_ADDRESS,
          keyId: 0,
          signature: Buffer.concat([r, s]).toString('hex'),
        }
      },
    }
  }
}

async function triggerVault(vault: VaultDue): Promise<string> {
  const { buildCommitHash, generateNonce, uint8ArrayToFCLArray, formatUFix64 } = await import('../../lib/mev-hash')
  const block = await fcl.block({ sealed: true }) as { height: number }

  const nonce = generateNonce()
  const deadlineBlock = block.height + 200
  const hashBytes = await buildCommitHash({
    vaultId: vault.vaultId,
    nonce,
    amount: formatUFix64(0),   // keeper uses 0 as amount (vault reads its own balance)
    strategyId: vault.strategyId,
    deadlineBlock,
    committer: KEEPER_ADDRESS,
  })
  const commitHash = uint8ArrayToFCLArray(hashBytes)

  const txId = await (fcl.mutate as (opts: Record<string, unknown>) => Promise<string>)({
    cadence: `
      import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}
      import LiquidStakingStrategy from ${SENTINEL_VAULT_ADDRESS}
      import YieldFarmingStrategy from ${SENTINEL_VAULT_ADDRESS}
      import ArbitrageStrategy from ${SENTINEL_VAULT_ADDRESS}
      import YieldOracle from ${SENTINEL_VAULT_ADDRESS}
      import MEVShieldCore from ${SENTINEL_VAULT_ADDRESS}

      transaction(ownerId: Address, vaultId: UInt64, commitHash: [UInt8], nonce: UInt64) {
        prepare(signer: auth(BorrowValue) &Account) {
          let ownerAccount = getAuthAccount<auth(BorrowValue) &Account>(ownerId)
          let collection = ownerAccount.storage
            .borrow<&SentinelVaultFinal.Collection>(from: SentinelVaultFinal.VaultCollectionStoragePath)
            ?? panic("Collection not found for owner")
          let vault = collection.borrowVaultPriv(id: vaultId) ?? panic("Vault not found")

          let strategyId = vault.getStrategyId()
          var expectedAPY = 0.0
          if let d = YieldOracle.getYieldData(strategyId) { expectedAPY = d.apy }

          MEVShieldCore.createCommit(vaultId: vaultId, commitHash: commitHash, protectionLevel: 3, committedBy: ownerId)

          if strategyId == "liquid-staking-pro" {
            let exec <- LiquidStakingStrategy.createExecutor()
            vault.executeStrategyWithMEV(executor: <-exec, commitHash: commitHash, expectedAPY: expectedAPY, nonce: nonce)
          } else if strategyId == "defi-yield-maximizer" || strategyId == "high-yield-farming" {
            let exec <- YieldFarmingStrategy.createExecutor()
            vault.executeStrategyWithMEV(executor: <-exec, commitHash: commitHash, expectedAPY: expectedAPY, nonce: nonce)
          } else {
            let exec <- ArbitrageStrategy.createExecutor()
            vault.executeStrategyWithMEV(executor: <-exec, commitHash: commitHash, expectedAPY: expectedAPY, nonce: nonce)
          }
        }
      }
    `,
    args: (arg: typeof fcl.arg, t: typeof import('@onflow/types')) => [
      arg(vault.owner, t.Address),
      arg(vault.vaultId, t.UInt64),
      arg(commitHash.map(String), t.Array([t.UInt8])),
      arg(nonce.toString(), t.UInt64),
    ],
    authorizations: [createKeeperAuth()],
    proposer: createKeeperAuth(),
    payer: createKeeperAuth(),
    limit: 300,
  })

  await fcl.tx(txId).onceSealed()
  return txId
}

export const handler: Handler = async () => {
  if (!KEEPER_ADDRESS || !KEEPER_PRIVATE_KEY) {
    console.warn('[strategy-keeper] Keeper credentials not configured — skipping execution')
    return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: 'credentials not configured' }) }
  }

  const vaultsDue = await getVaultsDue()
  if (vaultsDue.length === 0) {
    console.log('[strategy-keeper] No vaults due for execution')
    return { statusCode: 200, body: JSON.stringify({ executed: 0 }) }
  }

  const results: Array<{ vaultId: string; txId?: string; error?: string }> = []
  for (const vault of vaultsDue) {
    try {
      const txId = await triggerVault(vault)
      console.log(`[strategy-keeper] Vault ${vault.vaultId} executed: ${txId}`)
      results.push({ vaultId: vault.vaultId, txId })
    } catch (err) {
      console.error(`[strategy-keeper] Vault ${vault.vaultId} failed:`, err)
      results.push({ vaultId: vault.vaultId, error: String(err) })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ executed: results.filter(r => r.txId).length, failed: results.filter(r => r.error).length, results }),
  }
}
