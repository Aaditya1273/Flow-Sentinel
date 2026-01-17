import Test
import BlockchainHelpers
import "SentinelVault"
import "FlowToken"

access(all) fun setup() {
    let err = Test.deployContract(
        name: "SentinelVault",
        path: "../contracts/SentinelVault.cdc",
        arguments: []
    )
    Test.expect(err, Test.beNil())
}

access(all) fun testCreateVault() {
    let admin = Test.getAccount(0x0000000000000007)
    
    let txResult = Test.executeTransaction(
        "../transactions/init_sentinel.cdc",
        [],
        admin
    )
    Test.expect(txResult, Test.beSucceeded())
    
    // Verify vault was created
    let scriptResult = Test.executeScript(
        "../scripts/get_vault_info.cdc",
        [admin.address]
    )
    Test.expect(scriptResult, Test.beSucceeded())
    
    let result = scriptResult.returnValue! as! {String: AnyStruct}
    Test.assertEqual(true, result["hasVault"]! as! Bool)
    Test.assertEqual(0.0, result["balance"]! as! UFix64)
    Test.assertEqual("Active", result["status"]! as! String)
}

access(all) fun testDepositFlow() {
    let admin = Test.getAccount(0x0000000000000007)
    
    // First create vault
    let createResult = Test.executeTransaction(
        "../transactions/init_sentinel.cdc",
        [],
        admin
    )
    Test.expect(createResult, Test.beSucceeded())
    
    // Deposit 100 FLOW
    let depositResult = Test.executeTransaction(
        "../transactions/deposit_flow.cdc",
        [100.0],
        admin
    )
    Test.expect(depositResult, Test.beSucceeded())
    
    // Verify balance
    let scriptResult = Test.executeScript(
        "../scripts/get_vault_info.cdc",
        [admin.address]
    )
    Test.expect(scriptResult, Test.beSucceeded())
    
    let result = scriptResult.returnValue! as! {String: AnyStruct}
    Test.assertEqual(100.0, result["balance"]! as! UFix64)
}

access(all) fun testEmergencyPause() {
    let admin = Test.getAccount(0x0000000000000007)
    
    // Create vault and deposit
    Test.executeTransaction("../transactions/init_sentinel.cdc", [], admin)
    Test.executeTransaction("../transactions/deposit_flow.cdc", [100.0], admin)
    
    // Emergency pause
    let pauseResult = Test.executeTransaction(
        "../transactions/emergency_pause.cdc",
        [],
        admin
    )
    Test.expect(pauseResult, Test.beSucceeded())
    
    // Verify vault is paused
    let scriptResult = Test.executeScript(
        "../scripts/get_vault_info.cdc",
        [admin.address]
    )
    Test.expect(scriptResult, Test.beSucceeded())
    
    let result = scriptResult.returnValue! as! {String: AnyStruct}
    Test.assertEqual("Paused", result["status"]! as! String)
    Test.assertEqual(false, result["isActive"]! as! Bool)
}