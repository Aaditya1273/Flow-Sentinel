import SentinelVaultFinal from 0xc13b08053be24e87
import SentinelInterfaces from 0xc13b08053be24e87
import LiquidStakingStrategy from 0xc13b08053be24e87
import YieldFarmingStrategy from 0xc13b08053be24e87
import ArbitrageStrategy from 0xc13b08053be24e87

transaction(vaultId: UInt64, strategyId: String) {
    let vaultRef: auth(SentinelVaultFinal.StrategyExecution) &SentinelVaultFinal.Vault

    prepare(signer: auth(BorrowValue) &Account) {
        let collection = signer.storage.borrow<&SentinelVaultFinal.Collection>(
            from: SentinelVaultFinal.VaultCollectionStoragePath
        ) ?? panic("Could not borrow collection reference")

        self.vaultRef = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Could not borrow vault reference")
    }

    execute {
        var executor: @{SentinelInterfaces.IStrategy} <-!

        if strategyId == "liquid-staking-pro" {
            executor <-! LiquidStakingStrategy.createExecutor()
        } else if strategyId == "defi-yield-maximizer" || strategyId == "high-yield-farming" {
            executor <-! YieldFarmingStrategy.createExecutor()
        } else if strategyId == "arbitrage-hunter" {
            executor <-! ArbitrageStrategy.createExecutor()
        } else {
            executor <-! LiquidStakingStrategy.createExecutor()
        }

        self.vaultRef.performStrategy(executor: <-executor)
    }
}
