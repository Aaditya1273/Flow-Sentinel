import MEVShieldCore from 0xc13b08053be24e87
import SentinelVaultFinal from 0xc13b08053be24e87

// Query MEV protection status
//
// Usage: flow scripts execute scripts/mev_status.cdc [vaultId]
//   Without vaultId: returns global MEV stats
//   With vaultId: returns vault-specific MEV config
//
access(all) fun main(vaultId: UInt64?): {String: AnyStruct} {
    
    if vaultId == nil {
        // Return global MEV protection statistics
        let stats = MEVShieldCore.getMEVStats()
        return {
            "type": "global",
            "totalMEVProtectionsTriggered": stats["totalProtectionsTriggered"]!,
            "totalCommitsCreated": stats["totalCommitsCreated"]!,
            "totalCommitsExpired": stats["totalCommitsExpired"]!,
            "totalExecutionsProcessed": stats["totalExecutionsProcessed"]!,
            "totalExecutionsRejected": stats["totalExecutionsRejected"]!,
            "pendingExecutionCount": stats["pendingExecutionCount"]!,
            "activeVaultCount": stats["activeVaultCount"]!,
            "delayMaxBlocks": stats["mevDelayMaxBlocks"]!,
            "commitWindowBlocks": stats["mevCommitWindowBlocks"]!,
            "deviationTolerance": stats["mevDeviationTolerance"]!,
            "defaultSlippageBps": stats["mevDefaultSlippageBps"]!,
            "protectionLevels": stats["protectionLevels"]!,
            "status": "MEV-SHIELD-PRO-ACTIVE"
        }
    } else {
        // Return vault-specific MEV configuration
        let vaultId = vaultId!
        if let vault = MEVShieldCore.getVaultMEVConfig(vaultId: vaultId) {
            var lastBlockStr = "never"
            if vault.lastExecutionBlock != nil {
                lastBlockStr = vault.lastExecutionBlock!.toString()
            }
            var protectionStatus = "DISABLED"
            if vault.protectionLevel == 1 {
                protectionStatus = "BASIC-VRF"
            } else if vault.protectionLevel == 2 {
                protectionStatus = "STANDARD-CR"
            } else if vault.protectionLevel == 3 {
                protectionStatus = "FULL-MEV-SHIELD"
            }
            return {
                "type": "vault",
                "vaultId": vault.vaultId,
                "protectionLevel": vault.protectionLevel,
                "slippageBps": vault.slippageBps,
                "deviationTolerance": vault.deviationTolerance,
                "blockDelayEnabled": vault.blockDelayEnabled,
                "commitRevealEnabled": vault.commitRevealEnabled,
                "totalProtectionsTriggered": vault.totalProtectionsTriggered,
                "lastExecutionBlock": lastBlockStr,
                "protectionStatus": protectionStatus
            }
        }
        return {"type": "vault", "error": "Vault not found or MEV not configured"}
    }
}
