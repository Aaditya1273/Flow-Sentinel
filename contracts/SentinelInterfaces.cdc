import FungibleToken

// Standard interfaces for Flow Sentinel ecosystem (v3.0)
// Phase 3: Added StrategyResult struct — strategies now report real protocol data,
//          not just a yield number. IStrategy.executeStrategy() returns StrategyResult.
access(all) contract SentinelInterfaces {

    // Interface for vault operations
    access(all) resource interface IVault {
        access(all) fun deposit(from: @{FungibleToken.Vault})
        access(all) fun withdraw(amount: UFix64): @{FungibleToken.Vault}
        access(all) fun getBalance(): UFix64
        access(all) fun emergencyPause()
        access(all) fun resume()
    }

    // ── Phase 3: StrategyResult — rich return value from executeStrategy() ──
    // Replaces bare UFix64 return so callers get provenance data alongside yield.
    access(all) struct StrategyResult {
        // Yield amount to be distributed to the vault (in FLOW tokens)
        access(all) let yieldAmount: UFix64

        // The protocol(s) that generated this yield — auditable on-chain
        access(all) let protocolSource: String

        // The actual APY observed during execution (may differ from oracle estimate)
        access(all) let realizedAPY: UFix64

        // Confidence score 0.0-1.0 — how reliable this execution was
        access(all) let confidence: UFix64

        // Human-readable execution summary — logged in StrategyExecuted event
        access(all) let executionNote: String

        // Block height at which this execution occurred
        access(all) let executedAtBlock: UInt64

        // Strategy identifier that generated this result
        access(all) let strategyId: String

        // Whether real protocol calls succeeded (false = fallback math used)
        access(all) let usedRealProtocol: Bool

        init(
            yieldAmount: UFix64,
            protocolSource: String,
            realizedAPY: UFix64,
            confidence: UFix64,
            executionNote: String,
            strategyId: String,
            usedRealProtocol: Bool
        ) {
            self.yieldAmount = yieldAmount
            self.protocolSource = protocolSource
            self.realizedAPY = realizedAPY
            self.confidence = confidence
            self.executionNote = executionNote
            self.executedAtBlock = getCurrentBlock().height
            self.strategyId = strategyId
            self.usedRealProtocol = usedRealProtocol
        }
    }

    // Interface for strategy execution — Phase 3: returns StrategyResult
    access(all) resource interface IStrategy {
        /// Execute the strategy and return rich result data.
        /// @param vaultBalance — current FLOW balance available for execution
        /// @return StrategyResult — yield amount + full provenance data
        access(all) fun executeStrategy(vaultBalance: UFix64): StrategyResult

        /// Estimate yield without executing — used for APY display
        access(all) fun getExpectedYield(amount: UFix64): UFix64

        /// Risk level 1=Low 2=Medium 3=High
        access(all) fun getRiskLevel(): UInt8

        /// Protocol source identifier — shown in UI and events
        access(all) fun getProtocolSource(): String
    }

    // ── MEV Shield Interface (unchanged) ──
    access(all) resource interface IMEVShield {
        access(all) fun isProtected(): Bool
        access(all) fun getProtectionLevel(): UInt8
        access(all) fun getShieldStatus(): {String: AnyStruct}
        access(all) fun createCommit(commitHash: [UInt8])
        access(all) fun revealExecution(
            vaultId: UInt64, commitHash: [UInt8], nonce: UInt64, amount: UFix64,
            strategyId: String, deadlineBlock: UInt64, expectedAPY: UFix64, slippageBps: UFix64
        ): UInt64
        access(all) fun applyJitter(): UInt64
        access(all) fun getRandomDelay(): UFix64
        access(all) fun getScheduledBlock(): UInt64?
        access(all) fun checkExecutionBounds(amount: UFix64, expectedAPY: UFix64, actualAPY: UFix64): Bool
        access(all) fun getSlippageBps(): UFix64
        access(all) fun getDeviationTolerance(): UFix64
        access(all) fun getQueuePosition(): UInt64?
        access(all) fun getExecutionStatus(): String
    }

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
            protectionLevel: String, commitRevealEnabled: Bool, blockDelayEnabled: Bool,
            priceGuardEnabled: Bool, executionQueueEnabled: Bool, totalProtectionsTriggered: UInt64,
            slippageBps: UFix64, currentProtectionStatus: String
        ) {
            self.protectionLevel = protectionLevel; self.commitRevealEnabled = commitRevealEnabled
            self.blockDelayEnabled = blockDelayEnabled; self.priceGuardEnabled = priceGuardEnabled
            self.executionQueueEnabled = executionQueueEnabled
            self.totalProtectionsTriggered = totalProtectionsTriggered
            self.slippageBps = slippageBps; self.currentProtectionStatus = currentProtectionStatus
        }
    }

    access(all) enum ProtectionLevel: UInt8 {
        access(all) case None
        access(all) case Basic
        access(all) case Standard
        access(all) case Full
    }

    access(all) event VaultOperation(vaultId: UInt64, operation: String, amount: UFix64)
    access(all) event StrategyUpdate(strategyId: UInt64, newParametersCount: UInt64)
    access(all) event SecurityEvent(vaultId: UInt64, eventType: String, severity: UInt8)
    access(all) event MEVProtectionActivated(vaultId: UInt64, protectionLevel: UInt8, layer: String)
    access(all) event MEVAttackBlocked(vaultId: UInt64, attackType: String, blockedBy: String)
    access(all) event MEVCommitCreated(vaultId: UInt64, commitHashHex: String, deadlineBlock: UInt64)
    access(all) event MEVCommitRevealed(vaultId: UInt64, commitHashHex: String, blockDelay: UInt64)

    access(all) enum ErrorCode: UInt8 {
        access(all) case Success
        access(all) case InsufficientBalance
        access(all) case VaultPaused
        access(all) case InvalidAmount
        access(all) case StrategyFailed
        access(all) case SecurityBreach
        access(all) case MEVBlocked
        access(all) case CommitExpired
        access(all) case SlippageExceeded
    }

    access(all) fun formatAmount(_ amount: UFix64): String {
        return amount.toString().concat(" FLOW")
    }

    access(all) fun calculateYield(principal: UFix64, rate: UFix64, time: UFix64): UFix64 {
        return principal * rate * time / 365.0 / 86400.0
    }

    access(all) fun describeProtectionLevel(level: UInt8): String {
        if level == UInt8(ProtectionLevel.None.rawValue) { return "None — MEV protection disabled" }
        if level == UInt8(ProtectionLevel.Basic.rawValue) { return "Basic — VRF Block-Delay Jitter active" }
        if level == UInt8(ProtectionLevel.Standard.rawValue) { return "Standard — Commit-Reveal + Block-Delay active" }
        if level == UInt8(ProtectionLevel.Full.rawValue) { return "Full — All 4 MEV protection layers active" }
        return "Unknown"
    }
}
