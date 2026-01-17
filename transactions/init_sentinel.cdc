import SentinelVault from 0x136b642d0aa31ca9
import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7

// Initialize a new Sentinel Vault for the user
transaction() {
    
    prepare(signer: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
        // Check if vault already exists
        if signer.storage.borrow<&SentinelVault.Vault>(from: SentinelVault.VaultStoragePath) != nil {
            log("Sentinel Vault already exists")
            return
        }
        
        // Create a new Sentinel Vault
        let sentinelVault <- SentinelVault.createVault(owner: signer.address)
        
        // Store the vault in the user's account
        signer.storage.save(<-sentinelVault, to: SentinelVault.VaultStoragePath)
        
        // Create public capability for vault
        let vaultCap = signer.capabilities.storage.issue<&SentinelVault.Vault>(SentinelVault.VaultStoragePath)
        signer.capabilities.publish(vaultCap, at: SentinelVault.VaultPublicPath)
    }
    
    execute {
        log("Sentinel Vault initialized successfully")
    }
}