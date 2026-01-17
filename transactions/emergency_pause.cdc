import SentinelVault from 0xf8d6e0586b0a20c7

// Emergency pause transaction - can be triggered via Passkeys/WebAuthn
transaction() {
    
    let sentinelVault: auth(SentinelVault.Pause) &SentinelVault.Vault
    
    prepare(signer: auth(BorrowValue) &Account) {
        // Get reference to the user's Sentinel Vault
        self.sentinelVault = signer.storage.borrow<auth(SentinelVault.Pause) &SentinelVault.Vault>(from: SentinelVault.VaultStoragePath)
            ?? panic("Could not borrow Sentinel Vault from storage")
    }
    
    execute {
        // Trigger emergency pause
        self.sentinelVault.emergencyPause()
        
        log("Emergency pause activated - all automated activities stopped")
    }
    
    post {
        // Verify the vault is now paused
        !self.sentinelVault.isActive(): "Emergency pause failed - vault still active"
    }
}