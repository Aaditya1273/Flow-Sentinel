import Test
import SentinelInterfaces from 0xf8d6e0586b0a20c7
import YieldOracle from 0xf8d6e0586b0a20c7
import MultiSigAdmin from 0xf8d6e0586b0a20c7
import LiquidStakingStrategy from 0xf8d6e0586b0a20c7
import YieldFarmingStrategy from 0xf8d6e0586b0a20c7
import ArbitrageStrategy from 0xf8d6e0586b0a20c7

// ============================================================
// Strategy Contract Tests — Oracle-Powered APY Compliance
// All contracts deploy to the default emulator account.
// ============================================================

access(all) fun setup() {
    let deployer = Test.getAccount(0xf8d6e0586b0a20c7)

    let err1 = Test.deployContract(name: "SentinelInterfaces", path: "../contracts/SentinelInterfaces.cdc", arguments: [], signer: deployer)
    Test.expect(err1, Test.beSuccessful())

    let err2 = Test.deployContract(name: "YieldOracle", path: "../contracts/YieldOracle.cdc", arguments: [], signer: deployer)
    Test.expect(err2, Test.beSuccessful())

    let err3 = Test.deployContract(name: "MultiSigAdmin", path: "../contracts/MultiSigAdmin.cdc", arguments: [], signer: deployer)
    Test.expect(err3, Test.beSuccessful())

    let err4 = Test.deployContract(name: "LiquidStakingStrategy", path: "../contracts/strategies/LiquidStakingStrategy.cdc", arguments: [], signer: deployer)
    Test.expect(err4, Test.beSuccessful())

    let err5 = Test.deployContract(name: "YieldFarmingStrategy", path: "../contracts/strategies/YieldFarmingStrategy.cdc", arguments: [], signer: deployer)
    Test.expect(err5, Test.beSuccessful())

    let err6 = Test.deployContract(name: "ArbitrageStrategy", path: "../contracts/strategies/ArbitrageStrategy.cdc", arguments: [], signer: deployer)
    Test.expect(err6, Test.beSuccessful())
}

// ============================================================
// Oracle Tests
// ============================================================

access(all) fun testOracleInitializesWithAPYData() {
    let result = Test.executeScript(Test.Script(
        code: """
            import YieldOracle from 0xf8d6e0586b0a20c7

            access(all) fun main(): {String: AnyStruct} {
                return YieldOracle.readAllAPYs()
            }
        """,
        arguments: []
    ))
    Test.expect(result, Test.beSuccessful())
}

// ============================================================
// LiquidStakingStrategy Tests
// ============================================================

access(all) fun testLiquidStakingCreateExecutor() {
    let result = Test.executeScript(Test.Script(
        code: """
            import LiquidStakingStrategy from 0xf8d6e0586b0a20c7

            access(all) fun main(): UFix64 {
                let executor <- LiquidStakingStrategy.createExecutor()
                let expectedYield = executor.getExpectedYield(amount: 1000.0)
                destroy executor
                return expectedYield
            }
        """,
        arguments: []
    ))
    Test.expect(result, Test.beSuccessful())
}

access(all) fun testLiquidStakingExecuteStrategy() {
    let result = Test.executeScript(Test.Script(
        code: """
            import LiquidStakingStrategy from 0xf8d6e0586b0a20c7

            access(all) fun main(): UFix64 {
                let executor <- LiquidStakingStrategy.createExecutor()
                let yield = executor.executeStrategy(vaultBalance: 10000.0)
                destroy executor
                assert(yield > 0.0, message: "Liquid staking should generate positive yield")
                assert(yield < 1000.0, message: "Yield should be reasonable (< 10% of balance)")
                return yield
            }
        """,
        arguments: []
    ))
    Test.expect(result, Test.beSuccessful())
}

// ============================================================
// YieldFarmingStrategy Tests
// ============================================================

access(all) fun testYieldFarmingCreateExecutor() {
    let result = Test.executeScript(Test.Script(
        code: """
            import YieldFarmingStrategy from 0xf8d6e0586b0a20c7
            import YieldOracle from 0xf8d6e0586b0a20c7

            access(all) fun main(): UFix64 {
                let executor <- YieldFarmingStrategy.createExecutor()
                let expectedYield = executor.getExpectedYield(amount: 1000.0)
                destroy executor
                return expectedYield
            }
        """,
        arguments: []
    ))
    Test.expect(result, Test.beSuccessful())
}

access(all) fun testYieldFarmingExecuteStrategy() {
    let result = Test.executeScript(Test.Script(
        code: """
            import YieldFarmingStrategy from 0xf8d6e0586b0a20c7

            access(all) fun main(): UFix64 {
                let executor <- YieldFarmingStrategy.createExecutor()
                let yield = executor.executeStrategy(vaultBalance: 5000.0)
                destroy executor
                assert(yield > 0.0, message: "Yield farming should generate positive yield")
                return yield
            }
        """,
        arguments: []
    ))
    Test.expect(result, Test.beSuccessful())
}

// ============================================================
// ArbitrageStrategy Tests
// ============================================================

access(all) fun testArbitrageCreateExecutor() {
    let result = Test.executeScript(Test.Script(
        code: """
            import ArbitrageStrategy from 0xf8d6e0586b0a20c7

            access(all) fun main(): UFix64 {
                let executor <- ArbitrageStrategy.createExecutor()
                let expectedYield = executor.getExpectedYield(amount: 1000.0)
                destroy executor
                return expectedYield
            }
        """,
        arguments: []
    ))
    Test.expect(result, Test.beSuccessful())
}

access(all) fun testArbitrageExecuteStrategy() {
    let result = Test.executeScript(Test.Script(
        code: """
            import ArbitrageStrategy from 0xf8d6e0586b0a20c7

            access(all) fun main(): UFix64 {
                let executor <- ArbitrageStrategy.createExecutor()
                let yield = executor.executeStrategy(vaultBalance: 10000.0)
                destroy executor
                assert(yield >= 0.0, message: "Arbitrage yield should be non-negative")
                return yield
            }
        """,
        arguments: []
    ))
    Test.expect(result, Test.beSuccessful())
}

// ============================================================
// Cross-Strategy Tests
// ============================================================

access(all) fun testAllStrategiesImplementInterface() {
    let result = Test.executeScript(Test.Script(
        code: """
            import LiquidStakingStrategy from 0xf8d6e0586b0a20c7
            import YieldFarmingStrategy from 0xf8d6e0586b0a20c7
            import ArbitrageStrategy from 0xf8d6e0586b0a20c7

            access(all) fun main(): Bool {
                let liquidExecutor <- LiquidStakingStrategy.createExecutor()
                let yieldExecutor <- YieldFarmingStrategy.createExecutor()
                let arbExecutor <- ArbitrageStrategy.createExecutor()

                assert(liquidExecutor.getRiskLevel() >= 1 && liquidExecutor.getRiskLevel() <= 3, message: "Risk level invalid")
                assert(yieldExecutor.getRiskLevel() >= 1 && yieldExecutor.getRiskLevel() <= 3, message: "Risk level invalid")
                assert(arbExecutor.getRiskLevel() >= 1 && arbExecutor.getRiskLevel() <= 3, message: "Risk level invalid")

                let liqExpectedSmall = liquidExecutor.getExpectedYield(amount: 100.0)
                let liqExpectedLarge = liquidExecutor.getExpectedYield(amount: 1000.0)
                assert(liqExpectedLarge == liqExpectedSmall * 10.0, message: "Expected yield should be proportional")

                destroy liquidExecutor
                destroy yieldExecutor
                destroy arbExecutor
                return true
            }
        """,
        arguments: []
    ))
    Test.expect(result, Test.beSuccessful())
}
