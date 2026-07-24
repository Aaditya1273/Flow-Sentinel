import SentinelVaultFinal from 0xc13b08053be24e87
import FlowToken from 0x7e60df042a9c0868

// Script to verify the test environment is properly set up
access(all) fun main(): {String: AnyStruct} {

    // Check if contracts are deployed
    let sentinelAccount = getAccount(0xc13b08053be24e87)

    let sentinelContract = sentinelAccount.contracts.get(name: "SentinelVaultFinal")
    let flowContract = getAccount(0x7e60df042a9c0868).contracts.get(name: "FlowToken")

    return {
        "sentinelContractDeployed": sentinelContract != nil,
        "flowContractExists": flowContract != nil,
        "totalVaults": SentinelVaultFinal.getTotalVaults(),
        "totalValueLocked": SentinelVaultFinal.getTotalValueLocked(),
        "contractAddress": "0xc13b08053be24e87",
        "status": "Environment ready for testing"
    }
}
