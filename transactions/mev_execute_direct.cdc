import MEVShieldCore from 0xc13b08053be24e87
import SentinelVaultFinal from 0xc13b08053be24e87
import SentinelInterfaces from 0xc13b08053be24e87
import LiquidStakingStrategy from 0xc13b08053be24e87
import YieldFarmingStrategy from 0xc13b08053be24e87
import ArbitrageStrategy from 0xc13b08053be24e87

transaction(vaultId: UInt64, strategyId: String, expectedAPY: UFix64, nonce: UInt64, commitHash: String) {

    prepare(signer: auth(BorrowValue) &Account) {
        // Step 1: Create a lightweight commit for tracking
        MEVShieldCore.createCommit(
            vaultId: vaultId,
            commitHash: commitHash,
            protectionLevel: 1
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
