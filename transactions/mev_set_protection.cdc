import SentinelVaultFinal from 0xc13b08053be24e87
import MEVShieldCore from 0xc13b08053be24e87

// MEV Protection Settings Transaction
//
// Update a vault's MEV protection level and slippage tolerance.
//
// Protection Levels:
//   0 = None     — MEV protection disabled
//   1 = Basic    — VRF Block-Delay Jitter only
//   2 = Standard — Commit-Reveal + Block-Delay
//   3 = Full     — All layers active (recommended)
//
// Parameters:
//   - vaultId: The vault to configure
//   - newProtectionLevel: 0-3
//   - newSlippageBps: Slippage tolerance in basis points (e.g., 300 = 3%)
//
transaction(vaultId: UInt64, newProtectionLevel: UInt8, newSlippageBps: UFix64) {
    
    prepare(signer: auth(BorrowValue) &Account) {
        let collection = signer.storage.borrow<auth(Storage) &SentinelVaultFinal.Collection>(
            from: SentinelVaultFinal.VaultCollectionStoragePath
        ) ?? panic("Could not borrow vault collection")
        
        let vault = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Vault not found")
        
        // Update MEV protection level
        vault.setProtectionLevel(newLevel: newProtectionLevel)
        
        // Update slippage tolerance
        vault.setSlippageBps(newSlippageBps: newSlippageBps)
    }
}
