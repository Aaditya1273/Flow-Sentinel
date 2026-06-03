import SentinelVaultFinal from 0xf8d6e0586b0a20c7
import FlowToken from 0x1654653399040a61
import FungibleToken from 0xf233dcee88fe0abe

// Withdraw FLOW tokens from a Sentinel Vault (V2 Collection API)
transaction(vaultId: UInt64, amount: UFix64) {
    let vaultResource: auth(SentinelVaultFinal.Withdraw) &SentinelVaultFinal.Vault
    let flowReceiver: &{FungibleToken.Receiver}

    prepare(signer: auth(BorrowValue) &Account) {
        let collection = signer.storage.borrow<&SentinelVaultFinal.Collection>(from: SentinelVaultFinal.VaultCollectionStoragePath)
            ?? panic("Could not borrow vault collection")
        self.vaultResource = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Vault not found")

        self.flowReceiver = signer.capabilities.borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            ?? panic("Could not borrow Flow receiver")
    }

    execute {
        let withdrawnTokens <- self.vaultResource.withdraw(amount: amount)
        self.flowReceiver.deposit(from: <-withdrawnTokens)
        log("Withdrew ".concat(amount.toString()).concat(" FLOW from vault ").concat(vaultId.toString()))
    }
}
