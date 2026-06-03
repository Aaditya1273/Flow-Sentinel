import FungibleToken from 0x9a0766d93b6608b7

// YieldOracle — Decentralized APY data feed for Sentinel strategies
access(all) contract YieldOracle {

    access(all) entitlement UpdateYield

    access(all) event APYUpdated(strategyId: String, newAPY: UFix64, timestamp: UFix64)
    access(all) event AdminAdded(admin: Address)
    access(all) event AdminRemoved(admin: Address)

    access(all) let OracleStoragePath: StoragePath
    access(all) let OraclePublicPath: PublicPath

    access(all) struct YieldData {
        access(all) let apy: UFix64
        access(all) let dailyRate: UFix64
        access(all) let source: String
        access(all) let updatedAt: UFix64
        access(all) let confidence: UFix64

        init(apy: UFix64, source: String, confidence: UFix64) {
            self.apy = apy
            self.dailyRate = apy / 365.0 / 100.0
            self.source = source
            self.updatedAt = getCurrentBlock().timestamp
            self.confidence = confidence
        }
    }

    access(all) resource Admin {
        access(all) fun setAPY(strategyId: String, apy: UFix64, source: String, confidence: UFix64) {
            let yieldData = YieldData(apy: apy, source: source, confidence: confidence)
            YieldOracle.storeYieldData(strategyId: strategyId, data: yieldData)
            emit APYUpdated(strategyId: strategyId, newAPY: apy, timestamp: getCurrentBlock().timestamp)
        }

        access(all) fun batchSetAPY(strategies: {String: {String: AnyStruct}}) {
            for strategyId in strategies.keys {
                if let data = strategies[strategyId] {
                    let apy = data["apy"] as? UFix64 ?? panic("Missing or invalid apy field for ".concat(strategyId))
                    let source = data["source"] as? String ?? panic("Missing or invalid source field for ".concat(strategyId))
                    let confidence = data["confidence"] as? UFix64 ?? panic("Missing or invalid confidence field for ".concat(strategyId))
                    self.setAPY(strategyId: strategyId, apy: apy, source: source, confidence: confidence)
                }
            }
        }
    }

    access(all) resource interface OraclePublic {
        access(all) fun getAPY(_ strategyId: String): UFix64?
        access(all) fun getDailyRate(_ strategyId: String): UFix64?
        access(all) fun getYieldData(_ strategyId: String): YieldData?
        access(all) fun getAllAPYs(): {String: YieldData}
    }

    access(all) resource PublicReader: OraclePublic {
        access(all) fun getAPY(_ strategyId: String): UFix64? {
            return YieldOracle.readYieldData(strategyId: strategyId)?.apy
        }

        access(all) fun getDailyRate(_ strategyId: String): UFix64? {
            return YieldOracle.readYieldData(strategyId: strategyId)?.dailyRate
        }

        access(all) fun getYieldData(_ strategyId: String): YieldData? {
            return YieldOracle.readYieldData(strategyId: strategyId)
        }

        access(all) fun getAllAPYs(): {String: YieldData} {
            return YieldOracle.readAllAPYs()
        }
    }

    // Contract-level state
    access(self) var yieldData: {String: YieldData}
    access(self) var admins: {Address: Bool}
    access(all) var totalAdmins: UInt64

    init() {
        self.OracleStoragePath = /storage/SentinelYieldOracle
        self.OraclePublicPath = /public/SentinelYieldOracle
        self.yieldData = {}
        self.admins = {}
        self.totalAdmins = 0

        self.admins[self.account.address] = true
        self.totalAdmins = 1

        // Realistic APY values based on actual Flow DeFi market conditions
        // Flow native staking APY: ~6.5% (varies with total stake)
        self.yieldData["liquid-staking-pro"] = YieldData(
            apy: 6.5,
            source: "flow-staking",
            confidence: 0.95
        )
        // Real DeFi lending on IncrementFi/Flowty: ~5-9%
        self.yieldData["defi-yield-maximizer"] = YieldData(
            apy: 8.2,
            source: "defi-labs-aggregator",
            confidence: 0.80
        )
        // High-risk farming: ~12-18% (still realistic for Flow DeFi)
        self.yieldData["high-yield-farming"] = YieldData(
            apy: 15.5,
            source: "defi-labs-aggregator",
            confidence: 0.65
        )
        // DEX arbitrage: ~4-7% net after gas
        self.yieldData["arbitrage-hunter"] = YieldData(
            apy: 5.8,
            source: "dex-aggregator",
            confidence: 0.70
        )
        // Conservative lending: ~3-5%
        self.yieldData["conservative-lending"] = YieldData(
            apy: 4.2,
            source: "lending-protocols",
            confidence: 0.90
        )
        // Stable yield: ~3-4%
        self.yieldData["stable-yield-plus"] = YieldData(
            apy: 3.5,
            source: "stable-protocol",
            confidence: 0.95
        )
    }

    // Internal storage helpers
    access(self) fun storeYieldData(strategyId: String, data: YieldData) {
        self.yieldData[strategyId] = data
    }

    // Contract-level read functions — callable by imported contracts
    access(all) fun readYieldData(strategyId: String): YieldData? {
        return self.yieldData[strategyId]
    }

    access(all) fun readAPY(strategyId: String): UFix64? {
        return self.yieldData[strategyId]?.apy
    }

    access(all) fun readDailyRate(strategyId: String): UFix64? {
        return self.yieldData[strategyId]?.dailyRate
    }

    access(all) fun readAllAPYs(): {String: YieldData} {
        return self.yieldData
    }

    // Convenience functions for strategy contracts (no label needed)
    access(all) fun getYieldData(_ strategyId: String): YieldData? {
        return self.readYieldData(strategyId: strategyId)
    }

    access(all) fun isAdmin(_ addr: Address): Bool {
        return self.admins[addr] ?? false
    }

    access(all) fun createAdmin(): @Admin {
        return <- create Admin()
    }

    access(all) fun createPublicReader(): @PublicReader {
        return <- create PublicReader()
    }
}
