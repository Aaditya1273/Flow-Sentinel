import SentinelVaultFinal from 0xc13b08053be24e87
import StrategyRegistry from 0xc13b08053be24e87
import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7

transaction(strategyId: String) {
    let collectionRef: &SentinelVaultFinal.Collection

    prepare(signer: auth(BorrowValue, Storage, Capabilities) &Account) {
        // Check for existing collection and handle type mismatches
        if let existing = signer.storage.type(at: SentinelVaultFinal.VaultCollectionStoragePath) {
            if existing != Type<@SentinelVaultFinal.Collection>() {
                let old <- signer.storage.load<@AnyResource>(from: SentinelVaultFinal.VaultCollectionStoragePath)
                destroy old
                signer.capabilities.unpublish(SentinelVaultFinal.VaultCollectionPublicPath)
            }
        }

        if signer.storage.borrow<&SentinelVaultFinal.Collection>(
            from: SentinelVaultFinal.VaultCollectionStoragePath
        ) == nil {
            let collection <- SentinelVaultFinal.createEmptyCollection()
            signer.storage.save(<-collection, to: SentinelVaultFinal.VaultCollectionStoragePath)
        }

        // Re-publish capability
        signer.capabilities.unpublish(SentinelVaultFinal.VaultCollectionPublicPath)
        let cap = signer.capabilities.storage.issue<&{SentinelVaultFinal.CollectionPublic}>(
            SentinelVaultFinal.VaultCollectionStoragePath
        )
        signer.capabilities.publish(cap, at: SentinelVaultFinal.VaultCollectionPublicPath)

        self.collectionRef = signer.storage.borrow<&SentinelVaultFinal.Collection>(
            from: SentinelVaultFinal.VaultCollectionStoragePath
        ) ?? panic("Could not borrow collection reference")
    }

    execute {
        let strategyInfo = StrategyRegistry.getStrategy(strategyId: strategyId)
            ?? panic("Strategy not found")
        let strategyName = strategyInfo["name"] as! String

        let vault <- SentinelVaultFinal.createVault(
            owner: self.collectionRef.owner!.address,
            name: strategyName,
            strategyName: strategyName,
            strategyId: strategyId
        )

        self.collectionRef.deposit(vault: <-vault)
        StrategyRegistry.updateStrategyTVL(strategyId: strategyId, amount: 0.0, isDeposit: true)
    }
}
