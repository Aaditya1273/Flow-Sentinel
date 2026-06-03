import SentinelVaultFinal from 0xf8d6e0586b0a20c7
import FlowToken from 0x1654653399040a61

// Script to verify the test environment is properly set up
access(all) fun main(): {String: AnyStruct} {

    // Check if contracts are deployed
    let sentinelAccount = getAccount(0xf8d6e0586b0a20c7)

    let sentinelContract = sentinelAccount.contracts.get(name: "SentinelVaultFinal")
    let flowContract = getAccount(0x1654653399040a61).contracts.get(name: "FlowToken")

    return {
        "sentinelContractDeployed": sentinelContract != nil,
        "flowContractExists": flowContract != nil,
        "totalVaults": SentinelVaultFinal.getTotalVaults(),
        "totalValueLocked": SentinelVaultFinal.getTotalValueLocked(),
        "contractAddress": sentinelAccount.address.toString(),
        "status": "Environment ready for testing"
    }
}
