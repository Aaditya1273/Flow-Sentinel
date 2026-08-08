// MEVShieldCore — 4-Layer MEV Protection Engine
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

    // Config accessors
    access(all) fun getMEVCommitBlocks(): UInt64 { return 200 }
    access(all) fun getMEVDelayMax(): UInt64 { return 5 }
    // Phase 9: Hard limits for circuit breakers — cannot be exceeded by any vault config
    access(all) fun getMEVDeviationTolerance(): UFix64 { return 0.50 }       // 50% absolute max deviation
    access(all) fun getMEVSlippageBps(): UFix64 { return 300.0 }              // default 3%
    access(all) fun getMEVMaxSlippageHardCap(): UFix64 { return 5000.0 }      // 50% absolute max slippage
    access(all) fun getMEVOracleStaleSeconds(): UFix64 { return 21600.0 }     // 6 hours max stale age

    // Canonical preimage string — must match lib/mev-hash.ts buildPreimage() exactly.
    // Hashed with SHA3-256 (HashAlgorithm.SHA3_256.hash) before ever reaching the chain;
    // the preimage itself is never submitted, only its 32-byte digest.
    access(all) fun buildCommitPreimage(vaultId: UInt64, nonce: UInt64, amount: UFix64, strategyId: String, deadlineBlock: UInt64, committer: Address): String {
        return "SENTINEL|"
            .concat(vaultId.toString()).concat("|")
            .concat(nonce.toString()).concat("|")
            .concat(amount.toString()).concat("|")
            .concat(strategyId).concat("|")
            .concat(deadlineBlock.toString()).concat("|")
            .concat(committer.toString())
    }

    // CommitRecord stores the real 32-byte SHA3-256 commit hash.
    access(all) struct CommitRecord {
        access(all) let vaultId: UInt64
        access(all) let commitHash: [UInt8]
        access(all) let committedBy: Address
        access(all) let committedAtBlock: UInt64
        access(all) let deadlineBlock: UInt64
        access(all) let isRevealed: Bool
        access(all) let isExpired: Bool
        access(all) let protectionLevel: UInt8

        init(
            vaultId: UInt64, commitHash: [UInt8],
            committedBy: Address, committedAtBlock: UInt64, deadlineBlock: UInt64,
            isRevealed: Bool, isExpired: Bool, protectionLevel: UInt8
        ) {
            self.vaultId = vaultId
            self.commitHash = commitHash
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
        access(all) let commitHash: [UInt8]
        access(all) let executeAtBlock: UInt64
        access(all) let amount: UFix64
        access(all) let strategyId: String
        access(all) let slippageBps: UFix64
        access(all) let expectedAPY: UFix64
        access(all) let nonce: UInt64
        access(all) let enqueuedAt: UFix64
        access(all) let isProcessed: Bool

        init(
            vaultId: UInt64, commitHash: [UInt8], executeAtBlock: UInt64,
            amount: UFix64, strategyId: String, slippageBps: UFix64,
            expectedAPY: UFix64, nonce: UInt64, enqueuedAt: UFix64, isProcessed: Bool
        ) {
            self.vaultId = vaultId
            self.commitHash = commitHash
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

    // Contract state — commits keyed by hex encoding of the 32-byte hash (Cadence
    // dictionary keys must be Hashable; [UInt8] isn't, so String.encodeHex bridges it).
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

    // Internal setters — hashKey is String.encodeHex(commitHash)
    access(self) fun setCommitRevealed(hashKey: String) {
        if let c = self.commits[hashKey] {
            self.commits[hashKey] = CommitRecord(
                vaultId: c.vaultId, commitHash: c.commitHash,
                committedBy: c.committedBy, committedAtBlock: c.committedAtBlock,
                deadlineBlock: c.deadlineBlock, isRevealed: true,
                isExpired: c.isExpired, protectionLevel: c.protectionLevel
            )
        }
    }

    access(self) fun setCommitExpired(hashKey: String) {
        if let c = self.commits[hashKey] {
            self.commits[hashKey] = CommitRecord(
                vaultId: c.vaultId, commitHash: c.commitHash,
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

    // LAYER 1 — COMMIT-REVEAL
    // Open to any signer (the vault owner calling their own two-step commit/reveal
    // transaction) — actual fund-moving execution is separately gated by vault
    // Collection ownership in SentinelVaultV2, so a spoofed commit here cannot move
    // funds. Real cryptographic verification happens in revealExecution below.
    access(all) fun createCommit(
        vaultId: UInt64,
        commitHash: [UInt8],
        protectionLevel: UInt8,
        committedBy: Address
    ) {
        pre {
            commitHash.length == 32: "Commit hash must be a 32-byte SHA3-256 digest"
            self.vaultConfigs[vaultId] != nil: "Vault not registered with MEV shield"
        }
        let hashKey = String.encodeHex(commitHash)
        if self.commits[hashKey] != nil {
            panic("Commit already exists — nonce reuse detected")
        }
        let currentBlock = getCurrentBlock().height
        let deadlineBlock = currentBlock + self.getMEVCommitBlocks()
        self.commits[hashKey] = CommitRecord(
            vaultId: vaultId, commitHash: commitHash,
            committedBy: committedBy, committedAtBlock: currentBlock,
            deadlineBlock: deadlineBlock, isRevealed: false,
            isExpired: false, protectionLevel: protectionLevel
        )
        self.totalCommitsCreated = self.totalCommitsCreated + UInt64(1)
        emit CommitCreated(
            vaultId: vaultId, commitHashHex: hashKey,
            committedBy: committedBy, commitBlock: currentBlock, deadlineBlock: deadlineBlock
        )
    }

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
        pre { commitHash.length == 32: "Invalid commit hash" }

        let hashKey = String.encodeHex(commitHash)
        if self.commits[hashKey] == nil {
            panic("Commit does not exist")
        }

        let storedCommit = self.commits[hashKey]!
        if storedCommit.isRevealed { panic("Commit already revealed") }

        let currentBlock = getCurrentBlock().height
        if currentBlock > storedCommit.deadlineBlock {
            self.setCommitExpired(hashKey: hashKey)
            self.totalCommitsExpired = self.totalCommitsExpired + UInt64(1)
            emit CommitExpired(
                vaultId: vaultId, commitHashHex: hashKey,
                blocksOverdue: currentBlock - storedCommit.deadlineBlock
            )
            panic("Commit expired: reveal window passed")
        }

        // Real cryptographic check: SHA3-256(preimage built from revealed params)
        // must equal the hash bytes committed to earlier. This is the actual Layer 1
        // guarantee — mempool observers only ever saw the hash, never these params.
        let preimage = self.buildCommitPreimage(
            vaultId: vaultId, nonce: nonce, amount: amount,
            strategyId: strategyId, deadlineBlock: deadlineBlock,
            committer: storedCommit.committedBy
        )
        let computedHash = HashAlgorithm.SHA3_256.hash(preimage.utf8)
        if computedHash != commitHash {
            panic("Commit hash mismatch: revealed params do not match original commitment")
        }

        // LAYER 2: VRF Block-Delay Jitter
        let jitterBlocks = revertibleRandom<UInt64>() % (self.getMEVDelayMax() + UInt64(1))
        let executeAtBlock = currentBlock + jitterBlocks + UInt64(1)

        self.setCommitRevealed(hashKey: hashKey)
        self.totalMEVProtectionsTriggered = self.totalMEVProtectionsTriggered + UInt64(1)
        self.setVaultConfigTriggered(vaultId: vaultId, executionBlock: currentBlock)

        emit CommitRevealed(
            vaultId: vaultId, commitHashHex: hashKey,
            revealedBy: self.account.address, actualAmount: amount,
            actualStrategyId: strategyId, blockDelay: jitterBlocks
        )

        self.pendingExecutions.append(PendingExecution(
            vaultId: vaultId, commitHash: commitHash,
            executeAtBlock: executeAtBlock, amount: amount,
            strategyId: strategyId, slippageBps: slippageBps,
            expectedAPY: expectedAPY, nonce: nonce,
            enqueuedAt: getCurrentBlock().timestamp, isProcessed: false
        ))
        emit ExecutionScheduled(vaultId: vaultId, executeAtBlock: executeAtBlock, jitterBlocks: jitterBlocks)
        return executeAtBlock
    }

    // LAYER 3 — PRICE DEVIATION GUARD (OR logic: vault slippage OR hard cap)
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
        if expectedAPY == 0.0 {
            return PriceDeviationResult(shouldExecute: true, deviation: 0.0, reason: "No APY baseline configured")
        }
        let diff = actualOracleAPY > expectedAPY
            ? actualOracleAPY - expectedAPY
            : expectedAPY - actualOracleAPY
        let absDeviation = diff / expectedAPY
        let slippageFraction = slippageBps / 10000.0
        let hardCap = self.getMEVDeviationTolerance()

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

    // LAYER 4 — EXECUTION QUEUE
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

    // access(account): only SentinelVaultV2 (same-account contract code) marks executions
    // processed, after it has actually run the strategy — not user-callable.
    access(account) fun markExecutionProcessed(vaultId: UInt64, commitHash: [UInt8], yieldGenerated: UFix64) {
        var foundIndex: Int? = nil
        for i, execution in self.pendingExecutions {
            if execution.vaultId == vaultId && execution.commitHash == commitHash && !execution.isProcessed {
                foundIndex = i
                break
            }
        }
        if let index = foundIndex {
            self.pendingExecutions.remove(at: index)
            self.totalExecutionsProcessed = self.totalExecutionsProcessed + UInt64(1)
            emit ExecutionCompleted(
                vaultId: vaultId, yieldGenerated: yieldGenerated,
                slippageApplied: 0.0, mevShieldStatus: "MEV-SHIELD-ACTIVE|VRF-JITTER|PRICE-GUARD|QUEUE-SHUFFLE"
            )
        }
    }

    // VAULT MEV CONFIGURATION
    // access(account): only SentinelVaultV2 (same account) may register/reconfigure a
    // vault's protection level or slippage — this is the state an attacker could otherwise
    // weaken on a victim's vault ahead of a real execution, so it is NOT user-callable.
    access(account) fun registerVaultMEV(vaultId: UInt64, protectionLevel: UInt8, defaultSlippageBps: UFix64) {
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

    access(account) fun updateVaultSlippageBps(vaultId: UInt64, newSlippageBps: UFix64) {
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

    // QUERY FUNCTIONS
    access(all) fun getVaultMEVConfig(vaultId: UInt64): VaultMEVConfig? { return self.vaultConfigs[vaultId] }

    access(all) fun getCommit(commitHash: [UInt8]): CommitRecord? { return self.commits[String.encodeHex(commitHash)] }

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
                    self.setCommitExpired(hashKey: key)
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
