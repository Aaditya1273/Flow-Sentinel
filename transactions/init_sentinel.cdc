import SentinelVaultFinal from 0xc13b08053be24e87
import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7
import MEVShieldCore from 0xc13b08053be24e87

// Initialize a new Sentinel Vault (MEV) with MEV Shield protection
transaction(vaultName: String, strategyName: String, strategyId: String) {

    prepare(signer: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
        if signer.storage.borrow<&SentinelVaultFinal.Collection>(from: SentinelVaultFinal.VaultCollectionStoragePath) != nil {
            log("Sentinel MEV Collection already exists")
            return
        }

        let collection <- SentinelVaultFinal.createEmptyCollection()

        let vault <- SentinelVaultFinal.createVault(
            owner: signer.address,
            name: vaultName,
            strategyName: strategyName,
            strategyId: strategyId,
            protectionLevel: 3,
            slippageBps: 300.0
        )

        collection.deposit(vault: <-vault)
        signer.storage.save(<-collection, to: SentinelVaultFinal.VaultCollectionStoragePath)

        let cap = signer.capabilities.storage.issue<&{SentinelVaultFinal.CollectionPublic}>(
            SentinelVaultFinal.VaultCollectionStoragePath
        )
        signer.capabilities.publish(cap, at: SentinelVaultFinal.VaultCollectionPublicPath)

        log("Sentinel Vault (MEV) with Full MEV Protection initialized successfully")
    }
}
