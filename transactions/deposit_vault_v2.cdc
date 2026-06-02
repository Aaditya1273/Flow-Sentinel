import SentinelVaultFinal from 0xc13b08053be24e87
import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7

transaction(vaultId: UInt64, amount: UFix64) {
    let flowVault: @{FungibleToken.Vault}
    let vaultRef: auth(SentinelVaultFinal.Deposit) &SentinelVaultFinal.Vault

    prepare(signer: auth(FungibleToken.Withdraw, BorrowValue) &Account) {
        let flowVaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
            from: /storage/flowTokenVault
        ) ?? panic("Could not borrow Flow vault reference")
        self.flowVault <- flowVaultRef.withdraw(amount: amount)

        let collection = signer.storage.borrow<&SentinelVaultFinal.Collection>(
            from: SentinelVaultFinal.VaultCollectionStoragePath
        ) ?? panic("Could not borrow collection reference")
        self.vaultRef = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Could not borrow vault reference")
    }

    execute {
        self.vaultRef.deposit(from: <-self.flowVault)
    }
}
