import SentinelVaultFinal from 0xc13b08053be24e87
import MultiSigAdmin from 0xc13b08053be24e87

// Contract-level pause/resume via MultiSigAdmin authorization.
// NOTE: The contract-level pause flag was removed during a backward-compatible update.
// Vault-level pause is still available via emergencyPause() on individual vaults.
// Contract-level emergency pauses must be coordinated through MultiSigAdmin governance.
transaction(paused: Bool) {
    
    prepare(signer: auth(Storage) &Account) {
        if !MultiSigAdmin.isAdmin(signer.address) {
            panic("Only MultiSig admins can pause/resume the contract")
        }

        if paused {
            emit SentinelVaultFinal.EmergencyPause(vaultId: 0, owner: signer.address)
        }
    }
}
