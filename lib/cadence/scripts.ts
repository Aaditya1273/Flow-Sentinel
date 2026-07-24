// ── Cadence Query Scripts ──
// Read-only scripts that query blockchain state.
// Phase 2: Added GET_PROTOCOL_STATS.
// Phase 3: Added GET_STRATEGY_LIVE_STATS — TVL/participants/yield from real contract state.

import {
  SENTINEL_VAULT_ADDRESS,
  STRATEGY_REGISTRY_ADDRESS,
  FLOW_TOKEN_ADDRESS,
  FUNGIBLE_TOKEN_ADDRESS,
} from 'lib/addresses'

export const GET_USER_VAULT_IDS = `
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

export const GET_VAULT_LIST = `
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

export const GET_ALL_STRATEGIES = `
import StrategyRegistry from ${STRATEGY_REGISTRY_ADDRESS}
access(all) fun main(): [{String: AnyStruct}] {
  return StrategyRegistry.getAllStrategies()
}
`

// Phase 3: Live strategy stats — TVL, participants, total yield all from real contract state
export const GET_STRATEGY_LIVE_STATS = `
import StrategyRegistry from ${STRATEGY_REGISTRY_ADDRESS}

access(all) fun main(): {String: AnyStruct} {
  return {
    "totalTVL": StrategyRegistry.getTotalTVL(),
    "totalParticipants": StrategyRegistry.getTotalParticipants(),
    "totalYieldGenerated": StrategyRegistry.getTotalYieldGenerated(),
    "strategies": StrategyRegistry.getAllStrategies()
  }
}
`

// NOTE: weeklyRate and updatedAtBlock exist in local YieldOracle.cdc but the on-chain
// contract at SENTINEL_VAULT_ADDRESS was deployed before those fields were added.
// Script only reads fields present in the deployed on-chain struct.
// TODO: redeploy YieldOracle.cdc to testnet to re-enable weeklyRate + updatedAtBlock.
export const GET_ALL_APYS = `
import YieldOracle from ${SENTINEL_VAULT_ADDRESS}
access(all) fun main(): {String: {String: AnyStruct}} {
  let allAPYs = YieldOracle.readAllAPYs()
  let result: {String: {String: AnyStruct}} = {}
  for strategyId in allAPYs.keys {
    let data = allAPYs[strategyId]!
    result[strategyId] = {
      "apy": data.apy,
      "dailyRate": data.dailyRate,
      "source": data.source,
      "updatedAt": data.updatedAt,
      "confidence": data.confidence
    }
  }
  return result
}
`

export const GET_FLOW_BALANCE = `
import FlowToken from ${FLOW_TOKEN_ADDRESS}
import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}
access(all) fun main(address: Address): UFix64 {
  let account = getAccount(address)
  let vaultRef = account.capabilities.borrow<&{FungibleToken.Balance}>(/public/flowTokenBalance)
  return vaultRef?.balance ?? 0.0
}
`

// Phase 2: Full protocol stats — reserve balance, health, fees, TVL
// Queries only fields confirmed to exist on the deployed on-chain contract.
// getProtocolStats() and getGlobalMEVStats() were added in later phases and may
// not exist yet — the script is intentionally minimal to avoid 400 errors.
// TODO: redeploy SentinelVaultV2.cdc to testnet to restore full stats.
export const GET_PROTOCOL_STATS = `
import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}

access(all) fun main(): {String: AnyStruct} {
  return {
    "totalVaults": SentinelVaultFinal.totalVaults,
    "totalValueLocked": SentinelVaultFinal.totalValueLocked,
    "totalYieldDistributed": SentinelVaultFinal.totalYieldDistributed,
    "totalFeesCollected": SentinelVaultFinal.totalFeesCollected
  }
}
`

// Phase 5: Query a specific user's vaults that are due for execution — used by strategy-keeper
export const GET_VAULTS_DUE_FOR_EXECUTION = `
import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}

access(all) fun main(address: Address): [{String: AnyStruct}] {
  let account = getAccount(address)
  let collectionRef = account.capabilities.borrow<&{SentinelVaultFinal.CollectionPublic}>(
    SentinelVaultFinal.VaultCollectionPublicPath
  )
  if collectionRef == nil { return [] }

  let now = getCurrentBlock().timestamp
  var result: [{String: AnyStruct}] = []

  for vaultInfo in collectionRef!.getVaultInfos() {
    if !vaultInfo.isActive { continue }
    let isDue = vaultInfo.nextScheduledExecution == nil
      ? vaultInfo.lastExecution == nil
      : now >= vaultInfo.nextScheduledExecution!
    if isDue {
      result.append({
        "vaultId": vaultInfo.id,
        "owner": address,
        "strategyId": vaultInfo.strategyId,
        "secondsOverdue": vaultInfo.nextScheduledExecution != nil
          ? now - vaultInfo.nextScheduledExecution!
          : 0.0 as UFix64,
        "executionInterval": vaultInfo.executionIntervalSeconds,
        "nextScheduledExecution": vaultInfo.nextScheduledExecution
      })
    }
  }
  return result
}
`
