access(all) contract MEVShieldCore {

    access(all) event CommitCreated(vaultId: UInt64, commitHash: String, committedBy: Address, commitBlock: UInt64, deadlineBlock: UInt64)
    access(all) event CommitRevealed(vaultId: UInt64, commitHash: String, revealedBy: Address, actualAmount: UFix64, actualStrategyId: String, blockDelay: UInt64)
    access(all) event ExecutionScheduled(vaultId: UInt64, executeAtBlock: UInt64, jitterBlocks: UInt64)
    access(all) event ExecutionStarted(vaultId: UInt64, amount: UFix64, queuePosition: UInt64)
    access(all) event ExecutionCompleted(vaultId: UInt64, yieldGenerated: UFix64, slippageApplied: UFix64, mevShieldStatus: String)
    access(all) event ExecutionRejected(vaultId: UInt64, reason: String, deviation: UFix64)
    access(all) event SlippageBoundsUpdated(vaultId: UInt64, oldSlippageBps: UFix64, newSlippageBps: UFix64)
    access(all) event CommitExpired(vaultId: UInt64, commitHash: String, blocksOverdue: UInt64)

    access(all) enum ProtectionLevel: UInt8 {
        access(all) case None
        access(all) case Basic
        access(all) case Standard
        access(all) case Full
    }

    // ═══ Config accessors (functions, not stored fields — so updates take effect immediately) ═══

    // Commit window: 200 blocks (~3 minutes) for reliable reveal timing
    access(all) fun getMEVCommitBlocks(): UInt64 { return 200 }
    access(all) fun getMEVDelayMax(): UInt64 { return 5 }
    access(all) fun getMEVDeviationTolerance(): UFix64 { return 0.50 }
    access(all) fun getMEVSlippageBps(): UFix64 { return 300.0 }

    // Immutable info struct (no mutation needed)
    access(all) struct CommitRecord {
        access(all) let vaultId: UInt64
        access(all) let commitHash: String
        access(all) let committedBy: Address
        access(all) let committedAtBlock: UInt64
        access(all) let deadlineBlock: UInt64
        access(all) let isRevealed: Bool
        access(all) let isExpired: Bool
        access(all) let protectionLevel: UInt8

        init(vaultId: UInt64, commitHash: String, committedBy: Address, committedAtBlock: UInt64, deadlineBlock: UInt64, isRevealed: Bool, isExpired: Bool, protectionLevel: UInt8) {
            self.vaultId = vaultId; self.commitHash = commitHash; self.committedBy = committedBy
            self.committedAtBlock = committedAtBlock; self.deadlineBlock = deadlineBlock
            self.isRevealed = isRevealed; self.isExpired = isExpired; self.protectionLevel = protectionLevel
        }
    }

    access(all) struct PendingExecution {
        access(all) let vaultId: UInt64
        access(all) let commitHash: String
        access(all) let executeAtBlock: UInt64
        access(all) let amount: UFix64
        access(all) let strategyId: String
        access(all) let slippageBps: UFix64
        access(all) let expectedAPY: UFix64
        access(all) let nonce: UInt64
        access(all) let enqueuedAt: UFix64
        access(all) let isProcessed: Bool

        init(vaultId: UInt64, commitHash: String, executeAtBlock: UInt64, amount: UFix64, strategyId: String, slippageBps: UFix64, expectedAPY: UFix64, nonce: UInt64, enqueuedAt: UFix64, isProcessed: Bool) {
            self.vaultId = vaultId; self.commitHash = commitHash; self.executeAtBlock = executeAtBlock
            self.amount = amount; self.strategyId = strategyId; self.slippageBps = slippageBps
            self.expectedAPY = expectedAPY; self.nonce = nonce; self.enqueuedAt = enqueuedAt; self.isProcessed = isProcessed
        }
    }

    access(all) struct VaultMEVConfig {
        access(all) let vaultId: UInt64
        access(all) let protectionLevel: UInt8
        access(all) let slippageBps: UFix64
        access(all) let deviationTolerance: UFix64
        access(all) let blockDelayEnabled: Bool
        access(all) let commitRevealEnabled: Bool
        access(all) let totalProtectionsTriggered: UInt64
        access(all) let lastExecutionBlock: UInt64?

        init(vaultId: UInt64, protectionLevel: UInt8, slippageBps: UFix64, deviationTolerance: UFix64, blockDelayEnabled: Bool, commitRevealEnabled: Bool, totalProtectionsTriggered: UInt64, lastExecutionBlock: UInt64?) {
            self.vaultId = vaultId; self.protectionLevel = protectionLevel; self.slippageBps = slippageBps
            self.deviationTolerance = deviationTolerance; self.blockDelayEnabled = blockDelayEnabled
            self.commitRevealEnabled = commitRevealEnabled; self.totalProtectionsTriggered = totalProtectionsTriggered
            self.lastExecutionBlock = lastExecutionBlock
        }
    }

    access(self) var commits: {String: CommitRecord}
    access(self) var pendingExecutions: [PendingExecution]
    access(self) var vaultConfigs: {UInt64: VaultMEVConfig}
    access(all) var totalMEVProtectionsTriggered: UInt64
    access(all) var totalCommitsCreated: UInt64
    access(all) var totalCommitsExpired: UInt64
    access(all) var totalExecutionsProcessed: UInt64
    access(all) var totalExecutionsRejected: UInt64

    init() {
        self.commits = {}; self.pendingExecutions = []; self.vaultConfigs = {}
        self.totalMEVProtectionsTriggered = 0; self.totalCommitsCreated = 0; self.totalCommitsExpired = 0
        self.totalExecutionsProcessed = 0; self.totalExecutionsRejected = 0
    }

    // ═══ Setter methods (only way to mutate structs stored in contract state) ═══

    access(self) fun setCommitRevealed(commitHash: String) {
        if var c = self.commits[commitHash] {
            let newRecord = CommitRecord(
                vaultId: c.vaultId, commitHash: c.commitHash, committedBy: c.committedBy,
                committedAtBlock: c.committedAtBlock, deadlineBlock: c.deadlineBlock,
                isRevealed: true, isExpired: c.isExpired, protectionLevel: c.protectionLevel
            )
            self.commits[commitHash] = newRecord
        }
    }

    access(self) fun setCommitExpired(commitHash: String) {
        if var c = self.commits[commitHash] {
            let newRecord = CommitRecord(
                vaultId: c.vaultId, commitHash: c.commitHash, committedBy: c.committedBy,
                committedAtBlock: c.committedAtBlock, deadlineBlock: c.deadlineBlock,
                isRevealed: c.isRevealed, isExpired: true, protectionLevel: c.protectionLevel
            )
            self.commits[commitHash] = newRecord
        }
    }

    access(self) fun setVaultConfigTriggered(vaultId: UInt64, executionBlock: UInt64) {
        if var c = self.vaultConfigs[vaultId] {
            let newConfig = VaultMEVConfig(
                vaultId: c.vaultId, protectionLevel: c.protectionLevel, slippageBps: c.slippageBps,
                deviationTolerance: c.deviationTolerance, blockDelayEnabled: c.blockDelayEnabled,
                commitRevealEnabled: c.commitRevealEnabled,
                totalProtectionsTriggered: c.totalProtectionsTriggered + UInt64(1),
                lastExecutionBlock: executionBlock
            )
            self.vaultConfigs[vaultId] = newConfig
        }
    }

    access(self) fun setVaultConfigProtection(vaultId: UInt64, level: UInt8, slippage: UFix64, deviation: UFix64, blockDelay: Bool, commitReveal: Bool) {
        if var c = self.vaultConfigs[vaultId] {
            let newConfig = VaultMEVConfig(
                vaultId: c.vaultId, protectionLevel: level, slippageBps: slippage,
                deviationTolerance: deviation, blockDelayEnabled: blockDelay,
                commitRevealEnabled: commitReveal,
                totalProtectionsTriggered: c.totalProtectionsTriggered,
                lastExecutionBlock: c.lastExecutionBlock
            )
            self.vaultConfigs[vaultId] = newConfig
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  LAYER 1 — COMMIT-REVEAL EXECUTION
    // ═══════════════════════════════════════════════════════════════════════

    access(all) fun createCommit(vaultId: UInt64, commitHash: String, protectionLevel: UInt8) {
        pre { self.commits[commitHash] == nil: "Commit hash already exists"; self.vaultConfigs[vaultId] != nil: "Vault not registered with MEV" }
        let currentBlock = getCurrentBlock().height
        let deadlineBlock = currentBlock + self.getMEVCommitBlocks()
        self.commits[commitHash] = CommitRecord(
            vaultId: vaultId, commitHash: commitHash, committedBy: self.account.address,
            committedAtBlock: currentBlock, deadlineBlock: deadlineBlock,
            isRevealed: false, isExpired: false, protectionLevel: protectionLevel
        )
        self.totalCommitsCreated = self.totalCommitsCreated + UInt64(1)
        emit CommitCreated(vaultId: vaultId, commitHash: commitHash, committedBy: self.account.address, commitBlock: currentBlock, deadlineBlock: deadlineBlock)
    }

    access(all) fun revealExecution(vaultId: UInt64, commitHash: String, nonce: UInt64, amount: UFix64, strategyId: String, deadlineBlock: UInt64, expectedAPY: UFix64, slippageBps: UFix64): UInt64 {
        pre { self.commits[commitHash] != nil: "Commit does not exist" }
        let currentBlock = getCurrentBlock().height

        let storedCommit = self.commits[commitHash]!
        if storedCommit.isRevealed {
            panic("Commit already revealed")
        }
        if currentBlock > storedCommit.deadlineBlock {
            self.setCommitExpired(commitHash: commitHash)
            self.totalCommitsExpired = self.totalCommitsExpired + UInt64(1)
            emit CommitExpired(vaultId: vaultId, commitHash: commitHash, blocksOverdue: currentBlock - storedCommit.deadlineBlock)
            panic("Commit expired")
        }

        let computedPreimage = self.buildCommitPreimage(vaultId: vaultId, nonce: nonce, amount: amount, strategyId: strategyId, deadlineBlock: deadlineBlock, committer: storedCommit.committedBy)
        if computedPreimage != commitHash { panic("Commit hash mismatch") }

        // LAYER 2: VRF Block-Delay Jitter
        let jitterBlocks = revertibleRandom<UInt64>() % (self.getMEVDelayMax() + UInt64(1))
        let executeAtBlock = currentBlock + jitterBlocks + UInt64(1)

        self.setCommitRevealed(commitHash: commitHash)
        self.totalMEVProtectionsTriggered = self.totalMEVProtectionsTriggered + UInt64(1)
        self.setVaultConfigTriggered(vaultId: vaultId, executionBlock: currentBlock)

        emit CommitRevealed(vaultId: vaultId, commitHash: commitHash, revealedBy: self.account.address, actualAmount: amount, actualStrategyId: strategyId, blockDelay: jitterBlocks)

        self.pendingExecutions.append(PendingExecution(
            vaultId: vaultId, commitHash: commitHash, executeAtBlock: executeAtBlock,
            amount: amount, strategyId: strategyId, slippageBps: slippageBps,
            expectedAPY: expectedAPY, nonce: nonce, enqueuedAt: getCurrentBlock().timestamp, isProcessed: false
        ))

        emit ExecutionScheduled(vaultId: vaultId, executeAtBlock: executeAtBlock, jitterBlocks: jitterBlocks)
        return executeAtBlock
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  LAYER 3 — PRICE DEVIATION GUARD
    // ═══════════════════════════════════════════════════════════════════════

    access(all) struct PriceDeviationResult {
        access(all) let shouldExecute: Bool
        access(all) let deviation: UFix64
        access(all) let reason: String
        init(shouldExecute: Bool, deviation: UFix64, reason: String) { self.shouldExecute = shouldExecute; self.deviation = deviation; self.reason = reason }
    }

    access(all) fun checkPriceDeviation(vaultId: UInt64, expectedAPY: UFix64, actualOracleAPY: UFix64, slippageBps: UFix64): PriceDeviationResult {
        if expectedAPY == 0.0 { return PriceDeviationResult(shouldExecute: true, deviation: 0.0, reason: "No expected APY configured") }
        let deviation = expectedAPY > 0.0 ? (actualOracleAPY - expectedAPY) / expectedAPY : 0.0
        let absDeviation = deviation < 0.0 ? UFix64(0) - deviation : deviation
        let isSlippageBps = slippageBps / 10000.0
        if absDeviation > isSlippageBps && absDeviation > self.getMEVDeviationTolerance() {
            self.totalExecutionsRejected = self.totalExecutionsRejected + UInt64(1)
            self.totalMEVProtectionsTriggered = self.totalMEVProtectionsTriggered + UInt64(1)
            emit ExecutionRejected(vaultId: vaultId, reason: "Price deviation exceeds bounds", deviation: absDeviation)
            return PriceDeviationResult(shouldExecute: false, deviation: absDeviation, reason: "Price deviation exceeds bounds")
        }
        emit ExecutionStarted(vaultId: vaultId, amount: 0.0, queuePosition: UInt64(self.pendingExecutions.length))
        return PriceDeviationResult(shouldExecute: true, deviation: absDeviation, reason: "Within bounds")
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  LAYER 4 — EXECUTION QUEUE
    // ═══════════════════════════════════════════════════════════════════════

    access(all) fun getReadyExecutions(maxResults: UInt64): [PendingExecution] {
        let currentBlock = getCurrentBlock().height
        var ready: [PendingExecution] = []
        for execution in self.pendingExecutions {
            if execution.isProcessed { continue }
            if execution.executeAtBlock <= currentBlock { ready.append(execution) }
            if UInt64(ready.length) >= maxResults { break }
        }
        return self.vrfShuffle(ready)
    }

    access(self) fun vrfShuffle(_ items: [PendingExecution]): [PendingExecution] {
        if items.length <= 1 { return items }
        var shuffled: [PendingExecution] = []
        var remaining = items
        while remaining.length > 0 {
            let randomIndex = revertibleRandom<UInt64>() % UInt64(remaining.length)
            shuffled.append(remaining[randomIndex])
            var newRemaining: [PendingExecution] = []
            for i, item in remaining {
                if UInt64(i) != randomIndex { newRemaining.append(item) }
            }
            remaining = newRemaining
        }
        return shuffled
    }

    access(all) fun markExecutionProcessed(vaultId: UInt64, commitHash: String, yieldGenerated: UFix64) {
        for execution in self.pendingExecutions {
            if execution.vaultId == vaultId && execution.commitHash == commitHash && !execution.isProcessed {
                self.totalExecutionsProcessed = self.totalExecutionsProcessed + UInt64(1)
                emit ExecutionCompleted(vaultId: vaultId, yieldGenerated: yieldGenerated, slippageApplied: 0.0, mevShieldStatus: "MEV-SHIELD-ACTIVE")
                break
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  VAULT MEV CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════

    access(all) fun registerVaultMEV(vaultId: UInt64, protectionLevel: UInt8, defaultSlippageBps: UFix64) {
        if self.vaultConfigs[vaultId] != nil {
            self.setVaultConfigProtection(
                vaultId: vaultId, level: protectionLevel, slippage: defaultSlippageBps,
                deviation: self.getMEVDeviationTolerance(),
                blockDelay: protectionLevel >= UInt8(1),
                commitReveal: protectionLevel >= UInt8(2)
            )
            return
        }
        self.vaultConfigs[vaultId] = VaultMEVConfig(
            vaultId: vaultId, protectionLevel: protectionLevel, slippageBps: defaultSlippageBps,
            deviationTolerance: self.getMEVDeviationTolerance(),
            blockDelayEnabled: protectionLevel >= UInt8(1),
            commitRevealEnabled: protectionLevel >= UInt8(2),
            totalProtectionsTriggered: 0, lastExecutionBlock: nil
        )
    }

    access(all) fun updateVaultSlippageBps(vaultId: UInt64, newSlippageBps: UFix64) {
        if var c = self.vaultConfigs[vaultId] {
            let oldSlippage = c.slippageBps
            self.setVaultConfigProtection(
                vaultId: vaultId, level: c.protectionLevel, slippage: newSlippageBps,
                deviation: c.deviationTolerance, blockDelay: c.blockDelayEnabled,
                commitReveal: c.commitRevealEnabled
            )
            emit SlippageBoundsUpdated(vaultId: vaultId, oldSlippageBps: oldSlippage, newSlippageBps: newSlippageBps)
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  QUERY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    access(all) fun getVaultMEVConfig(vaultId: UInt64): VaultMEVConfig? { return self.vaultConfigs[vaultId] }
    access(all) fun getCommit(commitHash: String): CommitRecord? { return self.commits[commitHash] }
    access(all) fun getPendingExecutionCount(): UInt64 { return UInt64(self.pendingExecutions.length) }

    access(all) fun getVaultPendingExecutions(vaultId: UInt64): [PendingExecution] {
        var vaultExecutions: [PendingExecution] = []
        for execution in self.pendingExecutions {
            if execution.vaultId == vaultId && !execution.isProcessed { vaultExecutions.append(execution) }
        }
        return vaultExecutions
    }

    access(all) fun getMEVStats(): {String: AnyStruct} {
        return {
            "totalProtectionsTriggered": self.totalMEVProtectionsTriggered,
            "totalCommitsCreated": self.totalCommitsCreated, "totalCommitsExpired": self.totalCommitsExpired,
            "totalExecutionsProcessed": self.totalExecutionsProcessed, "totalExecutionsRejected": self.totalExecutionsRejected,
            "pendingExecutionCount": UInt64(self.pendingExecutions.length), "activeVaultCount": UInt64(self.vaultConfigs.length),
            "mevDelayMaxBlocks": self.getMEVDelayMax(), "mevCommitWindowBlocks": self.getMEVCommitBlocks(),
            "mevDeviationTolerance": self.getMEVDeviationTolerance(), "mevDefaultSlippageBps": self.getMEVSlippageBps(),
            "protectionLevels": ["None", "Basic (VRF Jitter)", "Standard (Commit-Reveal)", "Full (All Layers)"]
        }
    }

    access(all) fun buildCommitPreimage(vaultId: UInt64, nonce: UInt64, amount: UFix64, strategyId: String, deadlineBlock: UInt64, committer: Address): String {
        return "SENTINEL-MEV-COMMIT".concat(":").concat(vaultId.toString()).concat(":").concat(nonce.toString()).concat(":").concat(amount.toString()).concat(":").concat(strategyId).concat(":").concat(deadlineBlock.toString()).concat(":").concat(committer.toString())
    }

    access(all) fun verifyCommit(vaultId: UInt64, nonce: UInt64, amount: UFix64, strategyId: String, deadlineBlock: UInt64, committer: Address, commitHash: String): Bool {
        return self.buildCommitPreimage(vaultId: vaultId, nonce: nonce, amount: amount, strategyId: strategyId, deadlineBlock: deadlineBlock, committer: committer) == commitHash
    }

    access(all) fun cleanupExpiredCommits(maxCleanup: UInt64): UInt64 {
        var cleaned: UInt64 = 0
        let currentBlock = getCurrentBlock().height
        for key in self.commits.keys {
            if cleaned >= maxCleanup { break }
            if let commit = self.commits[key] {
                if !commit.isRevealed && !commit.isExpired && currentBlock > commit.deadlineBlock {
                    self.setCommitExpired(commitHash: key)
                    self.totalCommitsExpired = self.totalCommitsExpired + UInt64(1)
                    cleaned = cleaned + UInt64(1)
                    emit CommitExpired(vaultId: commit.vaultId, commitHash: key, blocksOverdue: currentBlock - commit.deadlineBlock)
                }
            }
        }
        return cleaned
    }
}
