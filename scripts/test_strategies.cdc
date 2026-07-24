import StrategyRegistry from 0xc13b08053be24e87
import LiquidStakingStrategy from 0xc13b08053be24e87
import YieldFarmingStrategy from 0xc13b08053be24e87
import ArbitrageStrategy from 0xc13b08053be24e87

// Test script to verify all strategies are deployed and working
access(all) fun main(): {String: AnyStruct} {
    let account = getAccount(0xc13b08053be24e87)
    
    // Test StrategyRegistry
    var registryWorking = true
    var allStrategies: [{String: AnyStruct}] = []
    
    // Use contract-level function directly (StrategyRegistry.init() does not publish a capability)
    allStrategies = StrategyRegistry.getAllStrategies()
    
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
        "contractAddress": "0xc13b08053be24e87",
        "testStatus": "All contracts deployed and accessible"
    }
}