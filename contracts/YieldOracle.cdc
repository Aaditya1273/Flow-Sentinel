// YieldOracle — Decentralized APY data feed for Sentinel strategies
// Phase 1 Fix #5: Entitlement-based OracleAdminResource
// Previously: setAPY(caller: Address) — caller address was a function argument,
//             NOT verified by the Cadence runtime. Any address could be passed.
// Now: access(OracleAdmin) entitlement on the resource function.
//     Only the account that holds the OracleAdminResource in storage can update APYs.
//     The Cadence runtime enforces this — no self-reported address needed.
access(all) contract YieldOracle {

    // ── Entitlement: gates write access to APY data ──
    access(all) entitlement OracleAdmin

    access(all) event APYUpdated(strategyId: String, newAPY: UFix64, source: String, timestamp: UFix64)
    access(all) event OracleAdminResourceCreated(recipient: Address)
    access(all) event APYBatchUpdated(count: Int, timestamp: UFix64)

    access(all) let OracleStoragePath: StoragePath
    access(all) let OraclePublicPath: PublicPath
    access(all) let OracleAdminStoragePath: StoragePath

    // ── YieldData struct: immutable snapshot of APY at a point in time ──
    access(all) struct YieldData {
        access(all) let apy: UFix64
        access(all) let dailyRate: UFix64
        access(all) let weeklyRate: UFix64
        access(all) let source: String
        access(all) let updatedAt: UFix64
        access(all) let updatedAtBlock: UInt64
        access(all) let confidence: UFix64

        init(apy: UFix64, source: String, confidence: UFix64) {
            self.apy = apy
            self.dailyRate = apy / 365.0 / 100.0
            self.weeklyRate = apy / 52.0 / 100.0
            self.source = source
            self.updatedAt = getCurrentBlock().timestamp
            self.updatedAtBlock = getCurrentBlock().height
            self.confidence = confidence
        }
    }

    // ── OracleAdminResource: the ONLY way to update APY data ──
    // Stored in the contract deployer's account storage.
    // access(OracleAdmin) means: you must hold this resource AND have the entitlement.
    // This is enforced by the Cadence runtime — no address spoofing possible.
    access(all) resource OracleAdminResource {

        /// Update APY for a single strategy.
        access(OracleAdmin) fun setAPY(
            strategyId: String,
            apy: UFix64,
            source: String,
            confidence: UFix64
        ) {
            pre {
                apy >= 0.0: "APY cannot be negative"
                apy <= 10000.0: "APY exceeds maximum (10000%)"
                confidence >= 0.0 && confidence <= 1.0: "Confidence must be 0.0-1.0"
                strategyId.length > 0: "Strategy ID cannot be empty"
            }
            let data = YieldData(apy: apy, source: source, confidence: confidence)
            YieldOracle.storeYieldData(strategyId: strategyId, data: data)
            emit APYUpdated(
                strategyId: strategyId, newAPY: apy,
                source: source, timestamp: getCurrentBlock().timestamp
            )
        }

        /// Batch update multiple strategies in one transaction (gas efficient).
        access(OracleAdmin) fun batchSetAPY(updates: [{String: AnyStruct}]) {
            pre { updates.length > 0: "No updates provided" }
            for update in updates {
                let strategyId = update["strategyId"] as? String ?? panic("Missing strategyId")
                let apy = update["apy"] as? UFix64 ?? panic("Missing apy for ".concat(strategyId))
                let source = update["source"] as? String ?? "oracle"
                let confidence = update["confidence"] as? UFix64 ?? 0.80
                self.setAPY(strategyId: strategyId, apy: apy, source: source, confidence: confidence)
            }
            emit APYBatchUpdated(count: updates.length, timestamp: getCurrentBlock().timestamp)
        }

        /// Remove stale oracle data for a strategy (e.g. strategy deprecated).
        access(OracleAdmin) fun removeStrategy(strategyId: String) {
            YieldOracle.removeYieldData(strategyId: strategyId)
        }
    }

    // ── Public read-only resource interface ──
    access(all) resource interface OraclePublic {
        access(all) view fun getAPY(_ strategyId: String): UFix64?
        access(all) view fun getDailyRate(_ strategyId: String): UFix64?
        access(all) view fun getYieldData(_ strategyId: String): YieldData?
        access(all) view fun getAllAPYs(): {String: YieldData}
        access(all) view fun isDataFresh(_ strategyId: String, maxAgeSeconds: UFix64): Bool
    }

    access(all) resource PublicReader: OraclePublic {
        access(all) view fun getAPY(_ strategyId: String): UFix64? {
            return YieldOracle.readYieldData(strategyId: strategyId)?.apy
        }
        access(all) view fun getDailyRate(_ strategyId: String): UFix64? {
            return YieldOracle.readYieldData(strategyId: strategyId)?.dailyRate
        }
        access(all) view fun getYieldData(_ strategyId: String): YieldData? {
            return YieldOracle.readYieldData(strategyId: strategyId)
        }
        access(all) view fun getAllAPYs(): {String: YieldData} {
            return YieldOracle.readAllAPYs()
        }
        access(all) view fun isDataFresh(_ strategyId: String, maxAgeSeconds: UFix64): Bool {
            if let data = YieldOracle.readYieldData(strategyId: strategyId) {
                return getCurrentBlock().timestamp - data.updatedAt <= maxAgeSeconds
            }
            return false
        }
    }

    // ── Contract-level state ──
    access(self) var yieldData: {String: YieldData}

    init() {
        self.OracleStoragePath = /storage/SentinelYieldOracle
        self.OraclePublicPath = /public/SentinelYieldOracle
        self.OracleAdminStoragePath = /storage/SentinelYieldOracleAdmin
        self.yieldData = {}

        // Save OracleAdminResource to deployer's storage
        // Only the deployer account (and accounts they explicitly share it with) can update APYs
        let adminResource <- create OracleAdminResource()
        self.account.storage.save(<-adminResource, to: self.OracleAdminStoragePath)
        emit OracleAdminResourceCreated(recipient: self.account.address)

        // Seed initial APY data from real Flow DeFi market conditions
        self.yieldData["liquid-staking-pro"] = YieldData(apy: 6.5, source: "flow-staking-protocol", confidence: 0.95)
        self.yieldData["defi-yield-maximizer"] = YieldData(apy: 8.2, source: "incrementfi-lending", confidence: 0.80)
        self.yieldData["high-yield-farming"] = YieldData(apy: 15.5, source: "defi-aggregator", confidence: 0.65)
        self.yieldData["arbitrage-hunter"] = YieldData(apy: 5.8, source: "dex-spread-analysis", confidence: 0.70)
        self.yieldData["conservative-lending"] = YieldData(apy: 4.2, source: "lending-protocol-avg", confidence: 0.90)
        self.yieldData["stable-yield-plus"] = YieldData(apy: 3.5, source: "stable-protocol", confidence: 0.95)
    }

    // ── Internal storage helpers ──
    access(contract) fun storeYieldData(strategyId: String, data: YieldData) {
        self.yieldData[strategyId] = data
    }

    access(contract) fun removeYieldData(strategyId: String) {
        self.yieldData.remove(key: strategyId)
    }

    // ── Public read functions (callable by any contract or script) ──
    access(all) view fun readYieldData(strategyId: String): YieldData? {
        return self.yieldData[strategyId]
    }

    access(all) view fun readAPY(strategyId: String): UFix64? {
        return self.yieldData[strategyId]?.apy
    }

    access(all) view fun readDailyRate(strategyId: String): UFix64? {
        return self.yieldData[strategyId]?.dailyRate
    }

    access(all) view fun readAllAPYs(): {String: YieldData} {
        return self.yieldData
    }

    // Convenience alias for strategy contracts
    access(all) view fun getYieldData(_ strategyId: String): YieldData? {
        return self.readYieldData(strategyId: strategyId)
    }

    /// Check how many seconds ago the oracle data was last updated.
    access(all) view fun getDataAge(_ strategyId: String): UFix64? {
        if let data = self.yieldData[strategyId] {
            return getCurrentBlock().timestamp - data.updatedAt
        }
        return nil
    }

    // Factory functions
    access(all) fun createPublicReader(): @PublicReader {
        return <- create PublicReader()
    }

    // REMOVED: createAdmin() — no longer returns an unauthenticated Admin resource.
    // Admin access is via the OracleAdminResource stored at OracleAdminStoragePath.
    // To borrow it: signer.storage.borrow<auth(YieldOracle.OracleAdmin) &YieldOracle.OracleAdminResource>(from: YieldOracle.OracleAdminStoragePath)
}
