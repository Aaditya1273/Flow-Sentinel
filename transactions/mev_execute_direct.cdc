import MEVShieldCore from 0xc13b08053be24e87
import SentinelVaultFinal from 0xc13b08053be24e87
import SentinelInterfaces from 0x136b642d0aa31ca9
import LiquidStakingStrategy from 0xc13b08053be24e87
import YieldFarmingStrategy from 0xc13b08053be24e87
import ArbitrageStrategy from 0xc13b08053be24e87

// ── MEV Direct Execute Transaction — Layers 2-4 (Reduced Layer 1) ──
//
// Phase 1 Fix: commitHash is now [UInt8] (SHA3-256 hash bytes), not a String.
//
// This performs commit + reveal atomically in one transaction.
// Tradeoff: execution params are visible in the mempool when this tx is submitted.
// Layer 1 (mempool hiding) is NOT active — use mev_commit.cdc + mev_reveal.cdc for full protection.
// Layers 2-4 (VRF jitter, price guard, queue shuffle) ARE active.
//
// The commitHash and nonce are computed off-chain using lib/mev-hash.ts.
//
transaction(vaultId: UInt64, strategyId: String, expectedAPY: UFix64, nonce: UInt64, commitHash: [UInt8]) {
    prepare(signer: auth(BorrowValue) &Account) {
        assert(commitHash.length == 32, message: "commitHash must be 32 bytes (SHA3-256)")

        // Commit and reveal happen in the same block — Layer 1 protection is reduced
        // because both the hash AND the preimage are visible to mempool observers
        MEVShieldCore.createCommit(
            vaultId: vaultId,
            commitHash: commitHash,
            protectionLevel: 1,       // Basic — Layer 1 is best-effort in single-tx mode
            committedBy: signer.address
        )

        let commitDeadline = getCurrentBlock().height + MEVShieldCore.getMEVCommitBlocks()
        MEVShieldCore.revealExecution(
            vaultId: vaultId,
            commitHash: commitHash,
            nonce: nonce,
            amount: 0.0,              // amount=0 bypasses amount check for direct mode
            strategyId: strategyId,
            deadlineBlock: commitDeadline,
            expectedAPY: expectedAPY,
            slippageBps: 300.0
        )

        let collection = signer.storage.borrow<&SentinelVaultFinal.Collection>(
            from: SentinelVaultFinal.VaultCollectionStoragePath
        ) ?? panic("No vault collection found")

        let vault = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Vault #".concat(vaultId.toString()).concat(" not found"))

        if strategyId == "liquid-staking-pro" {
            let executor <- LiquidStakingStrategy.createExecutor()
            vault.executeStrategyWithMEV(
                executor: <-executor, commitHash: commitHash,
                expectedAPY: expectedAPY, nonce: nonce
            )
        } else if strategyId == "defi-yield-maximizer" || strategyId == "high-yield-farming" {
            let executor <- YieldFarmingStrategy.createExecutor()
            vault.executeStrategyWithMEV(
                executor: <-executor, commitHash: commitHash,
                expectedAPY: expectedAPY, nonce: nonce
            )
        } else if strategyId == "arbitrage-hunter" {
            let executor <- ArbitrageStrategy.createExecutor()
            vault.executeStrategyWithMEV(
                executor: <-executor, commitHash: commitHash,
                expectedAPY: expectedAPY, nonce: nonce
            )
        } else {
            panic("Unknown strategyId: ".concat(strategyId))
        }
    }
}
