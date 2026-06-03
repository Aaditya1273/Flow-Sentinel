import Test
import BlockchainHelpers
import "SentinelInterfaces"
import "YieldOracle"
import "MultiSigAdmin"
import "LiquidStakingStrategy"
import "YieldFarmingStrategy"
import "ArbitrageStrategy"

// ============================================================
// Strategy Contract Tests — Oracle-Powered APY Compliance
// ============================================================

access(all) fun setup() {
    // Deploy interfaces first
    let err1 = Test.deployContract(name: "SentinelInterfaces", path: "../contracts/SentinelInterfaces.cdc", arguments: [])
    Test.expect(err1, Test.beNil())

    // YieldOracle must be deployed BEFORE strategies (they import it for real APY)
    let err2 = Test.deployContract(name: "YieldOracle", path: "../contracts/YieldOracle.cdc", arguments: [])
    Test.expect(err2, Test.beNil())

    // MultiSigAdmin (needed by vault, but not directly by strategies)
    let err3 = Test.deployContract(name: "MultiSigAdmin", path: "../contracts/MultiSigAdmin.cdc", arguments: [])
    Test.expect(err3, Test.beNil())

    // Oracle-powered strategy contracts
    let err4 = Test.deployContract(name: "LiquidStakingStrategy", path: "../contracts/strategies/LiquidStakingStrategy.cdc", arguments: [])
    Test.expect(err4, Test.beNil())

    let err5 = Test.deployContract(name: "YieldFarmingStrategy", path: "../contracts/strategies/YieldFarmingStrategy.cdc", arguments: [])
    Test.expect(err5, Test.beNil())

    let err6 = Test.deployContract(name: "ArbitrageStrategy", path: "../contracts/strategies/ArbitrageStrategy.cdc", arguments: [])
    Test.expect(err6, Test.beNil())
}

// ============================================================
// Oracle Tests
// ============================================================

access(all) fun testOracleInitializesWithAPYData() {
    let script = "import YieldOracle from 0x0000000000000002\n"
        .concat("access(all) fun main(): {String: YieldOracle.YieldData} {\n")
        .concat("    return YieldOracle.readAllAPYs()\n")
        .concat("}")
    let result = Test.executeScript(script, [])
    Test.expect(result, Test.beSucceeded())
    let data = result.returnValue! as! {String: AnyStruct}
    Test.assert(data.length >= 3, message: "Oracle should have at least 3 strategy APYs")
}

access(all) fun testOracleGetLiquidStakingAPY() {
    let script = "import YieldOracle from 0x0000000000000002\n"
        .concat("access(all) fun main(): UFix64? {\n")
        .concat("    return YieldOracle.readAPY(\"liquid-staking-pro\")\n")
        .concat("}")
    let result = Test.executeScript(script, [])
    Test.expect(result, Test.beSucceeded())
    let apy = result.returnValue! as! UFix64?
    Test.assert(apy != nil, message: "Liquid staking APY should exist")
    Test.assertEqual(6.5, apy!, message: "Liquid staking APY should be 6.5%")
}

// ============================================================
// LiquidStakingStrategy Tests
// ============================================================

access(all) fun testLiquidStakingCreateExecutor() {
    let executor <- LiquidStakingStrategy.createExecutor()

    let info = executor.getStrategyInfo()
    Test.assertEqual("liquid-staking-pro", info["id"] as! String)
    Test.assertEqual("Flow Liquid Staking Pro", info["name"] as! String)
    Test.assertEqual(1, executor.getRiskLevel(), message: "Liquid Staking should be low risk")

    // APY comes from oracle (initialized at 6.5%)
    let expectedAPY = info["expectedAPY"] as! UFix64
    Test.assertEqual(6.5, expectedAPY, message: "APY should match oracle data")

    // Expected yield = amount * (apy / 365 / 100)
    let expectedYield = executor.getExpectedYield(amount: 1000.0)
    let dailyRate = 6.5 / 365.0 / 100.0
    Test.assertEqual(1000.0 * dailyRate, expectedYield)

    destroy executor
}

access(all) fun testLiquidStakingExecuteStrategy() {
    let executor <- LiquidStakingStrategy.createExecutor()

    let yield = executor.executeStrategy(vaultBalance: 10000.0)
    Test.assert(yield > 0.0, message: "Liquid staking should generate positive yield")
    Test.assert(yield < 1000.0, message: "Yield should be reasonable (< 10% of balance)")

    destroy executor
}

// ============================================================
// YieldFarmingStrategy Tests
// ============================================================

access(all) fun testYieldFarmingCreateExecutor() {
    let executor <- YieldFarmingStrategy.createExecutor()

    let info = executor.getStrategyInfo()
    Test.assertEqual("defi-yield-maximizer", info["id"] as! String)
    Test.assertEqual(2, executor.getRiskLevel(), message: "Yield Farming should be medium risk")

    // APY comes from oracle (initialized at 8.2%)
    let expectedAPY = info["expectedAPY"] as! UFix64
    Test.assertEqual(8.2, expectedAPY, message: "APY should match oracle data")

    let expectedYield = executor.getExpectedYield(amount: 1000.0)
    let dailyRate = 8.2 / 365.0 / 100.0
    Test.assertEqual(1000.0 * dailyRate, expectedYield)

    destroy executor
}

access(all) fun testYieldFarmingExecuteStrategy() {
    let executor <- YieldFarmingStrategy.createExecutor()

    let yield = executor.executeStrategy(vaultBalance: 5000.0)
    Test.assert(yield > 0.0, message: "Yield farming should generate positive yield")

    destroy executor
}

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

access(all) fun testArbitrageCreateExecutor() {
    let executor <- ArbitrageStrategy.createExecutor()

    let info = executor.getStrategyInfo()
    Test.assertEqual("arbitrage-hunter", info["id"] as! String)
    Test.assertEqual(2, executor.getRiskLevel(), message: "Arbitrage should be medium risk")

    // APY comes from oracle (initialized at 5.8%)
    let expectedAPY = info["expectedAPY"] as! UFix64
    Test.assertEqual(5.8, expectedAPY, message: "APY should match oracle data")

    destroy executor
}

access(all) fun testArbitrageExecuteStrategy() {
    let executor <- ArbitrageStrategy.createExecutor()

    let yield = executor.executeStrategy(vaultBalance: 10000.0)
    Test.assert(yield >= 0.0, message: "Arbitrage yield should be non-negative")

    destroy executor
}

access(all) fun testArbitrageOpportunityDetection() {
    let executor <- ArbitrageStrategy.createExecutor()

    let yield = executor.executeStrategy(vaultBalance: 50000.0)
    Test.assert(yield >= 0.0, message: "Should not return negative yield")
    Test.assert(yield < 5000.0, message: "Yield should be < 10% of balance")

    destroy executor
}

// ============================================================
// Cross-Strategy Tests
// ============================================================

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
