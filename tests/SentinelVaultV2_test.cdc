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
// ============================================================
// To run: flow test tests/SentinelVaultV2_test.cdc
// ============================================================

access(all) fun setup() {
    // Deploy all required contracts (order matters: interfaces first, then strategies, then vault)
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

    let err5 = Test.deployContract(
        name: "StrategyRegistry",
        path: "../contracts/StrategyRegistry.cdc",
        arguments: []
    )
    Test.expect(err5, Test.beNil())

    let err6 = Test.deployContract(
        name: "SentinelVaultFinal",
        path: "../contracts/SentinelVaultV2.cdc",
        arguments: []
    )
    Test.expect(err6, Test.beNil())
}

// ============================================================
// Test: Create a vault with default strategy
// ============================================================
access(all) fun testCreateVault() {
    let user = Test.getAccount(0x0000000000000007)

    // Setup: create collection + vault
    let setupResult = Test.executeTransaction(
        "../transactions/init_sentinel.cdc",
        [],
        user
    )
    Test.expect(setupResult, Test.beSucceeded())

    // Verify vault exists
    let scriptResult = Test.executeScript(
        "../scripts/get_vault_info.cdc",
        [user.address]
    )
    Test.expect(scriptResult, Test.beSucceeded())

    let result = scriptResult.returnValue! as! {String: AnyStruct}
    Test.assertEqual(true, result["hasVault"]! as! Bool)
    Test.assertEqual(0.0, result["balance"]! as! UFix64)
    Test.assertEqual("Active", result["status"]! as! String)
}

// ============================================================
// Test: Deposit FLOW into vault
// ============================================================
access(all) fun testDepositFlow() {
    let user = Test.getAccount(0x0000000000000007)

    // Create vault first
    let createResult = Test.executeTransaction(
        "../transactions/init_sentinel.cdc",
        [],
        user
    )
    Test.expect(createResult, Test.beSucceeded())

    // Deposit 100 FLOW
    let depositResult = Test.executeTransaction(
        "../transactions/deposit_flow.cdc",
        [100.0],
        user
    )
    Test.expect(depositResult, Test.beSucceeded())

    // Verify balance increased
    let scriptResult = Test.executeScript(
        "../scripts/get_vault_info.cdc",
        [user.address]
    )
    Test.expect(scriptResult, Test.beSucceeded())

    let result = scriptResult.returnValue! as! {String: AnyStruct}
    Test.assertEqual(100.0, result["balance"]! as! UFix64)
}

// ============================================================
// Test: Withdraw FLOW from vault
// ============================================================
access(all) fun testWithdrawFlow() {
    let user = Test.getAccount(0x0000000000000007)

    // Create vault + deposit 100
    Test.executeTransaction("../transactions/init_sentinel.cdc", [], user)
    Test.executeTransaction("../transactions/deposit_flow.cdc", [100.0], user)

    // Withdraw 40 FLOW
    let withdrawResult = Test.executeTransaction(
        "../transactions/withdraw_flow.cdc",
        [40.0],
        user
    )
    Test.expect(withdrawResult, Test.beSucceeded())

    // Verify balance decreased
    let scriptResult = Test.executeScript(
        "../scripts/get_vault_info.cdc",
        [user.address]
    )
    Test.expect(scriptResult, Test.beSucceeded())

    let result = scriptResult.returnValue! as! {String: AnyStruct}
    Test.assertEqual(60.0, result["balance"]! as! UFix64)
}

// ============================================================
// Test: Emergency pause and resume vault
// ============================================================
access(all) fun testEmergencyPauseAndResume() {
    let user = Test.getAccount(0x0000000000000007)

    // Setup vault
    Test.executeTransaction("../transactions/init_sentinel.cdc", [], user)
    Test.executeTransaction("../transactions/deposit_flow.cdc", [100.0], user)

    // Emergency pause
    let pauseResult = Test.executeTransaction(
        "../transactions/emergency_pause.cdc",
        [0], // vaultId = 0 (first vault)
        user
    )
    Test.expect(pauseResult, Test.beSucceeded())

    // Verify vault is paused
    let scriptResult = Test.executeScript(
        "../scripts/get_vault_info.cdc",
        [user.address]
    )
    Test.expect(scriptResult, Test.beSucceeded())

    let result = scriptResult.returnValue! as! {String: AnyStruct}
    Test.assertEqual("Paused", result["status"]! as! String)
    Test.assertEqual(false, result["isActive"]! as! Bool)

    // Deposit should FAIL when vault is paused
    let depositResult = Test.executeTransaction(
        "../transactions/deposit_flow.cdc",
        [50.0],
        user
    )
    Test.expect(depositResult, Test.beFailed())

    // Resume vault
    let resumeResult = Test.executeTransaction(
        "../transactions/resume_vault.cdc",
        [0],
        user
    )
    Test.expect(resumeResult, Test.beSucceeded())

    // Verify vault is active again
    let scriptResult2 = Test.executeScript(
        "../scripts/get_vault_info.cdc",
        [user.address]
    )
    Test.expect(scriptResult2, Test.beSucceeded())

    let result2 = scriptResult2.returnValue! as! {String: AnyStruct}
    Test.assertEqual("Active", result2["status"]! as! String)
    Test.assertEqual(true, result2["isActive"]! as! Bool)

    // Deposit should now SUCCEED
    let depositResult2 = Test.executeTransaction(
        "../transactions/deposit_flow.cdc",
        [50.0],
        user
    )
    Test.expect(depositResult2, Test.beSucceeded())
}

// ============================================================
// Test: Perform strategy execution
// ============================================================
access(all) fun testPerformStrategy() {
    let user = Test.getAccount(0x0000000000000007)

    // Setup vault with balance
    Test.executeTransaction("../transactions/init_sentinel.cdc", [], user)
    Test.executeTransaction("../transactions/deposit_flow.cdc", [1000.0], user)

    // Trigger strategy execution via LiquidStaking executor
    // Note: This requires the TRIGGER_STRATEGY transaction which imports the executor contracts
    let strategyResult = Test.executeTransaction(
        "../transactions/trigger_strategy_v2.cdc",
        [0, "liquid-staking-pro"],
        user
    )
    Test.expect(strategyResult, Test.beSucceeded())

    // Verify strategy was executed (lastExecution should be set)
    let scriptResult = Test.executeScript(
        "../scripts/get_vault_info.cdc",
        [user.address]
    )
    Test.expect(scriptResult, Test.beSucceeded())

    let result = scriptResult.returnValue! as! {String: AnyStruct}
    Test.assertEqual(true, result["hasLastExecution"]! as! Bool)
}

// ============================================================
// Test: Fund yield reserve and claim yield
// ============================================================
access(all) fun testClaimYield() {
    let admin = Test.getAccount(0x0000000000000007)
    let user = Test.getAccount(0x0000000000000008)

    // Setup vault for user
    Test.executeTransaction("../transactions/init_sentinel.cdc", [], user)
    Test.executeTransaction("../transactions/deposit_flow.cdc", [1000.0], user)

    // Admin funds the yield reserve
    let fundResult = Test.executeTransaction(
        "../transactions/fund_yield_reserve.cdc",
        [1000.0], // Fund with 1000 FLOW
        admin
    )
    Test.expect(fundResult, Test.beSucceeded())

    // Verify yield reserve balance
    let reserveScript = Test.executeScript(`
        import SentinelVaultFinal from 0x0000000000000001
        access(all) fun main(): UFix64 {
            return SentinelVaultFinal.getYieldReserveBalance()
        }
    `, [])
    Test.expect(reserveScript, Test.beSucceeded())
    Test.assertEqual(1000.0, reserveScript.returnValue! as! UFix64)

    // Execute strategy to accrue yield
    Test.executeTransaction(
        "../transactions/trigger_strategy_v2.cdc",
        [0, "liquid-staking-pro"],
        user
    )

    // Check that yield was accrued
    let vaultScript = Test.executeScript(
        "../scripts/get_vault_info.cdc",
        [user.address]
    )
    Test.expect(vaultScript, Test.beSucceeded())
    let vaultInfo = vaultScript.returnValue! as! {String: AnyStruct}
    let yieldAccrued = vaultInfo["totalYieldAccrued"] as! UFix64
    Test.assert(yieldAccrued > 0.0, message: "Yield should have been accrued after strategy execution")

    // Claim yield
    let claimResult = Test.executeTransaction(
        "../transactions/claim_yield.cdc",
        [0], // vaultId = 0
        user
    )
    Test.expect(claimResult, Test.beSucceeded())

    // Verify yield was claimed (totalYieldAccrued should be 0)
    let vaultScript2 = Test.executeScript(
        "../scripts/get_vault_info.cdc",
        [user.address]
    )
    Test.expect(vaultScript2, Test.beSucceeded())
    let vaultInfo2 = vaultScript2.returnValue! as! {String: AnyStruct}
    let yieldAfter = vaultInfo2["totalYieldAccrued"] as! UFix64
    Test.assertEqual(0.0, yieldAfter, message: "Yield should be reset to 0 after claim")
}

// ============================================================
// Test: Create multiple vaults for same user
// ============================================================
access(all) fun testMultipleVaults() {
    let user = Test.getAccount(0x0000000000000007)

    // Create first vault with LiquidStaking
    Test.executeTransaction("../transactions/init_sentinel.cdc", [], user)

    // Create second vault with YieldFarming
    Test.executeTransaction("../transactions/init_sentinel_v2.cdc", ["defi-yield-maximizer"], user)

    // Verify both vaults exist
    let scriptResult = Test.executeScript(`
        import SentinelVaultFinal from 0x0000000000000001

        access(all) fun main(address: Address): [SentinelVaultFinal.VaultInfo] {
            let account = getAccount(address)
            if let collectionRef = account.capabilities.borrow<&{SentinelVaultFinal.CollectionPublic}>(
                SentinelVaultFinal.VaultCollectionPublicPath
            ) {
                return collectionRef.getVaultInfos()
            }
            return []
        }
    `, [user.address])
    Test.expect(scriptResult, Test.beSucceeded())

    let infos = scriptResult.returnValue! as! [SentinelVaultFinal.VaultInfo]
    Test.assertEqual(2, infos.length, message: "User should have 2 vaults")

    // Verify different strategies
    Test.assertEqual("Liquid Staking Pro", infos[0].strategy)
    Test.assertEqual("DeFi Yield Maximizer", infos[1].strategy)
}

// ============================================================
// Test: Edge case — deposit 0 should fail or be a no-op
// ============================================================
access(all) fun testZeroDeposit() {
    let user = Test.getAccount(0x0000000000000007)

    Test.executeTransaction("../transactions/init_sentinel.cdc", [], user)

    // Deposit 0 FLOW
    let depositResult = Test.executeTransaction(
        "../transactions/deposit_flow.cdc",
        [0.0],
        user
    )
    // This should fail — FungibleToken disallows zero-value withdrawals
    Test.expect(depositResult, Test.beFailed())
}

// ============================================================
// Test: Edge case — withdraw more than balance should fail
// ============================================================
access(all) fun testWithdrawTooMuch() {
    let user = Test.getAccount(0x0000000000000007)

    Test.executeTransaction("../transactions/init_sentinel.cdc", [], user)
    Test.executeTransaction("../transactions/deposit_flow.cdc", [100.0], user)

    // Try to withdraw 200 FLOW (only 100 available)
    let withdrawResult = Test.executeTransaction(
        "../transactions/withdraw_flow.cdc",
        [200.0],
        user
    )
    Test.expect(withdrawResult, Test.beFailed())
}

// ============================================================
// Test: Strategy execution on empty vault should be a no-op
// ============================================================
access(all) fun testStrategyOnEmptyVault() {
    let user = Test.getAccount(0x0000000000000007)

    // Create vault WITHOUT depositing
    Test.executeTransaction("../transactions/init_sentinel.cdc", [], user)

    // Trigger strategy on empty vault — should be a no-op (no crash)
    let strategyResult = Test.executeTransaction(
        "../transactions/trigger_strategy_v2.cdc",
        [0, "liquid-staking-pro"],
        user
    )
    Test.expect(strategyResult, Test.beSucceeded())

    // Verify no yield was generated
    let scriptResult = Test.executeScript(
        "../scripts/get_vault_info.cdc",
        [user.address]
    )
    Test.expect(scriptResult, Test.beSucceeded())

    let result = scriptResult.returnValue! as! {String: AnyStruct}
    Test.assertEqual(0.0, result["totalYieldAccrued"]! as! UFix64)
}

// ============================================================
// Test: Claim yield with insufficient reserve should fail
// ============================================================
access(all) fun testClaimYieldWithoutReserve() {
    let user = Test.getAccount(0x0000000000000007)

    // Setup vault
    Test.executeTransaction("../transactions/init_sentinel.cdc", [], user)
    Test.executeTransaction("../transactions/deposit_flow.cdc", [1000.0], user)

    // Execute strategy (accrues yield but reserve is 0)
    Test.executeTransaction(
        "../transactions/trigger_strategy_v2.cdc",
        [0, "liquid-staking-pro"],
        user
    )

    // Try to claim — should fail because yield reserve is empty
    let claimResult = Test.executeTransaction(
        "../transactions/claim_yield.cdc",
        [0],
        user
    )
    // Note: Some yield may be 0 if strategy returns 0 on empty reserve
    // This test verifies the pre-condition check works
    // If yield is 0, claim will fail with "No yield to claim"
    // If yield > 0 but reserve is 0, claim will fail with "Yield reserve insufficient"
    // Both are valid error paths
    Test.expect(claimResult, Test.beFailed())
}
