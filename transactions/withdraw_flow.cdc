import SentinelVault from 0xf8d6e0586b0a20c7
import FlowToken from 0x1654653399040a61
import FungibleToken from 0xf233dcee88fe0abe

// Withdraw FLOW tokens from the Sentinel Vault
transaction(amount: UFix64) {
    
    let sentinelVault: auth(SentinelVault.Withdraw) &SentinelVault.Vault
    let flowVault: auth(FungibleToken.Withdraw) &FlowToken.Vault
    
    prepare(signer: auth(BorrowValue) &Account) {
        // Get reference to the user's Sentinel Vault
        self.sentinelVault = signer.storage.borrow<auth(SentinelVault.Withdraw) &SentinelVault.Vault>(from: SentinelVault.VaultStoragePath)
            ?? panic("Could not borrow Sentinel Vault from storage")
        
        // Get reference to the user's Flow Vault
        self.flowVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow Vault from storage")
    }
    
    execute {
        // Withdraw FLOW from Sentinel Vault
        let withdrawnVault <- self.sentinelVault.withdraw(amount: amount)
        
        // Deposit into user's Flow vault
        self.flowVault.deposit(from: <-withdrawnVault)
        
        log("Withdrew ".concat(amount.toString()).concat(" FLOW from Sentinel Vault"))
    }
    
    post {
        // Verify the withdrawal was successful
        self.sentinelVault.getBalance() >= 0.0: "Withdrawal failed - invalid balance"
    }
}