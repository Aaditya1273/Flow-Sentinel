import SentinelVaultFinal from 0xc13b08053be24e87

transaction(vaultId: UInt64) {
    let vaultRef: auth(SentinelVaultFinal.Resume) &SentinelVaultFinal.Vault

    prepare(signer: auth(BorrowValue) &Account) {
        let collection = signer.storage.borrow<&SentinelVaultFinal.Collection>(
            from: SentinelVaultFinal.VaultCollectionStoragePath
        ) ?? panic("Could not borrow collection reference")

        self.vaultRef = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Could not borrow vault reference")
    }

    execute {
        self.vaultRef.resume()
    }
}
