import Test
import BlockchainHelpers
import "SentinelInterfaces"
import "LiquidStakingStrategy"
import "YieldFarmingStrategy"
import "ArbitrageStrategy"
import "FlowToken"

// ============================================================
// Strategy Contract Tests — SentinelInterfaces compliance
// ============================================================

access(all) fun setup() {
    let err1 = Test.deployContract(
        name: "SentinelInterfaces",
        path: "../contracts/SentinelInterfaces.cdc",
        arguments: []
    )
    Test.expect(err1, Test.beNil())

    let err2 = Test.deployContract(
        name: "LiquidStakingStrategy",
        path: "../contracts/strategies/LiquidStakingStrategy.cdc",
        arguments: []
    )
    Test.expect(err2, Test.beNil())

    let err3 = Test.deployContract(
        name: "YieldFarmingStrategy",
        path: "../contracts/strategies/YieldFarmingStrategy.cdc",
        arguments: []
    )
    Test.expect(err3, Test.beNil())

    let err4 = Test.deployContract(
        name: "ArbitrageStrategy",
        path: "../contracts/strategies/ArbitrageStrategy.cdc",
        arguments: []
    )
    Test.expect(err4, Test.beNil())
}

// ============================================================
// LiquidStakingStrategy Tests
// ============================================================

// Test: LiquidStaking executor creation and interface compliance
access(all) fun testLiquidStakingCreateExecutor() {
    let executor <- LiquidStakingStrategy.createExecutor()

    // Verify it implements IStrategy
    let info = executor.getStrategyInfo()
    Test.assertEqual("liquid-staking-pro", info["id"] as! String)
    Test.assertEqual("Flow Liquid Staking Pro", info["name"] as! String)
    Test.assertEqual(1, executor.getRiskLevel(), message: "Liquid Staking should be low risk")

    // Verify expected yield calculation
    let expectedYield = executor.getExpectedYield(amount: 1000.0)
    let dailyRate = 12.5 / 365.0 / 100.0
    Test.assertEqual(1000.0 * dailyRate, expectedYield)

    destroy executor
}

// Test: LiquidStaking strategy execution returns positive yield
access(all) fun testLiquidStakingExecuteStrategy() {
    let executor <- LiquidStakingStrategy.createExecutor()

    let yield = executor.executeStrategy(vaultBalance: 10000.0)
    Test.assert(yield > 0.0, message: "Liquid staking should generate positive yield")
    Test.assert(yield < 1000.0, message: "Yield should be reasonable (< 10% of balance)")

    destroy executor
}

// Test: LiquidStaking strategy with 0 balance returns 0 yield
access(all) fun testLiquidStakingZeroBalance() {
    let executor <- LiquidStakingStrategy.createExecutor()

    // executeStrategy with 0 balance should still work (pre-condition allows it)
    let yield = executor.executeStrategy(vaultBalance: 0.0)
    Test.assertEqual(0.0, yield, message: "Zero balance should generate zero yield")

    destroy executor
}

// ============================================================
// YieldFarmingStrategy Tests
// ============================================================

// Test: YieldFarming executor creation and interface compliance
access(all) fun testYieldFarmingCreateExecutor() {
    let executor <- YieldFarmingStrategy.createExecutor()

    let info = executor.getStrategyInfo()
    Test.assertEqual("defi-yield-maximizer", info["id"] as! String)
    Test.assertEqual(2, executor.getRiskLevel(), message: "Yield Farming should be medium risk")

    // Verify expected yield
    let expectedYield = executor.getExpectedYield(amount: 1000.0)
    let dailyRate = 24.8 / 365.0 / 100.0
    Test.assertEqual(1000.0 * dailyRate, expectedYield)

    destroy executor
}

// Test: YieldFarming strategy generates yield
access(all) fun testYieldFarmingExecuteStrategy() {
    let executor <- YieldFarmingStrategy.createExecutor()

    let yield = executor.executeStrategy(vaultBalance: 5000.0)
    Test.assert(yield > 0.0, message: "Yield farming should generate positive yield")

    destroy executor
}

// Test: YieldFarming minimum deposit enforcement
// Does NOT call executeStrategy directly — the pre-condition would panic.
// Instead, this test simply verifies the minDeposit config value is > 0.
access(all) fun testYieldFarmingMinimumDepositConfig() {
    let executor <- YieldFarmingStrategy.createExecutor()

    let info = executor.getStrategyInfo()
    let minDeposit = info["minDeposit"] as! UFix64
    Test.assert(minDeposit > 0.0, message: "Minimum deposit should be positive")
    Test.assertEqual(100.0, minDeposit, message: "Default min deposit should be 100 FLOW")

    destroy executor
}

// ============================================================
// ArbitrageStrategy Tests
// ============================================================

// Test: Arbitrage executor creation and interface compliance
access(all) fun testArbitrageCreateExecutor() {
    let executor <- ArbitrageStrategy.createExecutor()

    let info = executor.getStrategyInfo()
    Test.assertEqual("arbitrage-hunter", info["id"] as! String)
    Test.assertEqual(2, executor.getRiskLevel(), message: "Arbitrage should be medium risk")

    destroy executor
}

// Test: Arbitrage strategy generates yield
access(all) fun testArbitrageExecuteStrategy() {
    let executor <- ArbitrageStrategy.createExecutor()

    let yield = executor.executeStrategy(vaultBalance: 10000.0)
    Test.assert(yield >= 0.0, message: "Arbitrage yield should be non-negative")
    // Arbitrage can return 0 if no profitable opportunities found
    // This is valid behavior

    destroy executor
}

// Test: Arbitrage opportunity detection
access(all) fun testArbitrageOpportunityDetection() {
    let executor <- ArbitrageStrategy.createExecutor()

    let yield = executor.executeStrategy(vaultBalance: 50000.0)
    // With larger amounts, more opportunities may be profitable
    // Just verify no crash and result is reasonable
    Test.assert(yield >= 0.0, message: "Should not return negative yield")
    Test.assert(yield < 5000.0, message: "Yield should be < 10% of balance")

    destroy executor
}

// ============================================================
// Cross-Strategy Tests
// ============================================================

// Test: All strategies follow the IStrategy interface consistently
access(all) fun testAllStrategiesImplementInterface() {
    let liquidExecutor <- LiquidStakingStrategy.createExecutor()
    let yieldExecutor <- YieldFarmingStrategy.createExecutor()
    let arbExecutor <- ArbitrageStrategy.createExecutor()

    // All must have getRiskLevel 1-3
    Test.assert(liquidExecutor.getRiskLevel() >= 1 && liquidExecutor.getRiskLevel() <= 3)
    Test.assert(yieldExecutor.getRiskLevel() >= 1 && yieldExecutor.getRiskLevel() <= 3)
    Test.assert(arbExecutor.getRiskLevel() >= 1 && arbExecutor.getRiskLevel() <= 3)

    // All must return non-negative expected yield
    let liqExpected = liquidExecutor.getExpectedYield(amount: 100.0)
    let yieldExpected = yieldExecutor.getExpectedYield(amount: 100.0)
    let arbExpected = arbExecutor.getExpectedYield(amount: 100.0)

    Test.assert(liqExpected >= 0.0)
    Test.assert(yieldExpected >= 0.0)
    Test.assert(arbExpected >= 0.0)

    // Expected yield should be proportional to amount
    let liqExpectedLarge = liquidExecutor.getExpectedYield(amount: 1000.0)
    Test.assertEqual(liqExpected * 10.0, liqExpectedLarge)

    destroy liquidExecutor
    destroy yieldExecutor
    destroy arbExecutor
}
