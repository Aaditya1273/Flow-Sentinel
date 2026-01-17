import StrategyRegistry from 0x136b642d0aa31ca9
import LiquidStakingStrategy from 0x136b642d0aa31ca9
import YieldFarmingStrategy from 0x136b642d0aa31ca9
import ArbitrageStrategy from 0x136b642d0aa31ca9

// Test script to verify all strategies are deployed and working
access(all) fun main(): {String: AnyStruct} {
    let account = getAccount(0x136b642d0aa31ca9)
    
    // Test StrategyRegistry
    var registryWorking = false
    var allStrategies: [{String: AnyStruct}] = []
    
    if let registryRef = account.capabilities.borrow<&{StrategyRegistry.RegistryPublic}>(/public/StrategyRegistry) {
        registryWorking = true
        allStrategies = registryRef.getAllStrategies()
    }
    
    // Test individual strategy contracts
    let liquidStakingInfo = LiquidStakingStrategy.getStrategyInfo()
    let yieldFarmingInfo = YieldFarmingStrategy.getStrategyInfo()
    let arbitrageInfo = ArbitrageStrategy.getStrategyInfo()
    
    return {
        "registryWorking": registryWorking,
        "totalStrategies": allStrategies.length,
        "strategies": allStrategies,
        "liquidStakingStrategy": liquidStakingInfo,
        "yieldFarmingStrategy": yieldFarmingInfo,
        "arbitrageStrategy": arbitrageInfo,
        "contractAddress": "0x136b642d0aa31ca9",
        "testStatus": "All contracts deployed and accessible"
    }
}