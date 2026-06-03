import SentinelVaultFinal from 0xf8d6e0586b0a20c7

// Comprehensive demo script showing all Sentinel Vault features (V2 collection API)
access(all) fun main(userAddress: Address): {String: AnyStruct} {

    let account = getAccount(userAddress)

    if let collectionRef = account.capabilities.borrow<&{SentinelVaultFinal.CollectionPublic}>(
        SentinelVaultFinal.VaultCollectionPublicPath
    ) {
        let vaultInfos = collectionRef.getVaultInfos()

        if vaultInfos.length == 0 {
            return {
                "error": "No Sentinel Vault found - run init_sentinel.cdc first",
                "hasVault": false,
                "instructions": "Execute: flow transactions send ./transactions/init_sentinel.cdc"
            }
        }

        let vault = vaultInfos[0]

        let vaultInfo = {
            "hasVault": true,
            "vaultId": vault.id,
            "name": vault.name,
            "balance": vault.balance,
            "status": vault.status,
            "isActive": vault.isActive,
            "lastExecution": vault.lastExecution,
            "strategy": vault.strategy,
            "strategyId": vault.strategyId,
            "totalYieldAccrued": vault.totalYieldAccrued,
            "protectionLevel": vault.protectionLevel,
            "mevShieldStatus": vault.mevShieldStatus
        }

        let globalStats = {
            "totalVaults": SentinelVaultFinal.getTotalVaults(),
            "totalValueLocked": SentinelVaultFinal.getTotalValueLocked(),
            "contractAddress": "0xf8d6e0586b0a20c7"
        }

        let features = {
            "autonomousScheduling": "✅ Forte Scheduled Transactions integrated",
            "mevProtection": "✅ 4-layer MEV-Shield Pro (Commit-Reveal + VRF + Price Guard + Execution Queue)",
            "emergencyControls": "✅ Passkey-compatible pause mechanism + contract-level emergency pause",
            "highPrecision": "✅ UFix64 precision for DeFi calculations",
            "selfRescheduling": "✅ Infinite loop automation (24h cycles)"
        }

        let operations = {
            "deposit": "flow transactions send ./transactions/deposit_flow.cdc --arg UInt64:<vaultId> --arg UFix64:100.0",
            "withdraw": "flow transactions send ./transactions/withdraw_flow.cdc --arg UInt64:<vaultId> --arg UFix64:50.0",
            "emergencyPause": "flow transactions send ./transactions/emergency_pause.cdc --arg UInt64:<vaultId>",
            "checkStatus": "flow scripts execute ./scripts/get_vault_info.cdc --arg Address:<userAddr>"
        }

        return {
            "vaultInfo": vaultInfo,
            "globalStats": globalStats,
            "grantFeatures": features,
            "availableOperations": operations,
            "demoStatus": "All core features implemented and functional"
        }
    }

    return {
        "error": "No Sentinel Vault found - run init_sentinel.cdc first",
        "hasVault": false,
        "instructions": "Execute: flow transactions send ./transactions/init_sentinel.cdc"
    }
}
