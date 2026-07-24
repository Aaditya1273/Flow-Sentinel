# Flow Sentinel — Security Documentation

> Current status: **Testnet only**. No real funds. Not audited. Do not deploy to mainnet without completing the items in this document.

---

## Audit Status

| Component | Status | Notes |
|-----------|--------|-------|
| `SentinelVaultFinal` | ⚠ Unaudited | Core vault + deposit/withdraw logic |
| `MEVShieldCore` | ⚠ Unaudited | 4-layer MEV protection engine |
| `YieldOracle` | ⚠ Unaudited | Entitlement-based APY data store |
| `StrategyRegistry` | ⚠ Unaudited | Strategy catalog + live TVL queries |
| `LiquidStakingStrategy` | ⚠ Unaudited | FlowIDTableStaking epoch integration |
| `YieldFarmingStrategy` | ⚠ Unaudited | Multi-protocol yield farming |
| `ArbitrageStrategy` | ⚠ Unaudited | Cross-DEX spread detection |
| `MultiSigAdmin` | ⚠ Unaudited | M-of-N multi-sig admin actions |
| `SentinelInterfaces` | ⚠ Unaudited | Shared interface definitions |
| Frontend API routes | ⚠ Unaudited | Wallet auth, settings, export |

**No third-party security audit has been conducted. All contracts require professional Cadence audit before mainnet deployment.**

---

## Known Risks & Limitations

### Smart Contract

**1. Yield reserve solvency (Medium)**
The `yieldReserve` vault is funded via the 0.1% protocol fee on deposits and manual top-ups. If the reserve balance falls below the accrued yield, `claimYield()` will pay out a reduced amount (clamped to available balance) rather than the full accrued amount. The remaining unclaimed yield persists in `totalYieldAccrued` and can be claimed when the reserve is refunded.

*Mitigation:* `ReserveHealthWidget` on the dashboard shows CRITICAL/WARNING/HEALTHY status. Operators should monitor the `YieldReserveFunded` and `ProtocolFeeCollected` events.

**2. Strategy yield is calculated, not always from real protocol calls (Medium)**
`LiquidStakingStrategy` calls `FlowIDTableStaking.getEpochTokenInfo()` for real epoch APY data. `YieldFarmingStrategy` and `ArbitrageStrategy` use oracle-backed APY calculations and VRF-based spread simulation respectively. Tokens do not physically move to external DeFi protocols yet. Phase 3 IncrementFi integration is pending their public Cadence connector release.

*Mitigation:* `StrategyResult.usedRealProtocol` flag is logged in every `StrategyExecuted` event. Frontend displays protocol source transparently.

**3. Oracle admin key security (High)**
The `YieldOracle.OracleAdminResource` is stored at the deployer account. If the deployer private key is compromised, an attacker can set arbitrary APY values. High APY values would cause the yield reserve to be rapidly drained.

*Mitigation:* Store the oracle admin key in HSM or Vault (HashiCorp). Rotate keys before mainnet. The `checkPriceDeviation` Layer 3 guard in MEVShieldCore limits APY manipulation to 3% slippage before execution is rejected.

**4. Global pause requires deployer key (Low)**
`setGlobalPause()` uses `access(account)` — only the contract deployer account can call it. In a multi-operator setup, this is a single point of failure for emergency response.

*Mitigation:* Deploy `MultiSigAdmin` with M-of-N threshold before mainnet. Route global pause through the multi-sig proposal flow.

**5. Keeper authorization model (Medium)**
The `strategy-keeper` Netlify function uses a service key to submit transactions. The keeper can trigger strategy execution but cannot access user funds directly (it calls `executeStrategyWithMEV` which requires a pre-committed hash). However, a compromised keeper key could spam execution transactions, draining gas from the keeper wallet.

*Mitigation:* Rate-limit keeper execution to once per vault per interval. Monitor keeper wallet balance. Rotate keeper key via environment variable update.

**6. Commit-reveal window (Low)**
The commit-reveal deadline is 200 blocks (~3 minutes). Commits that expire before reveal are automatically marked expired and must be resubmitted. Under heavy network load, the 200-block window may be tight.

*Mitigation:* Increase `getMEVCommitBlocks()` return value if testnet shows frequent expiry. Monitor `CommitExpired` events.

### Frontend

**7. Wallet-auth signature replay (Low)**
The `buildAuthMessage` in `lib/wallet-auth.ts` uses a 5-minute rolling window (`Math.floor(Date.now() / 300000)`). Signatures are valid for up to ~10 minutes (current window + previous window). A stolen signature could be replayed within that window.

*Mitigation:* For sensitive operations (account deletion, settings change), require a fresh signature with a one-time nonce stored server-side.

**8. Supabase RLS depends on app-level config (Medium)**
Row Level Security policies use `current_setting('app.wallet_address', true)`. This setting must be set by the API route before each query. If a route forgets to set it, data could be returned without RLS filtering.

*Mitigation:* All API routes use the `supabaseAdmin` client with explicit `.eq('wallet_address', address)` filters as a secondary guard. Review all new routes before deployment.

**9. Private keys in environment variables (High)**
`ORACLE_ADMIN_PRIVATE_KEY` and `KEEPER_PRIVATE_KEY` are P-256 private keys stored as Netlify environment variables. If the Netlify account is compromised, these keys are exposed.

*Mitigation:* Use Netlify's secret scanning. Rotate keys periodically. Consider AWS KMS or similar HSM for mainnet key management. Never commit keys to git — confirm `.gitignore` covers `.env.local`.

---

## Security Controls Implemented

| Control | Status | Details |
|---------|--------|---------|
| SHA3-256 commit hashing | ✅ Active | `MEVShieldCore.buildCommitHash()` — Phase 1 fix |
| Price deviation guard (3% slippage) | ✅ Active | Layer 3 MEV protection — fixed OR logic in Phase 1 |
| VRF block-delay jitter (0-5 blocks) | ✅ Active | Layer 2 MEV protection |
| VRF execution queue shuffle | ✅ Active | Layer 4 MEV protection |
| Protocol fee → yield reserve | ✅ Active | 0.1% auto-fee on every deposit |
| Entitlement-based oracle admin | ✅ Active | `access(OracleAdmin)` resource — Phase 1 fix |
| Clamped claimYield (no panic) | ✅ Active | Pays available balance, not full accrued — Phase 1 fix |
| Global emergency pause | ✅ Active | `access(account) setGlobalPause()` — Phase 8 |
| Per-vault deposit rate limit | ✅ Active | `maxDepositPerBlock` = 10,000 FLOW default |
| Max vault balance cap | ✅ Active | `maxVaultBalanceCap` = 100,000 FLOW default |
| Wallet-signed API authentication | ✅ Active | `lib/wallet-auth.ts` — FCL signature verification |
| Supabase RLS + explicit eq filter | ✅ Active | Double guard on all DB queries |
| Netlify cron secret | ✅ Required | `CRON_SECRET` env var gates oracle + keeper routes |

---

## Reporting a Vulnerability

This project is on testnet and under active development. If you find a security issue:

1. **Do not open a public GitHub issue** for security vulnerabilities.
2. Email the team at: `security@flowsentinel.io` (not yet active — use GitHub private advisory for now).
3. Include: contract name, function name, attack vector, and a minimal proof-of-concept.
4. We will acknowledge within 48 hours and provide a fix timeline.

---

## Pre-Mainnet Security Checklist

Before deploying to mainnet, the following must be completed:

- [ ] Professional Cadence smart contract audit (minimum 1 firm)
- [ ] Fuzz testing all `pre` conditions with edge cases (zero, max UInt64, max UFix64)
- [ ] Rotate all testnet private keys — never reuse testnet keys on mainnet
- [ ] Move all signing keys to HSM (AWS KMS, HashiCorp Vault, or Ledger)
- [ ] Deploy MultiSigAdmin with M≥2-of-N≥3 for all admin operations
- [ ] Implement upgradeability path for contracts (proxy or migration script)
- [ ] Penetration test the Netlify API routes (settings, oracle-update, export-data)
- [ ] Enable Sentry error monitoring with PII scrubbing
- [ ] Set up on-chain event monitoring with alerts for anomalous activity
- [ ] Bug bounty program (Immunefi or equivalent) before public launch
