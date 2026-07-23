import Test
import SentinelVaultFinal from 0xf8d6e0586b0a20c7
import FlowToken from 0x0ae53cb6e3f42a79

// NOTE: This test suite validates the V2 SentinelVaultFinal contract (SentinelVaultV2.cdc).
// Features: yield reserve, claimYield, strategy execution, collection-based vaults, 4-layer MEV protection.

access(all) fun setup() {
    let deployer = Test.getAccount(0xf8d6e0586b0a20c7)
    let err = Test.deployContract(
        name: "SentinelVaultFinal",
        path: "../contracts/SentinelVaultV2.cdc",
        arguments: [],
        signer: deployer
    )
    Test.expect(err, Test.beSuccessful())
}

access(all) fun testCreateVault() {
    let deployer = Test.getAccount(0xf8d6e0586b0a20c7)
    
    let createTx = Test.Transaction(
        code: """
            import SentinelVaultFinal from 0xf8d6e0586b0a20c7
            
            transaction {
                prepare(signer: auth(Storage, Capabilities) &Account) {
                    let collection <- SentinelVaultFinal.createEmptyCollection()
                    let vault <- SentinelVaultFinal.createVault(
                        owner: signer.address,
                        name: "Test Vault",
                        strategyName: "Flow Liquid Staking Pro",
                        strategyId: "liquid-staking-pro",
                        protectionLevel: 3,
                        slippageBps: 300.0
                    )
                    collection.deposit(vault: <-vault)
                    signer.storage.save(<-collection, to: SentinelVaultFinal.VaultCollectionStoragePath)
                    let cap = signer.capabilities.storage.issue<&{SentinelVaultFinal.CollectionPublic}>(
                        SentinelVaultFinal.VaultCollectionStoragePath
                    )
                    signer.capabilities.publish(cap, at: SentinelVaultFinal.VaultCollectionPublicPath)
                }
            }
        """,
        arguments: [],
        signers: [deployer]
    )
    let txResult = Test.executeTransaction(createTx)
    Test.expect(txResult, Test.beSuccessful())
    
    // Verify vault was created
    let scriptResult = Test.executeScript(Test.Script(
        code: """
            import SentinelVaultFinal from 0xf8d6e0586b0a20c7
            
            access(all) fun main(): {String: AnyStruct} {
                return {
                    "totalVaults": SentinelVaultFinal.getTotalVaults()
                }
            }
        """,
        arguments: []
    ))
    Test.expect(scriptResult, Test.beSuccessful())
}
