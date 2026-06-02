import Test
import BlockchainHelpers
import "SentinelVaultFinal"
import "SentinelInterfaces"
import "LiquidStakingStrategy"
import "YieldFarmingStrategy"
import "ArbitrageStrategy"
import "StrategyRegistry"
import "FlowToken"
import "FungibleToken"

// ============================================================
// SentinelVaultFinal (V2) — Comprehensive Test Suite
// Uses V2 transactions and inline scripts for Cadence 1.0 compat
// ============================================================

access(all) fun setup() {
    // Deploy dependencies in order
    let e1 = Test.deployContract(name: "SentinelInterfaces", path: "../contracts/SentinelInterfaces.cdc", arguments: [])
    Test.expect(e1, Test.beNil())

    let e2 = Test.deployContract(name: "LiquidStakingStrategy", path: "../contracts/strategies/LiquidStakingStrategy.cdc", arguments: [])
    Test.expect(e2, Test.beNil())

    let e3 = Test.deployContract(name: "YieldFarmingStrategy", path: "../contracts/strategies/YieldFarmingStrategy.cdc", arguments: [])
    Test.expect(e3, Test.beNil())

    let e4 = Test.deployContract(name: "ArbitrageStrategy", path: "../contracts/strategies/ArbitrageStrategy.cdc", arguments: [])
    Test.expect(e4, Test.beNil())

    let e5 = Test.deployContract(name: "StrategyRegistry", path: "../contracts/StrategyRegistry.cdc", arguments: [])
    Test.expect(e5, Test.beNil())

    let e6 = Test.deployContract(name: "SentinelVaultFinal", path: "../contracts/SentinelVaultV2.cdc", arguments: [])
    Test.expect(e6, Test.beNil())
}

// ============================================================
// Test: Create vault with strategy
// ============================================================
access(all) fun testCreateVault() {
    let user = Test.getAccount(0x0000000000000007)

    let setupResult = Test.executeTransaction(
        "../transactions/init_sentinel_v2.cdc",
        ["liquid-staking-pro"],
        user
    )
    Test.expect(setupResult, Test.beSucceeded())
}

// ============================================================
// Test: Check StrategyRegistry has strategies
// ============================================================
access(all) fun testStrategyRegistryHasStrategies() {
    let script = "\
        import StrategyRegistry from 0x0000000000000005\n\
        access(all) fun main(): [{String: AnyStruct}] {\n\
            return StrategyRegistry.getAllStrategies()\n\
        }"
    let result = Test.executeScript(script, [])
    Test.expect(result, Test.beSucceeded())
    let strategies = result.returnValue! as! [{String: AnyStruct}]
    Test.assert(strategies.length >= 3, message: "Should have at least 3 pre-registered strategies")
}

// ============================================================
// Test: Get yield reserve balance
// ============================================================
access(all) fun testYieldReserveExists() {
    let script = "\
        import SentinelVaultFinal from 0x0000000000000006\n\
        access(all) fun main(): UFix64 {\n\
            return SentinelVaultFinal.getYieldReserveBalance()\n\
        }"
    let result = Test.executeScript(script, [])
    Test.expect(result, Test.beSucceeded())
    // Reserve starts at 0, but the contract is deployed
    Test.assertEqual(0.0, result.returnValue! as! UFix64)
}

// ============================================================
// Test: Fund yield reserve
// ============================================================
access(all) fun testFundYieldReserve() {
    let admin = Test.getAccount(0x0000000000000007)

    // Admin (who has FLOW from default setup) funds the yield reserve
    let fundResult = Test.executeTransaction(
        "../transactions/fund_yield_reserve.cdc",
        [1000.0],
        admin
    )
    Test.expect(fundResult, Test.beSucceeded())

    // Verify reserve increased
    let script = "\
        import SentinelVaultFinal from 0x0000000000000006\n\
        access(all) fun main(): UFix64 {\n\
            return SentinelVaultFinal.getYieldReserveBalance()\n\
        }"
    let result = Test.executeScript(script, [])
    Test.expect(result, Test.beSucceeded())
    Test.assertEqual(1000.0, result.returnValue! as! UFix64)
}

// ============================================================
// Test: Get total vaults and TVL
// ============================================================
access(all) fun testGlobalState() {
    let script = "\
        import SentinelVaultFinal from 0x0000000000000006\n\
        access(all) fun main(): {String: AnyStruct} {\n\
            return {\n\
                \"totalVaults\": SentinelVaultFinal.getTotalVaults(),\n\
                \"totalValueLocked\": SentinelVaultFinal.getTotalValueLocked(),\n\
                \"totalYieldDistributed\": SentinelVaultFinal.getTotalYieldDistributed()\n\
            }\n\
        }"
    let result = Test.executeScript(script, [])
    Test.expect(result, Test.beSucceeded())
    let state = result.returnValue! as! {String: AnyStruct}
    Test.assert((state["totalVaults"]! as! UInt64) >= 0)
}

// ============================================================
// Test: Strategy executor basic compliance
// ============================================================
access(all) fun testStrategyExecutors() {
    let liqExec <- LiquidStakingStrategy.createExecutor()
    let yieldExec <- YieldFarmingStrategy.createExecutor()
    let arbExec <- ArbitrageStrategy.createExecutor()

    // All must have risk levels 1-3
    Test.assert(liqExec.getRiskLevel() >= 1 && liqExec.getRiskLevel() <= 3)
    Test.assert(yieldExec.getRiskLevel() >= 1 && yieldExec.getRiskLevel() <= 3)
    Test.assert(arbExec.getRiskLevel() >= 1 && arbExec.getRiskLevel() <= 3)

    // All must return non-negative expected yield
    Test.assert(liqExec.getExpectedYield(amount: 100.0) >= 0.0)
    Test.assert(yieldExec.getExpectedYield(amount: 100.0) >= 0.0)
    Test.assert(arbExec.getExpectedYield(amount: 100.0) >= 0.0)

    // Execute with sufficient balance
    let liqYield = liqExec.executeStrategy(vaultBalance: 1000.0)
    Test.assert(liqYield >= 0.0, message: "LiquidStaking yield should be non-negative")

    let yieldYield = yieldExec.executeStrategy(vaultBalance: 1000.0)
    Test.assert(yieldYield >= 0.0, message: "YieldFarming yield should be non-negative")

    let arbYield = arbExec.executeStrategy(vaultBalance: 1000.0)
    Test.assert(arbYield >= 0.0, message: "Arbitrage yield should be non-negative")

    destroy liqExec
    destroy yieldExec
    destroy arbExec
}

// ============================================================
// Test: LiquidStaking specific yield values
// ============================================================
access(all) fun testLiquidStakingYield() {
    let exec <- LiquidStakingStrategy.createExecutor()

    let yield = exec.executeStrategy(vaultBalance: 10000.0)
    Test.assert(yield > 0.0, message: "Liquid staking should generate positive yield")
    Test.assert(yield < 1000.0, message: "Yield should be < 10% of balance (not a scam)")

    destroy exec
}

// ============================================================
// Test: YieldFarming specific yield values
// ============================================================
access(all) fun testYieldFarmingYield() {
    let exec <- YieldFarmingStrategy.createExecutor()

    let yield = exec.executeStrategy(vaultBalance: 5000.0)
    Test.assert(yield > 0.0, message: "Yield farming should generate positive yield")
    Test.assert(yield < 500.0, message: "Yield should be < 10% of balance")

    destroy exec
}

// ============================================================
// Test: All strategies have correct IDs and info
// ============================================================
access(all) fun testStrategyInfo() {
    let liqExec <- LiquidStakingStrategy.createExecutor()
    let yieldExec <- YieldFarmingStrategy.createExecutor()
    let arbExec <- ArbitrageStrategy.createExecutor()

    let liqInfo = liqExec.getStrategyInfo()
    let yieldInfo = yieldExec.getStrategyInfo()
    let arbInfo = arbExec.getStrategyInfo()

    Test.assertEqual("liquid-staking-pro", liqInfo["id"] as! String)
    Test.assertEqual("defi-yield-maximizer", yieldInfo["id"] as! String)
    Test.assertEqual("arbitrage-hunter", arbInfo["id"] as! String)

    destroy liqExec
    destroy yieldExec
    destroy arbExec
}
