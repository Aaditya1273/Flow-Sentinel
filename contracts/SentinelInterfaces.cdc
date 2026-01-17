import FungibleToken from 0x9a0766d93b6608b7

// Standard interfaces for Flow Sentinel ecosystem
access(all) contract SentinelInterfaces {
    
    // Interface for vault operations
    access(all) resource interface IVault {
        access(all) fun deposit(from: @{FungibleToken.Vault})
        access(all) fun withdraw(amount: UFix64): @{FungibleToken.Vault}
        access(all) fun getBalance(): UFix64
        access(all) fun emergencyPause()
        access(all) fun resume()
    }
    
    // Interface for strategy execution
    access(all) resource interface IStrategy {
        access(all) fun executeStrategy(vault: &AnyResource): UFix64
        access(all) fun getExpectedYield(): UFix64
        access(all) fun getRiskLevel(): UInt8
    }
    
    // Interface for MEV protection
    access(all) resource interface IMEVShield {
        access(all) fun applyJitter(): UInt64
        access(all) fun getRandomDelay(): UFix64
        access(all) fun isProtected(): Bool
    }
    
    // Events for the ecosystem
    access(all) event VaultOperation(vaultId: UInt64, operation: String, amount: UFix64)
    access(all) event StrategyUpdate(strategyId: UInt64, newParametersCount: UInt64)
    access(all) event SecurityEvent(vaultId: UInt64, eventType: String, severity: UInt8)
    
    // Standard error codes
    access(all) enum ErrorCode: UInt8 {
        access(all) case Success
        access(all) case InsufficientBalance
        access(all) case VaultPaused
        access(all) case InvalidAmount
        access(all) case StrategyFailed
        access(all) case SecurityBreach
    }
    
    // Utility functions
    access(all) fun formatAmount(_ amount: UFix64): String {
        return amount.toString().concat(" FLOW")
    }
    
    access(all) fun calculateYield(principal: UFix64, rate: UFix64, time: UFix64): UFix64 {
        return principal * rate * time / 365.0 / 86400.0 // Daily compounding
    }
}