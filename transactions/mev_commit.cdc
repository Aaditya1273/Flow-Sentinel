import MEVShieldCore from 0xc13b08053be24e87
// MEV Commit Transaction — Layer 1: Commit-Reveal Protection
//
// Usage:
//   1. User generates a commit preimage off-chain
//   2. Computes hash: "SENTINEL-MEV-COMMIT:vaultId:nonce:amount:strategyId:deadline:committer"
//   3. Sends this transaction to commit
//   4. After N blocks, user sends mev_reveal.cdc to reveal and execute
//
// Parameters:
//   - vaultId: The vault to execute strategy on
//   - commitHash: Hash of (vaultId, nonce, amount, strategyId, deadline, sender)
//   - protectionLevel: 0=None, 1=Basic, 2=Standard, 3=Full
//
transaction(vaultId: UInt64, commitHash: String, protectionLevel: UInt8) {
    
    prepare(signer: auth(Storage) &Account) {
        // Create the commitment on-chain
        MEVShieldCore.createCommit(
            vaultId: vaultId,
            commitHash: commitHash,
            protectionLevel: protectionLevel
        )
    }
}
