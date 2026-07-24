import YieldOracle from 0xc13b08053be24e87
import FlowIDTableStaking from 0x9eca2b38b3c3b55a

// ── Oracle Update Transaction — Phase 4 ──
// Pulls real staking APY from FlowIDTableStaking and updates the oracle.
// Called by: Netlify cron (every 6h) via oracle-update API route, or manually by admin.
// Auth: requires OracleAdminResource in signer storage (deployed at contract init).
//
// Phase 4 Fix: Oracle is now the entitlement-based resource — no spoofable caller address.
//
transaction(
    strategyId: String,
    apy: UFix64,
    source: String,
    confidence: UFix64
) {
    let adminResource: auth(YieldOracle.OracleAdmin) &YieldOracle.OracleAdminResource

    prepare(signer: auth(BorrowValue) &Account) {
        self.adminResource = signer.storage
            .borrow<auth(YieldOracle.OracleAdmin) &YieldOracle.OracleAdminResource>(
                from: YieldOracle.OracleAdminStoragePath
            ) ?? panic("Not authorized: OracleAdminResource not found in signer storage. Only the oracle admin account can update APY data.")
    }

    execute {
        self.adminResource.setAPY(
            strategyId: strategyId,
            apy: apy,
            source: source,
            confidence: confidence
        )
    }
}
