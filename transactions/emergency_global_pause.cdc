import SentinelVaultFinal from 0xc13b08053be24e87

// ── Emergency Global Pause — Phase 8 ──
// Halts ALL deposits and withdrawals across every vault contract-wide.
// Can only be called by the contract deployer account (access(account)).
//
// Use this when:
//   - A critical vulnerability is discovered
//   - Suspicious on-chain activity is detected
//   - An oracle manipulation attack is in progress
//
// To resume normal operations, call this again with paused = false.
// Individual vault pauses (emergencyPause/resume) remain unaffected.
//
transaction(paused: Bool) {
    prepare(signer: auth(BorrowValue) &Account) {
        pre {
            signer.address == SentinelVaultFinal.account.address:
                "Only the contract deployer can toggle global pause"
        }
        SentinelVaultFinal.setGlobalPause(paused)
    }
}
