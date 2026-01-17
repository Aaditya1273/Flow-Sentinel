import SentinelVault from 0xf8d6e0586b0a20c7
import FlowToken from 0x1654653399040a61
import FungibleToken from 0xf233dcee88fe0abe

// Deposit FLOW tokens into the Sentinel Vault
transaction(amount: UFix64) {
    
    let sentinelVault: auth(SentinelVault.Deposit) &SentinelVault.Vault
    let flowVault: auth(FungibleToken.Withdraw) &FlowToken.Vault
    
    prepare(signer: auth(BorrowValue) &Account) {
        // Get reference to the user's Sentinel Vault
        self.sentinelVault = signer.storage.borrow<auth(SentinelVault.Deposit) &SentinelVault.Vault>(from: SentinelVault.VaultStoragePath)
            ?? panic("Could not borrow Sentinel Vault from storage")
        
        // Get reference to the user's Flow Vault
        self.flowVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow Vault from storage")
    }
    
    execute {
        // Withdraw FLOW from user's vault
        let depositVault <- self.flowVault.withdraw(amount: amount)
        
        // Deposit into Sentinel Vault
        self.sentinelVault.deposit(from: <-depositVault)
        
        log("Deposited ".concat(amount.toString()).concat(" FLOW into Sentinel Vault"))
    }
    
    post {
        // Verify the deposit was successful
        self.sentinelVault.getBalance() >= amount: "Deposit failed - balance not updated"
    }
}