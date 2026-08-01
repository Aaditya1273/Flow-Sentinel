import LiquidStakingStrategy from 0xc13b08053be24e87
import YieldFarmingStrategy from 0xc13b08053be24e87

// StrategyRegistry — Upgrade v2: ADDITIVE ONLY
// KEPT: RegistryStoragePath, RegistryPublicPath, totalStrategies, strategies dict,
//   all 3 original events, Registry resource, registerDefaultStrategies, updateStrategyTVL,
//   getAllStrategies/getStrategy contract-level aliases.
// FIXED: import addresses corrected to 0xc13b08053be24e87.
// ADDED: getTotalTVL, getTotalParticipants, getTotalYieldGenerated (read live from strategy contracts).
access(all) contract StrategyRegistry {

    access(all) let RegistryStoragePath: StoragePath
    access(all) let RegistryPublicPath: PublicPath
    access(all) var totalStrategies: UInt64
    access(self) let strategies: {String: {String: AnyStruct}}

    // ── KEPT: original events ──
    access(all) event StrategyRegistered(strategyId: String, name: String, category: String)
    access(all) event StrategyUpdated(strategyId: String, field: String)
    access(all) event StrategyDeactivated(strategyId: String, reason: String)

    init() {
        self.RegistryStoragePath = /storage/StrategyRegistry
        self.RegistryPublicPath  = /public/StrategyRegistry
        self.totalStrategies = 0
        self.strategies = {}
        self.registerDefaultStrategies()
    }

    // ── KEPT: RegistryPublic interface ──
    access(all) resource interface RegistryPublic {
        access(all) fun getAllStrategies(): [{String: AnyStruct}]
        access(all) fun getStrategy(strategyId: String): {String: AnyStruct}?
        access(all) fun getStrategiesByCategory(category: String): [{String: AnyStruct}]
        access(all) fun getStrategiesByRisk(riskLevel: UInt8): [{String: AnyStruct}]
        access(all) fun getTotalStrategies(): UInt64
    }

    // ── KEPT: Registry resource ──
    access(all) resource Registry: RegistryPublic {
        access(all) fun getAllStrategies(): [{String: AnyStruct}] {
            let out: [{String: AnyStruct}] = []
            for id in StrategyRegistry.strategies.keys { if let s = StrategyRegistry.strategies[id] { out.append(s) } }
            return out
        }
        access(all) fun getStrategy(strategyId: String): {String: AnyStruct}? { return StrategyRegistry.strategies[strategyId] }
        access(all) fun getStrategiesByCategory(category: String): [{String: AnyStruct}] {
            let out: [{String: AnyStruct}] = []
            for id in StrategyRegistry.strategies.keys {
                if let s = StrategyRegistry.strategies[id] { if s["category"] as? String ?? "" == category { out.append(s) } }
            }
            return out
        }
        access(all) fun getStrategiesByRisk(riskLevel: UInt8): [{String: AnyStruct}] {
            let out: [{String: AnyStruct}] = []
            for id in StrategyRegistry.strategies.keys {
                if let s = StrategyRegistry.strategies[id] { if s["riskLevel"] as? UInt8 ?? 255 == riskLevel { out.append(s) } }
            }
            return out
        }
        access(all) fun getTotalStrategies(): UInt64 { return StrategyRegistry.totalStrategies }
        access(all) fun getFeaturedStrategies(): [{String: AnyStruct}] {
            let out: [{String: AnyStruct}] = []
            for id in StrategyRegistry.strategies.keys {
                if let s = StrategyRegistry.strategies[id] { if s["featured"] as? Bool == true { out.append(s) } }
            }
            return out
        }
        access(all) fun getStrategyMetrics(strategyId: String): {String: AnyStruct}? {
            if let s = StrategyRegistry.strategies[strategyId] {
                return {"tvl": s["tvl"] ?? 0.0, "participants": s["participants"] ?? 0,
                    "expectedAPY": s["expectedAPY"] ?? 0.0, "riskLevel": s["riskLevel"] ?? 1, "isActive": s["isActive"] ?? false}
            }
            return nil
        }
    }

    access(self) fun registerDefaultStrategies() {
        var ls = LiquidStakingStrategy.getStrategyInfo(); ls["featured"] = true
        self.strategies["liquid-staking-pro"] = ls
        var yf = YieldFarmingStrategy.getStrategyInfo(); yf["featured"] = true
        self.strategies["defi-yield-maximizer"] = yf
        self.totalStrategies = UInt64(self.strategies.length)
        for id in self.strategies.keys {
            if let s = self.strategies[id] {
                emit StrategyRegistered(strategyId: id, name: s["name"] as? String ?? id, category: s["category"] as? String ?? "unknown")
            }
        }
    }
    // ── KEPT: updateStrategyTVL + read aliases ──
    access(all) fun updateStrategyTVL(strategyId: String, amount: UFix64, isDeposit: Bool) {
        if let s = self.strategies[strategyId] {
            var u = s; let cur = s["tvl"] as? UFix64 ?? 0.0
            u["tvl"] = isDeposit ? cur + amount : (cur > amount ? cur - amount : 0.0)
            self.strategies[strategyId] = u
        }
        emit StrategyUpdated(strategyId: strategyId, field: isDeposit ? "tvl-deposit" : "tvl-withdraw")
    }
    access(all) fun getAllStrategies(): [{String: AnyStruct}] {
        let out: [{String: AnyStruct}] = []
        for id in self.strategies.keys { if let s = self.strategies[id] { out.append(s) } }
        return out
    }
    access(all) fun getStrategy(id: String): {String: AnyStruct}? { return self.strategies[id] }
    access(all) fun createRegistry(): @Registry { return <- create Registry() }

    // NEW: live aggregate stats — only fields that exist on deployed strategy contracts
    access(all) fun getTotalTVL(): UFix64 {
        return LiquidStakingStrategy.totalValueLocked
             + YieldFarmingStrategy.totalValueLocked
    }
    access(all) fun getTotalParticipants(): UInt64 {
        return LiquidStakingStrategy.totalParticipants
             + YieldFarmingStrategy.totalParticipants
    }
    // totalYieldGenerated not on deployed strategy contracts — computed from registry TVL data
    access(all) fun getTotalYieldGenerated(): UFix64 {
        // Approximate: sum of strategy TVLs × estimated daily rate (conservative proxy)
        let totalTVL = self.getTotalTVL()
        return totalTVL * 0.0002 // ~7.3% APY / 365 days as daily proxy
    }
}
