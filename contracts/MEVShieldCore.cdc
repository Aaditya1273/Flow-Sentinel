// MEVShieldCore — 4-Layer MEV Protection Engine
// Phase 1 Fix: Real SHA3_256 cryptographic commit hashing (not plaintext concat)
// Phase 1 Fix: Price deviation guard uses correct OR logic (vault slippage respected)
access(all) contract MEVShieldCore {

    access(all) event CommitCreated(vaultId: UInt64, commitHashHex: String, committedBy: Address, commitBlock: UInt64, deadlineBlock: UInt64)
    access(all) event CommitRevealed(vaultId: UInt64, commitHashHex: String, revealedBy: Address, actualAmount: UFix64, actualStrategyId: String, blockDelay: UInt64)
    access(all) event ExecutionScheduled(vaultId: UInt64, executeAtBlock: UInt64, jitterBlocks: UInt64)
    access(all) event ExecutionStarted(vaultId: UInt64, amount: UFix64, queuePosition: UInt64)
    access(all) event ExecutionCompleted(vaultId: UInt64, yieldGenerated: UFix64, slippageApplied: UFix64, mevShieldStatus: String)
    access(all) event ExecutionRejected(vaultId: UInt64, reason: String, deviation: UFix64)
    access(all) event SlippageBoundsUpdated(vaultId: UInt64, oldSlippageBps: UFix64, newSlippageBps: UFix64)
    access(all) event CommitExpired(vaultId: UInt64, commitHashHex: String, blocksOverdue: UInt64)

    access(all) enum ProtectionLevel: UInt8 {
        access(all) case None
        access(all) case Basic
        access(all) case Standard
        access(all) case Full
    }

    // ═══ Config accessors ═══
    access(all) fun getMEVCommitBlocks(): UInt64 { return 200 }
    access(all) fun getMEVDelayMax(): UInt64 { return 5 }
    access(all) fun getMEVDeviationTolerance(): UFix64 { return 0.50 }
    access(all) fun getMEVSlippageBps(): UFix64 { return 300.0 }

    // ═══════════════════════════════════════════════════════════════════════
    //  PHASE 1 FIX #1 — REAL SHA3_256 CRYPTOGRAPHIC HASHING
    //  Previously: plaintext string concatenation (security theater)
    //  Now: real HashAlgorithm.SHA3_256.hash() — preimage hidden from mempool
    // ═══════════════════════════════════════════════════════════════════════

    /// Build a SHA3-256 hash of the commit preimage.
    /// The preimage is a deterministic encoding of all execution parameters.
    /// Only the 32-byte hash is stored on-chain — the actual params stay off-chain until reveal.
    access(all) fun buildCommitHash(
        vaultId: UInt64,
        nonce: UInt64,
        amount: UFix64,
        strategyId: String,
        deadlineBlock: UInt64,
        committer: Address
    ): [UInt8] {
        // Canonical preimage: pipe-delimited to avoid ambiguity
        let preimage = "SENTINEL|"
            .concat(vaultId.toString()).concat("|")
            .concat(nonce.toString()).concat("|")
            .concat(amount.toString()).concat("|")
            .concat(strategyId).concat("|")
            .concat(deadlineBlock.toString()).concat("|")
            .concat(committer.toString())
        return HashAlgorithm.SHA3_256.hash(preimage.utf8)
    }

    /// Verify a submitted hash matches the recomputed hash for given params.
    access(all) fun verifyCommitHash(
        vaultId: UInt64,
        nonce: UInt64,
        amount: UFix64,
        strategyId: String,
        deadlineBlock: UInt64,
        committer: Address,
        submittedHash: [UInt8]
    ): Bool {
        let computed = self.buildCommitHash(
            vaultId: vaultId, nonce: nonce, amount: amount,
            strategyId: strategyId, deadlineBlock: deadlineBlock, committer: committer
        )
        if computed.length != submittedHash.length { return false }
        for i, byte in computed {
            if byte != submittedHash[i] { return false }
        }
        return true
    }

    /// Convert [UInt8] hash to hex string for events/display.
    access(all) fun hashToHex(_ hash: [UInt8]): String {
        let hexChars: [Character] = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"]
        var result = ""
        for byte in hash {
            result = result.concat(hexChars[Int(byte >> 4)].toString())
            result = result.concat(hexChars[Int(byte & 0x0f)].toString())
        }
        return result
    }

    // Legacy compatibility: kept for any scripts querying the old string format
    // Returns the preimage string (NOT secure — use buildCommitHash for security)
    access(all) fun buildCommitPreimage(vaultId: UInt64, nonce: UInt64, amount: UFix64, strategyId: String, deadlineBlock: UInt64, committer: Address): String {
        return "SENTINEL|"
            .concat(vaultId.toString()).concat("|")
            .concat(nonce.toString()).concat("|")
            .concat(amount.toString()).concat("|")
            .concat(strategyId).concat("|")
            .concat(deadlineBlock.toString()).concat("|")
            .concat(committer.toString())
    }


    // ═══ CommitRecord now stores [UInt8] hash — cryptographically secure ═══
    access(all) struct CommitRecord {
        access(all) let vaultId: UInt64
        access(all) let commitHash: [UInt8]       // SHA3-256 hash bytes
        access(all) let commitHashHex: String      // hex for display/events
        access(all) let committedBy: Address
        access(all) let committedAtBlock: UInt64
        access(all) let deadlineBlock: UInt64
        access(all) let isRevealed: Bool
        access(all) let isExpired: Bool
        access(all) let protectionLevel: UInt8

        init(
            vaultId: UInt64, commitHash: [UInt8], commitHashHex: String,
            committedBy: Address, committedAtBlock: UInt64, deadlineBlock: UInt64,
            isRevealed: Bool, isExpired: Bool, protectionLevel: UInt8
        ) {
            self.vaultId = vaultId
            self.commitHash = commitHash
            self.commitHashHex = commitHashHex
            self.committedBy = committedBy
            self.committedAtBlock = committedAtBlock
            self.deadlineBlock = deadlineBlock
            self.isRevealed = isRevealed
            self.isExpired = isExpired
            self.protectionLevel = protectionLevel
        }
    }

    access(all) struct PendingExecution {
        access(all) let vaultId: UInt64
        access(all) let commitHashHex: String
        access(all) let executeAtBlock: UInt64
        access(all) let amount: UFix64
        access(all) let strategyId: String
        access(all) let slippageBps: UFix64
        access(all) let expectedAPY: UFix64
        access(all) let nonce: UInt64
        access(all) let enqueuedAt: UFix64
        access(all) let isProcessed: Bool

        init(
            vaultId: UInt64, commitHashHex: String, executeAtBlock: UInt64,
            amount: UFix64, strategyId: String, slippageBps: UFix64,
            expectedAPY: UFix64, nonce: UInt64, enqueuedAt: UFix64, isProcessed: Bool
        ) {
            self.vaultId = vaultId
            self.commitHashHex = commitHashHex
            self.executeAtBlock = executeAtBlock
            self.amount = amount
            self.strategyId = strategyId
            self.slippageBps = slippageBps
            self.expectedAPY = expectedAPY
            self.nonce = nonce
            self.enqueuedAt = enqueuedAt
            self.isProcessed = isProcessed
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

        init(
            vaultId: UInt64, protectionLevel: UInt8, slippageBps: UFix64,
            deviationTolerance: UFix64, blockDelayEnabled: Bool, commitRevealEnabled: Bool,
            totalProtectionsTriggered: UInt64, lastExecutionBlock: UInt64?
        ) {
            self.vaultId = vaultId
            self.protectionLevel = protectionLevel
            self.slippageBps = slippageBps
            self.deviationTolerance = deviationTolerance
            self.blockDelayEnabled = blockDelayEnabled
            self.commitRevealEnabled = commitRevealEnabled
            self.totalProtectionsTriggered = totalProtectionsTriggered
            self.lastExecutionBlock = lastExecutionBlock
        }
    }

    // Contract state — keyed by hex string for O(1) lookup
    access(self) var commits: {String: CommitRecord}
    access(self) var pendingExecutions: [PendingExecution]
    access(self) var vaultConfigs: {UInt64: VaultMEVConfig}
    access(all) var totalMEVProtectionsTriggered: UInt64
    access(all) var totalCommitsCreated: UInt64
    access(all) var totalCommitsExpired: UInt64
    access(all) var totalExecutionsProcessed: UInt64
    access(all) var totalExecutionsRejected: UInt64

    init() {
        self.commits = {}
        self.pendingExecutions = []
        self.vaultConfigs = {}
        self.totalMEVProtectionsTriggered = 0
        self.totalCommitsCreated = 0
        self.totalCommitsExpired = 0
        self.totalExecutionsProcessed = 0
        self.totalExecutionsRejected = 0
    }


    // ═══ Internal setters — only way to mutate stored structs ═══

    access(self) fun setCommitRevealed(hashHex: String) {
        if let c = self.commits[hashHex] {
            self.commits[hashHex] = CommitRecord(
                vaultId: c.vaultId, commitHash: c.commitHash, commitHashHex: c.commitHashHex,
                committedBy: c.committedBy, committedAtBlock: c.committedAtBlock,
                deadlineBlock: c.deadlineBlock, isRevealed: true,
                isExpired: c.isExpired, protectionLevel: c.protectionLevel
            )
        }
    }

    access(self) fun setCommitExpired(hashHex: String) {
        if let c = self.commits[hashHex] {
            self.commits[hashHex] = CommitRecord(
                vaultId: c.vaultId, commitHash: c.commitHash, commitHashHex: c.commitHashHex,
                committedBy: c.committedBy, committedAtBlock: c.committedAtBlock,
                deadlineBlock: c.deadlineBlock, isRevealed: c.isRevealed,
                isExpired: true, protectionLevel: c.protectionLevel
            )
        }
    }

    access(self) fun setVaultConfigTriggered(vaultId: UInt64, executionBlock: UInt64) {
        if let c = self.vaultConfigs[vaultId] {
            self.vaultConfigs[vaultId] = VaultMEVConfig(
                vaultId: c.vaultId, protectionLevel: c.protectionLevel,
                slippageBps: c.slippageBps, deviationTolerance: c.deviationTolerance,
                blockDelayEnabled: c.blockDelayEnabled, commitRevealEnabled: c.commitRevealEnabled,
                totalProtectionsTriggered: c.totalProtectionsTriggered + UInt64(1),
                lastExecutionBlock: executionBlock
            )
        }
    }

    access(self) fun setVaultConfigProtection(
        vaultId: UInt64, level: UInt8, slippage: UFix64,
        deviation: UFix64, blockDelay: Bool, commitReveal: Bool
    ) {
        if let c = self.vaultConfigs[vaultId] {
            self.vaultConfigs[vaultId] = VaultMEVConfig(
                vaultId: c.vaultId, protectionLevel: level, slippageBps: slippage,
                deviationTolerance: deviation, blockDelayEnabled: blockDelay,
                commitRevealEnabled: commitReveal,
                totalProtectionsTriggered: c.totalProtectionsTriggered,
                lastExecutionBlock: c.lastExecutionBlock
            )
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  LAYER 1 — COMMIT-REVEAL (now with real SHA3_256 hash)
    // ═══════════════════════════════════════════════════════════════════════

    /// Submit a commit. The hash must be computed off-chain via buildCommitHash().
    /// Only the 32-byte hash is stored — execution params are hidden from the mempool.
    access(all) fun createCommit(
        vaultId: UInt64,
        commitHash: [UInt8],
        protectionLevel: UInt8,
        committedBy: Address
    ) {
        pre {
            commitHash.length == 32: "Invalid commit hash: must be 32 bytes (SHA3-256)"
            self.vaultConfigs[vaultId] != nil: "Vault not registered with MEV shield"
        }
        let hashHex = self.hashToHex(commitHash)
        pre {
            self.commits[hashHex] == nil: "Commit already exists — nonce reuse detected"
        }
        let currentBlock = getCurrentBlock().height
        let deadlineBlock = currentBlock + self.getMEVCommitBlocks()
        self.commits[hashHex] = CommitRecord(
            vaultId: vaultId, commitHash: commitHash, commitHashHex: hashHex,
            committedBy: committedBy, committedAtBlock: currentBlock,
            deadlineBlock: deadlineBlock, isRevealed: false,
            isExpired: false, protectionLevel: protectionLevel
        )
        self.totalCommitsCreated = self.totalCommitsCreated + UInt64(1)
        emit CommitCreated(
            vaultId: vaultId, commitHashHex: hashHex,
            committedBy: committedBy, commitBlock: currentBlock, deadlineBlock: deadlineBlock
        )
    }

    /// Reveal a commit. Caller must provide all original params.
    /// The contract recomputes the hash and verifies it matches the stored commit.
    access(all) fun revealExecution(
        vaultId: UInt64,
        commitHash: [UInt8],
        nonce: UInt64,
        amount: UFix64,
        strategyId: String,
        deadlineBlock: UInt64,
        expectedAPY: UFix64,
        slippageBps: UFix64
    ): UInt64 {
        pre { commitHash.length == 32: "Invalid commit hash length" }
        let hashHex = self.hashToHex(commitHash)
        pre { self.commits[hashHex] != nil: "Commit does not exist" }

        let storedCommit = self.commits[hashHex]!
        if storedCommit.isRevealed { panic("Commit already revealed") }

        let currentBlock = getCurrentBlock().height
        if currentBlock > storedCommit.deadlineBlock {
            self.setCommitExpired(hashHex: hashHex)
            self.totalCommitsExpired = self.totalCommitsExpired + UInt64(1)
            emit CommitExpired(
                vaultId: vaultId, commitHashHex: hashHex,
                blocksOverdue: currentBlock - storedCommit.deadlineBlock
            )
            panic("Commit expired: reveal window passed")
        }

        // Recompute hash and verify — this is the cryptographic proof
        let verified = self.verifyCommitHash(
            vaultId: vaultId, nonce: nonce, amount: amount,
            strategyId: strategyId, deadlineBlock: deadlineBlock,
            committer: storedCommit.committedBy, submittedHash: commitHash
        )
        if !verified { panic("Commit hash mismatch: params do not match original commitment") }

        // LAYER 2: VRF Block-Delay Jitter — unpredictable execution timing
        let jitterBlocks = revertibleRandom<UInt64>() % (self.getMEVDelayMax() + UInt64(1))
        let executeAtBlock = currentBlock + jitterBlocks + UInt64(1)

        self.setCommitRevealed(hashHex: hashHex)
        self.totalMEVProtectionsTriggered = self.totalMEVProtectionsTriggered + UInt64(1)
        self.setVaultConfigTriggered(vaultId: vaultId, executionBlock: currentBlock)

        emit CommitRevealed(
            vaultId: vaultId, commitHashHex: hashHex,
            revealedBy: self.account.address, actualAmount: amount,
            actualStrategyId: strategyId, blockDelay: jitterBlocks
        )

        self.pendingExecutions.append(PendingExecution(
            vaultId: vaultId, commitHashHex: hashHex,
            executeAtBlock: executeAtBlock, amount: amount,
            strategyId: strategyId, slippageBps: slippageBps,
            expectedAPY: expectedAPY, nonce: nonce,
            enqueuedAt: getCurrentBlock().timestamp, isProcessed: false
        ))
        emit ExecutionScheduled(vaultId: vaultId, executeAtBlock: executeAtBlock, jitterBlocks: jitterBlocks)
        return executeAtBlock
    }


    // ═══════════════════════════════════════════════════════════════════════
    //  LAYER 3 — PRICE DEVIATION GUARD (Phase 1 Fix: correct OR logic)
    //  Previously: absDeviation > slippageBps && absDeviation > hardCap (50%)
    //  = guard only fired if BOTH exceeded → vault slippage (3%) was ignored
    //  Now: absDeviation > slippageBps OR absDeviation > hardCap
    //  = vault's slippage setting is respected; hard cap is a secondary safety net
    // ═══════════════════════════════════════════════════════════════════════

    access(all) struct PriceDeviationResult {
        access(all) let shouldExecute: Bool
        access(all) let deviation: UFix64
        access(all) let reason: String
        init(shouldExecute: Bool, deviation: UFix64, reason: String) {
            self.shouldExecute = shouldExecute
            self.deviation = deviation
            self.reason = reason
        }
    }

    access(all) fun checkPriceDeviation(
        vaultId: UInt64,
        expectedAPY: UFix64,
        actualOracleAPY: UFix64,
        slippageBps: UFix64
    ): PriceDeviationResult {
        // No baseline → can't guard, allow execution
        if expectedAPY == 0.0 {
            return PriceDeviationResult(shouldExecute: true, deviation: 0.0, reason: "No APY baseline configured")
        }

        // Calculate absolute fractional deviation
        // e.g. expected=6.5, actual=7.2 → deviation = |7.2-6.5|/6.5 = 0.1077 = 10.77%
        let diff = actualOracleAPY > expectedAPY
            ? actualOracleAPY - expectedAPY
            : expectedAPY - actualOracleAPY
        let absDeviation = diff / expectedAPY

        // Convert slippageBps to fraction: 300 bps → 0.03 (3%)
        let slippageFraction = slippageBps / 10000.0

        // Hard cap (50%) — catches extreme oracle manipulation regardless of vault settings
        let hardCap = self.getMEVDeviationTolerance()

        // FIXED: OR logic — reject if vault slippage OR hard cap exceeded
        if absDeviation > slippageFraction {
            self.totalExecutionsRejected = self.totalExecutionsRejected + UInt64(1)
            self.totalMEVProtectionsTriggered = self.totalMEVProtectionsTriggered + UInt64(1)
            let pct = (absDeviation * 100.0).toString()
            let limit = (slippageFraction * 100.0).toString()
            let reason = "APY deviation ".concat(pct).concat("% exceeds vault slippage ").concat(limit).concat("%")
            emit ExecutionRejected(vaultId: vaultId, reason: reason, deviation: absDeviation)
            return PriceDeviationResult(shouldExecute: false, deviation: absDeviation, reason: reason)
        }

        if absDeviation > hardCap {
            self.totalExecutionsRejected = self.totalExecutionsRejected + UInt64(1)
            self.totalMEVProtectionsTriggered = self.totalMEVProtectionsTriggered + UInt64(1)
            let reason = "APY deviation exceeds hard cap (50%) — possible oracle manipulation"
            emit ExecutionRejected(vaultId: vaultId, reason: reason, deviation: absDeviation)
            return PriceDeviationResult(shouldExecute: false, deviation: absDeviation, reason: reason)
        }

        emit ExecutionStarted(vaultId: vaultId, amount: 0.0, queuePosition: UInt64(self.pendingExecutions.length))
        return PriceDeviationResult(shouldExecute: true, deviation: absDeviation, reason: "Within bounds")
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  LAYER 4 — EXECUTION QUEUE (VRF-shuffled Fisher-Yates)
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
            let idx = revertibleRandom<UInt64>() % UInt64(remaining.length)
            shuffled.append(remaining[idx])
            var next: [PendingExecution] = []
            for i, item in remaining {
                if UInt64(i) != idx { next.append(item) }
            }
            remaining = next
        }
        return shuffled
    }

    access(all) fun markExecutionProcessed(vaultId: UInt64, commitHashHex: String, yieldGenerated: UFix64) {
        var foundIndex: Int? = nil
        for i, execution in self.pendingExecutions {
            if execution.vaultId == vaultId && execution.commitHashHex == commitHashHex && !execution.isProcessed {
                foundIndex = i
                break
            }
        }
        if let index = foundIndex {
            self.pendingExecutions.remove(at: index)
            self.totalExecutionsProcessed = self.totalExecutionsProcessed + UInt64(1)
            emit ExecutionCompleted(
                vaultId: vaultId, yieldGenerated: yieldGenerated,
                slippageApplied: 0.0, mevShieldStatus: "MEV-SHIELD-ACTIVE|SHA3-HASH|VRF-JITTER|PRICE-GUARD|QUEUE-SHUFFLE"
            )
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
            vaultId: vaultId, protectionLevel: protectionLevel,
            slippageBps: defaultSlippageBps,
            deviationTolerance: self.getMEVDeviationTolerance(),
            blockDelayEnabled: protectionLevel >= UInt8(1),
            commitRevealEnabled: protectionLevel >= UInt8(2),
            totalProtectionsTriggered: 0, lastExecutionBlock: nil
        )
    }

    access(all) fun updateVaultSlippageBps(vaultId: UInt64, newSlippageBps: UFix64) {
        if let c = self.vaultConfigs[vaultId] {
            let old = c.slippageBps
            self.setVaultConfigProtection(
                vaultId: vaultId, level: c.protectionLevel, slippage: newSlippageBps,
                deviation: c.deviationTolerance, blockDelay: c.blockDelayEnabled,
                commitReveal: c.commitRevealEnabled
            )
            emit SlippageBoundsUpdated(vaultId: vaultId, oldSlippageBps: old, newSlippageBps: newSlippageBps)
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  QUERY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    access(all) fun getVaultMEVConfig(vaultId: UInt64): VaultMEVConfig? { return self.vaultConfigs[vaultId] }

    /// Look up a commit by its hex hash string
    access(all) fun getCommit(commitHashHex: String): CommitRecord? { return self.commits[commitHashHex] }

    /// Look up a commit by its raw [UInt8] hash (converts to hex internally)
    access(all) fun getCommitByBytes(commitHash: [UInt8]): CommitRecord? {
        return self.commits[self.hashToHex(commitHash)]
    }

    access(all) fun getPendingExecutionCount(): UInt64 { return UInt64(self.pendingExecutions.length) }

    access(all) fun getVaultPendingExecutions(vaultId: UInt64): [PendingExecution] {
        var result: [PendingExecution] = []
        for e in self.pendingExecutions {
            if e.vaultId == vaultId && !e.isProcessed { result.append(e) }
        }
        return result
    }

    access(all) fun getMEVStats(): {String: AnyStruct} {
        return {
            "totalProtectionsTriggered": self.totalMEVProtectionsTriggered,
            "totalCommitsCreated": self.totalCommitsCreated,
            "totalCommitsExpired": self.totalCommitsExpired,
            "totalExecutionsProcessed": self.totalExecutionsProcessed,
            "totalExecutionsRejected": self.totalExecutionsRejected,
            "pendingExecutionCount": UInt64(self.pendingExecutions.length),
            "activeVaultCount": UInt64(self.vaultConfigs.length),
            "mevDelayMaxBlocks": self.getMEVDelayMax(),
            "mevCommitWindowBlocks": self.getMEVCommitBlocks(),
            "mevDeviationTolerance": self.getMEVDeviationTolerance(),
            "mevDefaultSlippageBps": self.getMEVSlippageBps(),
            "hashAlgorithm": "SHA3_256",
            "commitHashType": "[UInt8] (32 bytes)",
            "priceGuardLogic": "OR (vault slippage respected)",
            "protectionLevels": ["None", "Basic (VRF Jitter)", "Standard (Commit-Reveal+VRF)", "Full (All 4 Layers)"]
        }
    }

    access(all) fun cleanupExpiredCommits(maxCleanup: UInt64): UInt64 {
        var cleaned: UInt64 = 0
        let currentBlock = getCurrentBlock().height
        for key in self.commits.keys {
            if cleaned >= maxCleanup { break }
            if let commit = self.commits[key] {
                if !commit.isRevealed && !commit.isExpired && currentBlock > commit.deadlineBlock {
                    self.setCommitExpired(hashHex: key)
                    self.totalCommitsExpired = self.totalCommitsExpired + UInt64(1)
                    cleaned = cleaned + UInt64(1)
                    emit CommitExpired(
                        vaultId: commit.vaultId, commitHashHex: key,
                        blocksOverdue: currentBlock - commit.deadlineBlock
                    )
                }
            }
        }
        return cleaned
    }
}
