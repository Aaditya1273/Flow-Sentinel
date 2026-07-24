import MEVShieldCore from 0xc13b08053be24e87

// ── MEV Commit Transaction — Layer 1: Commit-Reveal Protection ──
//
// Phase 1 Fix: commitHash is now [UInt8] (SHA3-256 hash bytes), not a String.
//
// HOW TO USE (off-chain, before calling this transaction):
//   1. Generate a random nonce (UInt64)
//   2. Note your vaultId, amount, strategyId, deadlineBlock (current + 200), your address
//   3. Build preimage string:
//      "SENTINEL|{vaultId}|{nonce}|{amount}|{strategyId}|{deadlineBlock}|{committerAddress}"
//   4. SHA3-256 hash the UTF-8 bytes of that string
//   5. Pass the resulting 32 bytes as commitHash
//
// JavaScript helper (copy to your frontend):
//   import { buildCommitHash } from 'lib/mev-hash'  (see lib/mev-hash.ts)
//
// Parameters:
//   - vaultId: Your vault ID
//   - commitHash: [UInt8] — 32-byte SHA3-256 hash of execution params
//   - protectionLevel: 0=None, 1=Basic (VRF jitter), 2=Standard, 3=Full
//
transaction(vaultId: UInt64, commitHash: [UInt8], protectionLevel: UInt8) {
    prepare(signer: auth(Storage) &Account) {
        // Validate hash length before submitting
        assert(commitHash.length == 32, message: "commitHash must be 32 bytes (SHA3-256 output)")
        assert(protectionLevel <= 3, message: "protectionLevel must be 0-3")

        MEVShieldCore.createCommit(
            vaultId: vaultId,
            commitHash: commitHash,
            protectionLevel: protectionLevel,
            committedBy: signer.address
        )
    }
}
