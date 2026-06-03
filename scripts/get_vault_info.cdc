import SentinelVaultFinal from 0xc13b08053be24e87
import MEVShieldCore from 0xc13b08053be24e87

// Script to get comprehensive vault information (MEV-enabled vaults)
access(all) fun main(address: Address): {String: AnyStruct} {

    let collectionRef = getAccount(address)
        .capabilities.get<&{SentinelVaultFinal.CollectionPublic}>(SentinelVaultFinal.VaultCollectionPublicPath)
        .borrow()

    if collectionRef == nil {
        return {
            "error": "No Sentinel Vault found for this address",
            "hasVault": false
        }
    }

    let collection = collectionRef!
    let vaultInfos = collection.getVaultInfos()

    let mevStats = MEVShieldCore.getMEVStats()

    return {
        "hasVault": vaultInfos.length > 0,
        "vaultCount": vaultInfos.length,
        "vaults": vaultInfos,
        "totalValueLocked": SentinelVaultFinal.getTotalValueLocked(),
        "totalVaults": SentinelVaultFinal.getTotalVaults(),
        "totalYieldDistributed": SentinelVaultFinal.getTotalYieldDistributed(),
        "yieldReserveBalance": SentinelVaultFinal.getYieldReserveBalance(),
        "mevGlobalStats": mevStats
    }
}
