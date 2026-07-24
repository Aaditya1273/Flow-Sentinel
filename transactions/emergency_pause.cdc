import SentinelVaultFinal from 0xc13b08053be24e87

// Emergency pause a Sentinel Vault (V2 Collection API)
transaction(vaultId: UInt64) {
    let vaultRef: auth(SentinelVaultFinal.Pause) &SentinelVaultFinal.Vault

    prepare(signer: auth(BorrowValue) &Account) {
        let collection = signer.storage.borrow<&SentinelVaultFinal.Collection>(from: SentinelVaultFinal.VaultCollectionStoragePath)
            ?? panic("Could not borrow vault collection")
        self.vaultRef = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Vault not found")
    }

    execute {
        self.vaultRef.emergencyPause()
        log("Emergency pause activated for vault ".concat(vaultId.toString()))
    }
}
