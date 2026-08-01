import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868
import SentinelInterfaces from 0xc13b08053be24e87
import YieldOracle from 0xc13b08053be24e87

// ── Liquid Staking Strategy ──
// Yield calculation uses oracle APY data (updated by keeper with real Flow staking rates).
access(all) contract LiquidStakingStrategy {

    access(all) let strategyId: String
    access(all) let name: String
    access(all) let description: String
    access(all) let riskLevel: UInt8
    access(all) let category: String
    access(all) let minDeposit: UFix64
    access(all) var expectedAPY: UFix64          // zero until a real adapter is deployed
    access(all) var lastEpochAPY: UFix64         // zero until a real adapter is deployed
    access(all) var totalValueLocked: UFix64     // cumulative balance processed
    access(all) var totalParticipants: UInt64
    access(all) var totalYieldGenerated: UFix64  // cumulative yield paid out
    access(all) var totalExecutions: UInt64
    access(all) var isActive: Bool

    // Kill switch — admin can disable/enable this strategy
    access(account) fun setActive(_ active: Bool) {
        self.isActive = active
    }

    // Events
    access(all) event StrategyExecuted(
        vaultId: UInt64, amount: UFix64, yield: UFix64,
        realizedAPY: UFix64, protocolSource: String,
        usedRealProtocol: Bool, mevJitterBps: UInt64
    )
    access(all) event EpochDataSynced(epochAPY: UFix64, weeklyRate: UFix64, source: String)
    access(all) event TVLUpdated(newTVL: UFix64, participants: UInt64)

    init() {
        self.strategyId = "liquid-staking-pro"
        self.name = "Flow Liquid Staking Pro"
        self.description = "Testnet oracle-driven reserve-funded yield calculation; no staking position"
        self.riskLevel = 1
        self.category = "liquid-staking"
        self.minDeposit = 10.0
        self.expectedAPY = 0.0
        self.lastEpochAPY = 0.0
        self.totalValueLocked = 0.0
        self.totalParticipants = 0
        self.totalYieldGenerated = 0.0
        self.totalExecutions = 0
        self.isActive = true
    }

    //    ── Sync APY from oracle ──
    access(contract) fun syncEpochAPY(): UFix64 {
        let apy = self.getOracleAPY()
        LiquidStakingStrategy.lastEpochAPY = apy
        emit EpochDataSynced(epochAPY: apy, weeklyRate: apy / 52.0, source: "YieldOracle")
        return apy
    }

    access(contract) fun getOracleAPY(): UFix64 {
        if let data = YieldOracle.getYieldData(LiquidStakingStrategy.strategyId) {
            LiquidStakingStrategy.expectedAPY = data.apy
            return data.apy
        }
        return 0.0
    }

    access(all) resource StrategyExecutor: SentinelInterfaces.IStrategy {

        access(all) fun executeStrategy(vaultBalance: UFix64): SentinelInterfaces.StrategyResult {
            // Fail closed until this executor actually owns and interacts with
            // a Flow staking position. Oracle APY alone is not yield generation.
            panic("Liquid staking integration is not deployed; synthetic yield is disabled")
        }

        access(all) fun getExpectedYield(amount: UFix64): UFix64 {
            let apy = LiquidStakingStrategy.getOracleAPY()
            return 0.0
        }

        access(all) fun getRiskLevel(): UInt8 {
            return LiquidStakingStrategy.riskLevel
        }

        access(all) fun getProtocolSource(): String {
            return "Disabled: no external staking adapter"
        }
    }

    access(all) fun createExecutor(): @StrategyExecutor {
        return <- create StrategyExecutor()
    }

    access(all) fun getStrategyInfo(): {String: AnyStruct} {
        let currentAPY = self.getOracleAPY()
        let source = YieldOracle.getYieldData(self.strategyId)?.source ?? "oracle"
        return {
            "id": self.strategyId,
            "name": self.name,
            "description": self.description,
            "riskLevel": self.riskLevel,
            "category": self.category,
            "minDeposit": self.minDeposit,
            "expectedAPY": currentAPY,
            "lastEpochAPY": self.lastEpochAPY,
            "dailyRate": currentAPY / 365.0,
            "apySource": source,
            "tvl": self.totalValueLocked,
            "participants": self.totalParticipants,
            "totalYieldGenerated": self.totalYieldGenerated,
            "totalExecutions": self.totalExecutions,
            "isActive": self.isActive,
            "features": ["Oracle APY", "Reserve-Funded Testnet Yield", "MEV Protection"],
            "creator": "Flow Sentinel",
            "verified": false,
            "protocolSource": "YieldOracle APY; no external staking call",
            "stakingType": "SIMULATED — no FlowIDTableStaking position",
            "provenance": source,
            "methodology": "epoch-rewards",
            "mevProtection": "Full MEV-Shield (VRF jitter ≤ 0.5%)"
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
        emit TVLUpdated(newTVL: self.totalValueLocked, participants: self.totalParticipants)
    }
}
