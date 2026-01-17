import SentinelVault from 0x136b642d0aa31ca9

// Script to get comprehensive vault information
access(all) fun main(address: Address): {String: AnyStruct} {
    
    // Get public capability for the vault
    let vaultRef = getAccount(address)
        .capabilities.get<&SentinelVault.Vault>(SentinelVault.VaultPublicPath)
        .borrow()
    
    if vaultRef == nil {
        return {
            "error": "No Sentinel Vault found for this address",
            "hasVault": false
        }
    }
    
    let vault = vaultRef!
    
    return {
        "hasVault": true,
        "balance": vault.getBalance(),
        "status": vault.getStatus(),
        "isActive": vault.getIsActive(),
        "lastExecution": vault.getLastExecution(),
        "owner": vault.getOwner(),
        "totalVaults": SentinelVault.getTotalVaults(),
        "totalValueLocked": SentinelVault.getTotalValueLocked()
    }
}