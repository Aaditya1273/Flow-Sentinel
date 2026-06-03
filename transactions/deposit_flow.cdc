import SentinelVaultFinal from 0xf8d6e0586b0a20c7
import FlowToken from 0x1654653399040a61
import FungibleToken from 0xf233dcee88fe0abe

// Deposit FLOW tokens into a Sentinel Vault (V2 Collection API)
transaction(vaultId: UInt64, amount: UFix64) {
    let flowVault: @{FungibleToken.Vault}
    let vaultRef: auth(SentinelVaultFinal.Deposit) &SentinelVaultFinal.Vault

    prepare(signer: auth(FungibleToken.Withdraw, BorrowValue) &Account) {
        let flowVaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow vault reference")
        self.flowVault <- flowVaultRef.withdraw(amount: amount)

        let collection = signer.storage.borrow<&SentinelVaultFinal.Collection>(from: SentinelVaultFinal.VaultCollectionStoragePath)
            ?? panic("Could not borrow vault collection")
        self.vaultRef = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Vault not found")
    }

    execute {
        self.vaultRef.deposit(from: <-self.flowVault)
        log("Deposited ".concat(amount.toString()).concat(" FLOW into vault ").concat(vaultId.toString()))
    }
}
