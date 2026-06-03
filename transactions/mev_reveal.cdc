import MEVShieldCore from 0xc13b08053be24e87
import SentinelVaultFinal from 0xc13b08053be24e87
import SentinelInterfaces from 0xc13b08053be24e87
import LiquidStakingStrategy from 0xc13b08053be24e87
import YieldFarmingStrategy from 0xc13b08053be24e87
import ArbitrageStrategy from 0xc13b08053be24e87

transaction(
    vaultId: UInt64,
    commitHash: String,
    nonce: UInt64,
    amount: UFix64,
    strategyId: String,
    deadlineBlock: UInt64,
    expectedAPY: UFix64,
    slippageBps: UFix64
) {

    prepare(signer: auth(BorrowValue) &Account) {
        // Step 1: Reveal the commit — triggers VRF block-delay jitter
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

        // Step 2: Borrow the vault
        let collection = signer.storage.borrow<&SentinelVaultFinal.Collection>(
            from: SentinelVaultFinal.VaultCollectionStoragePath
        ) ?? panic("Could not borrow vault collection")

        let vault = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Vault not found")

        // Step 3: Create executor and execute per strategy branch
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
            panic("Unknown strategy: ".concat(strategyId))
        }
    }
}
