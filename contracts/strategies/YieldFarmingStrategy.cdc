import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868
import SentinelInterfaces from 0xc13b08053be24e87
import YieldOracle from 0xc13b08053be24e87

// ── Yield Farming Strategy — Phase 3 ──
// Multi-protocol allocation across IncrementFi, Flowty, and FlowSwap.
// Per-protocol yield calculated independently from each protocol's APY.
// VRF-shuffled execution order prevents sandwich attacks.
access(all) contract YieldFarmingStrategy {

    access(all) let strategyId: String
    access(all) let name: String
    access(all) let description: String
    access(all) let riskLevel: UInt8
    access(all) let category: String
    access(all) let minDeposit: UFix64
    access(all) var expectedAPY: UFix64
    access(all) var isActive: Bool

    // ── Per-protocol TVL tracking ──
    access(all) var protocolTVL: {String: UFix64}
    access(all) var protocolYieldGenerated: {String: UFix64}
    access(all) var totalValueLocked: UFix64
    access(all) var totalParticipants: UInt64
    access(all) var totalYieldGenerated: UFix64
    access(all) var totalExecutions: UInt64

    // Protocol allocation weights (must sum to 1.0)
    access(all) let protocolAllocations: {String: UFix64}

    // Kill switch — admin can disable/enable this strategy
    access(account) fun setActive(_ active: Bool) {
        self.isActive = active
    }

    // Events
    access(all) event StrategyExecuted(
        vaultId: UInt64, amount: UFix64, totalYield: UFix64,
        protocolBreakdown: String, executionOrder: String, usedRealProtocol: Bool
    )
    access(all) event ProtocolYieldAccrued(protocol: String, amount: UFix64, allocation: UFix64, apy: UFix64)
    access(all) event ExecutionOrderShuffled(protocolCount: UInt64, vrfSeed: UInt64)
    access(all) event TVLUpdated(protocol: String, newTVL: UFix64)

    init() {
        self.strategyId = "defi-yield-maximizer"
        self.name = "DeFi Yield Maximizer"
        self.description = "Disabled until audited external protocol adapters are deployed"
        self.riskLevel = 2
        self.category = "yield-farming"
        self.minDeposit = 100.0
        self.expectedAPY = 0.0
        self.isActive = true

        self.protocolAllocations = {
            "IncrementFi": 0.40,
            "Flowty": 0.30,
            "FlowSwap": 0.20,
            "Reserve": 0.10
        }
        self.protocolTVL = {
            "IncrementFi": 0.0, "Flowty": 0.0, "FlowSwap": 0.0, "Reserve": 0.0
        }
        self.protocolYieldGenerated = {
            "IncrementFi": 0.0, "Flowty": 0.0, "FlowSwap": 0.0, "Reserve": 0.0
        }
        self.totalValueLocked = 0.0
        self.totalParticipants = 0
        self.totalYieldGenerated = 0.0
        self.totalExecutions = 0
    }

    // ── Per-protocol APY from oracle ──
    access(contract) fun getProtocolAPY(_ protocol: String): UFix64 {
        let oracleKey = "defi-yield-maximizer-".concat(protocol)
        if let data = YieldOracle.getYieldData(oracleKey) { return data.apy }
        if let data = YieldOracle.getYieldData(YieldFarmingStrategy.strategyId) { return data.apy }
        return YieldFarmingStrategy.expectedAPY
    }

    // ── VRF shuffle execution order (MEV Layer 4) ──
    access(contract) fun vrfShuffleProtocols(_ protocols: [String]): [String] {
        if protocols.length <= 1 { return protocols }
        let vrfSeed = revertibleRandom<UInt64>()
        emit ExecutionOrderShuffled(protocolCount: UInt64(protocols.length), vrfSeed: vrfSeed)
        var shuffled: [String] = []
        var remaining = protocols
        while remaining.length > 0 {
            let idx = revertibleRandom<UInt64>() % UInt64(remaining.length)
            shuffled.append(remaining[idx])
            var next: [String] = []
            for i, p in remaining { if UInt64(i) != idx { next.append(p) } }
            remaining = next
        }
        return shuffled
    }

    access(all) resource StrategyExecutor: SentinelInterfaces.IStrategy {

        access(all) fun executeStrategy(vaultBalance: UFix64): SentinelInterfaces.StrategyResult {
            // Fail closed until real connectors transfer assets into and out of
            // audited external protocols. Oracle allocation is not yield.
            panic("Yield farming integration is not deployed; synthetic yield is disabled")
        }

        access(all) fun getExpectedYield(amount: UFix64): UFix64 {
            return 0.0
        }

        access(all) fun getRiskLevel(): UInt8 { return YieldFarmingStrategy.riskLevel }
        access(all) fun getProtocolSource(): String { return "Oracle APY allocation; no external protocol call" }
    }

    access(all) fun createExecutor(): @StrategyExecutor { return <- create StrategyExecutor() }

    access(all) fun getStrategyInfo(): {String: AnyStruct} {
        let currentAPY = 0.0
        return {
            "id": self.strategyId,
            "name": self.name,
            "description": self.description,
            "riskLevel": self.riskLevel,
            "category": self.category,
            "minDeposit": self.minDeposit,
            "expectedAPY": currentAPY,
            "dailyRate": currentAPY / 365.0,
            "apySource": "disabled",
            "tvl": self.totalValueLocked,
            "participants": self.totalParticipants,
            "totalYieldGenerated": self.totalYieldGenerated,
            "totalExecutions": self.totalExecutions,
            "protocolAllocations": self.protocolAllocations,
            "protocolTVL": self.protocolTVL,
            "protocolYieldGenerated": self.protocolYieldGenerated,
            "isActive": self.isActive,
            "features": ["Oracle APY Allocation", "Reserve-Funded Testnet Yield", "MEV Protection"],
            "creator": "Sentinel Labs",
            "verified": false,
            "protocolSource": "Oracle APY allocation; no external protocol call",
            "allocationType": "SIMULATED — per-protocol oracle APY with VRF shuffle",
            "provenance": YieldOracle.readSourceDetail(self.strategyId)?.protocolName ?? "aggregated",
            "methodology": YieldOracle.readSourceDetail(self.strategyId)?.methodology ?? "multi-protocol",
            "mevProtection": "VRF Protocol Shuffle (≤0.1% timing jitter)"
        }
    }

    access(all) fun updateTVL(amount: UFix64, isDeposit: Bool) {
        if isDeposit {
            self.totalValueLocked = self.totalValueLocked + amount
            self.totalParticipants = self.totalParticipants + 1
        } else {
            self.totalValueLocked = self.totalValueLocked > amount ? self.totalValueLocked - amount : 0.0
            self.totalParticipants = self.totalParticipants > 0 ? self.totalParticipants - 1 : 0
        }
    }
}
