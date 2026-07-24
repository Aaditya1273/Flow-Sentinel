import MEVShieldCore from 0xc13b08053be24e87
import SentinelVaultFinal from 0xc13b08053be24e87
import SentinelInterfaces from 0x136b642d0aa31ca9
import LiquidStakingStrategy from 0xc13b08053be24e87
import YieldFarmingStrategy from 0xc13b08053be24e87
import ArbitrageStrategy from 0xc13b08053be24e87

// ── MEV Reveal Transaction — Layers 1-4: Full Protection ──
//
// Phase 1 Fix: commitHash is now [UInt8] (SHA3-256 hash bytes), not a String.
//
// This is Step 2 of the two-step commit-reveal flow.
// Call this after mev_commit.cdc has been confirmed on-chain.
//
// The contract will:
//   1. Verify the provided params hash to the same bytes as the stored commit (Layer 1)
//   2. Apply VRF block-delay jitter (Layer 2)
//   3. Check price deviation against YieldOracle (Layer 3)
//   4. Add to shuffled execution queue (Layer 4)
//
// Parameters match exactly what was used to generate the commit hash in mev_commit.cdc.
//
transaction(
    vaultId: UInt64,
    commitHash: [UInt8],
    nonce: UInt64,
    amount: UFix64,
    strategyId: String,
    deadlineBlock: UInt64,
    expectedAPY: UFix64,
    slippageBps: UFix64
) {
    prepare(signer: auth(BorrowValue) &Account) {
        assert(commitHash.length == 32, message: "commitHash must be 32 bytes")

        // Step 1: Reveal the commit — verifies hash, applies VRF jitter, enqueues execution
        let executeAtBlock = MEVShieldCore.revealExecution(
            vaultId: vaultId,
            commitHash: commitHash,
            nonce: nonce,
            amount: amount,
            strategyId: strategyId,
            deadlineBlock: deadlineBlock,
            expectedAPY: expectedAPY,
            slippageBps: slippageBps
        )

        // Step 2: Borrow vault with strategy execution entitlement
        let collection = signer.storage.borrow<&SentinelVaultFinal.Collection>(
            from: SentinelVaultFinal.VaultCollectionStoragePath
        ) ?? panic("No vault collection found — create one with init_sentinel.cdc first")

        let vault = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Vault #".concat(vaultId.toString()).concat(" not found in collection"))

        // Step 3: Create the strategy executor and run with full MEV protection
        if strategyId == "liquid-staking-pro" {
            let executor <- LiquidStakingStrategy.createExecutor()
            vault.executeStrategyWithMEV(
                executor: <-executor,
                commitHash: commitHash,
                expectedAPY: expectedAPY,
                nonce: nonce
            )
        } else if strategyId == "defi-yield-maximizer" || strategyId == "high-yield-farming" {
            let executor <- YieldFarmingStrategy.createExecutor()
            vault.executeStrategyWithMEV(
                executor: <-executor,
                commitHash: commitHash,
                expectedAPY: expectedAPY,
                nonce: nonce
            )
        } else if strategyId == "arbitrage-hunter" {
            let executor <- ArbitrageStrategy.createExecutor()
            vault.executeStrategyWithMEV(
                executor: <-executor,
                commitHash: commitHash,
                expectedAPY: expectedAPY,
                nonce: nonce
            )
        } else {
            panic("Unknown strategyId: '".concat(strategyId).concat("' — use liquid-staking-pro, defi-yield-maximizer, high-yield-farming, or arbitrage-hunter"))
        }
    }
}
