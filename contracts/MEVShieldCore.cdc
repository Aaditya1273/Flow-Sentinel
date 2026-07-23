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

