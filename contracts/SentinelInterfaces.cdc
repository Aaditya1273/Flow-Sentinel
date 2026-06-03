import FungibleToken from 0x9a0766d93b6608b7

// Standard interfaces for Flow Sentinel ecosystem (v2.0)
// Enhanced with Pro-Grade MEV Protection System
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
        access(all) fun executeStrategy(vaultBalance: UFix64): UFix64
        access(all) fun getExpectedYield(amount: UFix64): UFix64
        access(all) fun getRiskLevel(): UInt8
    }
    
    // ── Enhanced MEV Shield Interface ──────────────────────────────────
    // Adapted from Flashbots MEV-Boost architecture for Flow/Cadence:
    //
    //   Layer 1 — Commit-Reveal Execution  (PBS blind block building)
    //   Layer 2 — VRF Block-Delay Jitter   (Timing games)
    //   Layer 3 — Price Deviation Guard    (Relay mux / multi-source)
    //   Layer 4 — Execution Queue          (Proposer scheduling)
    //
    access(all) resource interface IMEVShield {
        // ── Core Protection Getters ──
        access(all) fun isProtected(): Bool
        access(all) fun getProtectionLevel(): UInt8          // 0=None, 1=Basic, 2=Standard, 3=Full
        access(all) fun getShieldStatus(): {String: AnyStruct}
        
        // ── Layer 1: Commit-Reveal ──
        access(all) fun createCommit(commitHash: String)
        access(all) fun revealExecution(
            vaultId: UInt64,
            commitHash: String,
            nonce: UInt64,
            amount: UFix64,
            strategyId: String,
            deadlineBlock: UInt64,
            expectedAPY: UFix64,
            slippageBps: UFix64
        ): UInt64
        
        // ── Layer 2: VRF Block-Delay ──
        access(all) fun applyJitter(): UInt64
        access(all) fun getRandomDelay(): UFix64
        access(all) fun getScheduledBlock(): UInt64?
        
        // ── Layer 3: Price Guard ──
        access(all) fun checkExecutionBounds(
            amount: UFix64,
            expectedAPY: UFix64,
            actualAPY: UFix64
        ): Bool
        access(all) fun getSlippageBps(): UFix64
        access(all) fun getDeviationTolerance(): UFix64
        
        // ── Layer 4: Queue ──
        access(all) fun getQueuePosition(): UInt64?
        access(all) fun getExecutionStatus(): String
    }
    
    // ── MEV Shield Info (no-interface struct) ──
    access(all) struct MEVShieldInfo {
        access(all) let protectionLevel: String
        access(all) let commitRevealEnabled: Bool
        access(all) let blockDelayEnabled: Bool
        access(all) let priceGuardEnabled: Bool
        access(all) let executionQueueEnabled: Bool
        access(all) let totalProtectionsTriggered: UInt64
        access(all) let slippageBps: UFix64
        access(all) let currentProtectionStatus: String
        
        init(
            protectionLevel: String,
            commitRevealEnabled: Bool,
            blockDelayEnabled: Bool,
            priceGuardEnabled: Bool,
            executionQueueEnabled: Bool,
            totalProtectionsTriggered: UInt64,
            slippageBps: UFix64,
            currentProtectionStatus: String
        ) {
            self.protectionLevel = protectionLevel
            self.commitRevealEnabled = commitRevealEnabled
            self.blockDelayEnabled = blockDelayEnabled
            self.priceGuardEnabled = priceGuardEnabled
            self.executionQueueEnabled = executionQueueEnabled
            self.totalProtectionsTriggered = totalProtectionsTriggered
            self.slippageBps = slippageBps
            self.currentProtectionStatus = currentProtectionStatus
        }
    }
    
    // ── MEV Protection Levels ──
    access(all) enum ProtectionLevel: UInt8 {
        access(all) case None          // 0 — No protection
        access(all) case Basic         // 1 — VRF block-delay jitter only
        access(all) case Standard      // 2 — Commit-reveal + block-delay
        access(all) case Full          // 3 — All layers active (recommended)
    }
    
    // ── Events for the ecosystem ──
    access(all) event VaultOperation(vaultId: UInt64, operation: String, amount: UFix64)
    access(all) event StrategyUpdate(strategyId: UInt64, newParametersCount: UInt64)
    access(all) event SecurityEvent(vaultId: UInt64, eventType: String, severity: UInt8)
    
    // ── MEV-specific events ──
    access(all) event MEVProtectionActivated(vaultId: UInt64, protectionLevel: UInt8, layer: String)
    access(all) event MEVAttackBlocked(vaultId: UInt64, attackType: String, blockedBy: String)
    access(all) event MEVCommitCreated(vaultId: UInt64, commitHash: String, deadlineBlock: UInt64)
    access(all) event MEVCommitRevealed(vaultId: UInt64, commitHash: String, blockDelay: UInt64)
    
    // Standard error codes
    access(all) enum ErrorCode: UInt8 {
        access(all) case Success
        access(all) case InsufficientBalance
        access(all) case VaultPaused
        access(all) case InvalidAmount
        access(all) case StrategyFailed
        access(all) case SecurityBreach
        access(all) case MEVBlocked          // New: Execution blocked by MEV protection
        access(all) case CommitExpired       // New: Commit deadline passed
        access(all) case SlippageExceeded   // New: Price deviation exceeds bounds
    }
    
    // Utility functions
    access(all) fun formatAmount(_ amount: UFix64): String {
        return amount.toString().concat(" FLOW")
    }
    
    access(all) fun calculateYield(principal: UFix64, rate: UFix64, time: UFix64): UFix64 {
        return principal * rate * time / 365.0 / 86400.0 // Daily compounding
    }
    
    // Describe protection level
    access(all) fun describeProtectionLevel(level: UInt8): String {
        if level == UInt8(ProtectionLevel.None.rawValue) {
            return "None — MEV protection disabled"
        } else if level == UInt8(ProtectionLevel.Basic.rawValue) {
            return "Basic — VRF Block-Delay Jitter active"
        } else if level == UInt8(ProtectionLevel.Standard.rawValue) {
            return "Standard — Commit-Reveal + Block-Delay active"
        } else if level == UInt8(ProtectionLevel.Full.rawValue) {
            return "Full — All 4 MEV protection layers active"
        }
        return "Unknown"
    }
}
