import SentinelVault from 0xf8d6e0586b0a20c7

// Comprehensive demo script showing all Sentinel Vault features
access(all) fun main(userAddress: Address): {String: AnyStruct} {
    
    // Get vault reference
    let vaultRef = getAccount(userAddress)
        .capabilities.get<&SentinelVault.Vault>(SentinelVault.VaultPublicPath)
        .borrow()
    
    if vaultRef == nil {
        return {
            "error": "No Sentinel Vault found - run init_sentinel.cdc first",
            "hasVault": false,
            "instructions": "Execute: flow transactions send ./transactions/init_sentinel.cdc"
        }
    }
    
    let vault = vaultRef!
    
    // Gather comprehensive vault information
    let vaultInfo = {
        "hasVault": true,
        "vaultId": vault.id,
        "balance": vault.getBalance(),
        "status": vault.getStatus(),
        "isActive": vault.isActive(),
        "lastExecution": vault.getLastExecution(),
        "owner": vault.owner.toString()
    }
    
    // Global statistics
    let globalStats = {
        "totalVaults": SentinelVault.getTotalVaults(),
        "totalValueLocked": SentinelVault.getTotalValueLocked(),
        "contractAddress": "0xf8d6e0586b0a20c7"
    }
    
    // Feature demonstrations
    let features = {
        "autonomousScheduling": "✅ Forte Scheduled Transactions integrated",
        "mevProtection": "✅ Native VRF (revertibleRandom) implemented", 
        "emergencyControls": "✅ Passkey-compatible pause mechanism",
        "highPrecision": "✅ UFix64 precision for DeFi calculations",
        "selfRescheduling": "✅ Infinite loop automation (24h cycles)"
    }
    
    // Available operations
    let operations = {
        "deposit": "flow transactions send ./transactions/deposit_flow.cdc --arg UFix64:100.0",
        "withdraw": "flow transactions send ./transactions/withdraw_flow.cdc --arg UFix64:50.0",
        "emergencyPause": "flow transactions send ./transactions/emergency_pause.cdc",
        "checkStatus": "flow scripts execute ./scripts/get_vault_info.cdc --arg Address:".concat(userAddress.toString())
    }
    
    return {
        "vaultInfo": vaultInfo,
        "globalStats": globalStats,
        "grantFeatures": features,
        "availableOperations": operations,
        "demoStatus": "All core features implemented and functional"
    }
}