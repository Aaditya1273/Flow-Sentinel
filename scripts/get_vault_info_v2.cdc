import SentinelVaultFinal from 0xc13b08053be24e87

access(all) fun main(address: Address): {String: AnyStruct} {
    let account = getAccount(address)

    if let collectionRef = account.capabilities.borrow<&{SentinelVaultFinal.CollectionPublic}>(
        SentinelVaultFinal.VaultCollectionPublicPath
    ) {
        let infos = collectionRef.getVaultInfos()
        if infos.length > 0 {
            let vault = infos[0]
            return {
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
                "hasLastExecution": vault.lastExecution != nil
            }
        }
    }

    return {
        "hasVault": false,
        "error": "No Sentinel Vault Final found"
    }
}
