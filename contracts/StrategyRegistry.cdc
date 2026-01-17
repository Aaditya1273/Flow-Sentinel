import SentinelInterfaces from 0x136b642d0aa31ca9
import LiquidStakingStrategy from 0x136b642d0aa31ca9
import YieldFarmingStrategy from 0x136b642d0aa31ca9
import ArbitrageStrategy from 0x136b642d0aa31ca9

// Strategy Registry - Central registry for all available DeFi strategies
access(all) contract StrategyRegistry {
    
    // Storage paths
    access(all) let RegistryStoragePath: StoragePath
    access(all) let RegistryPublicPath: PublicPath
    
    // Registry state
    access(all) var totalStrategies: UInt64
    access(self) let strategies: {String: {String: AnyStruct}}
    
    // Events
    access(all) event StrategyRegistered(strategyId: String, name: String, category: String)
    access(all) event StrategyUpdated(strategyId: String, field: String)
    access(all) event StrategyDeactivated(strategyId: String, reason: String)
    
    init() {
        self.RegistryStoragePath = /storage/StrategyRegistry
        self.RegistryPublicPath = /public/StrategyRegistry
        self.totalStrategies = 0
        self.strategies = {}
        
        // Register default strategies
        self.registerDefaultStrategies()
    }
    
    // Public interface for strategy registry
    access(all) resource interface RegistryPublic {
        access(all) fun getAllStrategies(): [{String: AnyStruct}]
        access(all) fun getStrategy(strategyId: String): {String: AnyStruct}?
        access(all) fun getStrategiesByCategory(category: String): [{String: AnyStruct}]
        access(all) fun getStrategiesByRisk(riskLevel: UInt8): [{String: AnyStruct}]
        access(all) fun getTotalStrategies(): UInt64
    }
    
    // Strategy Registry Resource
    access(all) resource Registry: RegistryPublic {
        
        access(all) fun getAllStrategies(): [{String: AnyStruct}] {
            let allStrategies: [{String: AnyStruct}] = []
            
            for strategyId in StrategyRegistry.strategies.keys {
                if let strategy = StrategyRegistry.strategies[strategyId] {
                    allStrategies.append(strategy)
                }
            }
            
            return allStrategies
        }
        
        access(all) fun getStrategy(strategyId: String): {String: AnyStruct}? {
            return StrategyRegistry.strategies[strategyId]
        }
        
        access(all) fun getStrategiesByCategory(category: String): [{String: AnyStruct}] {
            let categoryStrategies: [{String: AnyStruct}] = []
            
            for strategyId in StrategyRegistry.strategies.keys {
                if let strategy = StrategyRegistry.strategies[strategyId] {
                    if strategy["category"] as! String == category {
                        categoryStrategies.append(strategy)
                    }
                }
            }
            
            return categoryStrategies
        }
        
        access(all) fun getStrategiesByRisk(riskLevel: UInt8): [{String: AnyStruct}] {
            let riskStrategies: [{String: AnyStruct}] = []
            
            for strategyId in StrategyRegistry.strategies.keys {
                if let strategy = StrategyRegistry.strategies[strategyId] {
                    if strategy["riskLevel"] as! UInt8 == riskLevel {
                        riskStrategies.append(strategy)
                    }
                }
            }
            
            return riskStrategies
        }
        
        access(all) fun getTotalStrategies(): UInt64 {
            return StrategyRegistry.totalStrategies
        }
        
        // Get featured strategies
        access(all) fun getFeaturedStrategies(): [{String: AnyStruct}] {
            let featuredStrategies: [{String: AnyStruct}] = []
            
            for strategyId in StrategyRegistry.strategies.keys {
                if let strategy = StrategyRegistry.strategies[strategyId] {
                    if strategy["featured"] as? Bool == true {
                        featuredStrategies.append(strategy)
                    }
                }
            }
            
            return featuredStrategies
        }
        
        // Get strategy performance metrics
        access(all) fun getStrategyMetrics(strategyId: String): {String: AnyStruct}? {
            if let strategy = StrategyRegistry.strategies[strategyId] {
                return {
                    "tvl": strategy["tvl"] ?? 0.0,
                    "participants": strategy["participants"] ?? 0,
                    "expectedAPY": strategy["expectedAPY"] ?? 0.0,
                    "riskLevel": strategy["riskLevel"] ?? 1,
                    "isActive": strategy["isActive"] ?? false,
                    "performance24h": self.calculatePerformance(strategyId, 1),
                    "performance7d": self.calculatePerformance(strategyId, 7),
                    "performance30d": self.calculatePerformance(strategyId, 30)
                }
            }
            return nil
        }
        
        // Calculate strategy performance (simulated)
        access(self) fun calculatePerformance(_ strategyId: String, _ days: UInt64): UFix64 {
            // Simulate performance calculation based on strategy type
            if let strategy = StrategyRegistry.strategies[strategyId] {
                let expectedAPY = strategy["expectedAPY"] as! UFix64
                let dailyRate = expectedAPY / 365.0
                let periodReturn = dailyRate * UFix64(days)
                
                // Add some randomness to simulate real performance
                let randomFactor = UFix64(revertibleRandom<UInt64>() % 20) / 100.0 // ±10%
                let performanceVariation = periodReturn * (1.0 + randomFactor - 0.1)
                
                return performanceVariation
            }
            return 0.0
        }
    }
    
    // Register default strategies
    access(self) fun registerDefaultStrategies() {
        // Register Liquid Staking Strategy
        let liquidStakingInfo = LiquidStakingStrategy.getStrategyInfo()
        var liquidStaking = liquidStakingInfo
        liquidStaking["featured"] = true
        liquidStaking["performance24h"] = 0.8
        liquidStaking["performance7d"] = 5.2
        liquidStaking["performance30d"] = 18.7
        self.strategies["liquid-staking-pro"] = liquidStaking
        
        // Register Yield Farming Strategy
        let yieldFarmingInfo = YieldFarmingStrategy.getStrategyInfo()
        var yieldFarming = yieldFarmingInfo
        yieldFarming["featured"] = true
        yieldFarming["performance24h"] = 1.2
        yieldFarming["performance7d"] = 8.9
        yieldFarming["performance30d"] = 32.1
        self.strategies["defi-yield-maximizer"] = yieldFarming
        
        // Register Arbitrage Strategy
        let arbitrageInfo = ArbitrageStrategy.getStrategyInfo()
        var arbitrage = arbitrageInfo
        arbitrage["featured"] = false
        arbitrage["performance24h"] = 0.6
        arbitrage["performance7d"] = 4.1
        arbitrage["performance30d"] = 15.8
        self.strategies["arbitrage-hunter"] = arbitrage
        
        // Add additional strategies
        self.registerConservativeLending()
        self.registerHighYieldFarming()
        self.registerStableYieldPlus()
        
        self.totalStrategies = UInt64(self.strategies.length)
        
        // Emit registration events
        for strategyId in self.strategies.keys {
            let strategy = self.strategies[strategyId]!
            emit StrategyRegistered(
                strategyId: strategyId,
                name: strategy["name"] as! String,
                category: strategy["category"] as! String
            )
        }
    }
    
    // Register additional strategies
    access(self) fun registerConservativeLending() {
        self.strategies["conservative-lending"] = {
            "id": "conservative-lending",
            "name": "Conservative Lending",
            "description": "Safe lending strategies with blue-chip collateral",
            "riskLevel": 1 as UInt8,
            "category": "lending",
            "minDeposit": 50.0,
            "expectedAPY": 8.7,
            "tvl": 3200000.0,
            "participants": 2156 as UInt64,
            "isActive": true,
            "featured": false,
            "creator": "Secure Finance",
            "verified": true,
            "features": ["Blue-chip Only", "Over-collateralized", "Insurance"],
            "performance24h": 0.3,
            "performance7d": 2.1,
            "performance30d": 9.4
        }
    }
    
    access(self) fun registerHighYieldFarming() {
        self.strategies["high-yield-farming"] = {
            "id": "high-yield-farming",
            "name": "High-Yield Farming",
            "description": "Aggressive yield farming with leverage and advanced strategies",
            "riskLevel": 3 as UInt8,
            "category": "yield-farming",
            "minDeposit": 500.0,
            "expectedAPY": 45.2,
            "tvl": 680000.0,
            "participants": 234 as UInt64,
            "isActive": true,
            "featured": false,
            "creator": "Degen Capital",
            "verified": false,
            "features": ["Leveraged", "High-Risk", "Expert Only"],
            "performance24h": 2.8,
            "performance7d": 15.6,
            "performance30d": 67.3
        }
    }
    
    access(self) fun registerStableYieldPlus() {
        self.strategies["stable-yield-plus"] = {
            "id": "stable-yield-plus",
            "name": "Stable Yield Plus",
            "description": "Enhanced stablecoin yields through optimized lending",
            "riskLevel": 1 as UInt8,
            "category": "lending",
            "minDeposit": 25.0,
            "expectedAPY": 6.4,
            "tvl": 4100000.0,
            "participants": 3421 as UInt64,
            "isActive": true,
            "featured": false,
            "creator": "Stable Protocol",
            "verified": true,
            "features": ["Stablecoin Only", "Low Risk", "High Liquidity"],
            "performance24h": 0.2,
            "performance7d": 1.3,
            "performance30d": 5.8
        }
    }
    
    // Create registry resource
    access(all) fun createRegistry(): @Registry {
        return <- create Registry()
    }
    
    // Get all strategies (public function)
    access(all) fun getAllStrategies(): [{String: AnyStruct}] {
        let allStrategies: [{String: AnyStruct}] = []
        
        for strategyId in self.strategies.keys {
            if let strategy = self.strategies[strategyId] {
                allStrategies.append(strategy)
            }
        }
        
        return allStrategies
    }
    
    // Get strategy by ID (public function)
    access(all) fun getStrategy(strategyId: String): {String: AnyStruct}? {
        return self.strategies[strategyId]
    }
    
    // Update strategy TVL
    access(all) fun updateStrategyTVL(strategyId: String, amount: UFix64, isDeposit: Bool) {
        if var strategy = self.strategies[strategyId] {
            let currentTVL = strategy["tvl"] as! UFix64
            let currentParticipants = strategy["participants"] as! UInt64
            
            if isDeposit {
                strategy["tvl"] = currentTVL + amount
                strategy["participants"] = currentParticipants + 1
            } else {
                strategy["tvl"] = currentTVL > amount ? currentTVL - amount : 0.0
                strategy["participants"] = currentParticipants > 0 ? currentParticipants - 1 : 0
            }
            
            self.strategies[strategyId] = strategy
            emit StrategyUpdated(strategyId: strategyId, field: "tvl")
        }
    }
}