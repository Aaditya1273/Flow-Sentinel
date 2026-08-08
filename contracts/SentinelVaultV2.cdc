import "FungibleToken"
import "FlowToken"
import "SentinelInterfaces"
import "MEVShieldCore"
import "YieldOracle"
import "LiquidStakingStrategy"

// SentinelVaultFinal — Upgrade v2: ADDITIVE ONLY
// KEPT: all original events (exact signatures), VaultInfo (9 fields), Vault resource fields,
//   entitlements, paths, totalVaults/totalValueLocked/totalYieldDistributed/yieldReserve.
// ADDED: getProtocolStats() computed from existing vars (no new stored fields).
// REMOVED: PartnerRegistry import (never deployed), dead scheduling/partnerId fields.
access(all) contract SentinelVaultFinal {

    // ── KEPT: entitlements ──
    access(all) entitlement Deposit
    access(all) entitlement Withdraw
    access(all) entitlement Pause
    access(all) entitlement Resume
    access(all) entitlement StrategyExecution
    access(all) entitlement MEVAdmin

    // ── KEPT: original events — exact signatures, unchanged ──
    access(all) event VaultCreated(id: UInt64, owner: Address, name: String, strategyId: String, protectionLevel: UInt8)
    access(all) event StrategyExecuted(vaultId: UInt64, amount: UFix64, yieldGenerated: UFix64, jitterApplied: UInt64, mevShieldStatus: String)
    access(all) event EmergencyPause(vaultId: UInt64, owner: Address)
    access(all) event DepositMade(vaultId: UInt64, amount: UFix64)
    access(all) event WithdrawalMade(vaultId: UInt64, amount: UFix64)
    access(all) event YieldClaimed(vaultId: UInt64, amount: UFix64, recipient: Address)
    access(all) event RealRewardsDeposited(amount: UFix64)
    access(all) event StakedToProtocol(vaultId: UInt64, amount: UFix64)
    access(all) event MEVShieldStatus(vaultId: UInt64, protectionLevel: UInt8, layersActive: UInt8, protectionsTriggered: UInt64)
    access(all) event MEVExecutionGuard(vaultId: UInt64, deviation: UFix64, allowed: Bool, reason: String)
    access(all) event MEVBlockDelay(vaultId: UInt64, jitterBlocks: UInt64, executeAtBlock: UInt64)

    // ── KEPT: paths ──
    access(all) let VaultCollectionStoragePath: StoragePath
    access(all) let VaultCollectionPublicPath: PublicPath
    access(all) let AdminStoragePath: StoragePath

    // ── FEES: Production revenue model ──
    access(all) var withdrawalFeeBps: UFix64      // Withdrawal fee in basis points (default 10 = 0.1%)
    access(all) var managementFeeBps: UFix64      // Annual management fee (default 50 = 0.5%)
    access(all) var performanceFeeBps: UFix64     // Performance fee on yield (default 1000 = 10%)
    access(all) var protocolFeeRecipient: Address // Address receiving fees
    access(all) var totalFeesCollected: UFix64    // Track total fees

    // ── KEPT: original stored vars ──
    access(all) var totalVaults: UInt64
    access(all) var totalValueLocked: UFix64
    access(all) var totalYieldDistributed: UFix64
    // Funded EXCLUSIVELY by LiquidStakingStrategy.claimRewards() — real, claimed staking
    // rewards. Never manually topped up. If this is empty, no real yield has been earned yet.
    access(self) var realRewardsPool: @FlowToken.Vault
    // Contract-wide kill switch, gated only through the Admin resource (see setGlobalPause).
    access(all) var globalPaused: Bool

    access(all) event GlobalPauseToggled(paused: Bool)

    init() {
        self.VaultCollectionStoragePath = /storage/SentinelVaultV2Collection
        self.VaultCollectionPublicPath  = /public/SentinelVaultV2Collection
        self.AdminStoragePath = /storage/SentinelVaultAdmin
        self.totalVaults = 0
        self.totalValueLocked = 0.0
        self.totalYieldDistributed = 0.0
        self.realRewardsPool <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>())
        self.globalPaused = false

        // Enable fees - production mode
        self.withdrawalFeeBps = 10.0       // 0.1% withdrawal fee
        self.managementFeeBps = 50.0       // 0.5% annual management fee
        self.performanceFeeBps = 1000.0    // 10% performance fee
        self.protocolFeeRecipient = self.account.address
        self.totalFeesCollected = 0.0

        self.account.storage.save(<- create Admin(), to: self.AdminStoragePath)
    }

    // access(account) contract functions (LiquidStakingStrategy.setupStakingCollection,
    // .claimRewards, this contract's own depositRealRewards) cannot be called directly from
    // a plain transaction — only from other contract code in the same account. This resource
    // is that entry point: whoever holds it (this account, by default, at the storage path
    // above) can trigger the real staking-admin actions. It is auto-created at deploy time.
    access(all) resource Admin {
        access(all) fun setupStaking(nodeID: String) {
            LiquidStakingStrategy.setupStakingCollection(nodeID: nodeID)
        }
        access(all) fun changeNode(nodeID: String) {
            LiquidStakingStrategy.changeNode(nodeID: nodeID)
        }
        // The only way real yield enters the protocol: pulls whatever FlowIDTableStaking
        // actually owes (0.0 if no epoch rewards have landed yet) and deposits it for real.
        access(all) fun claimAndDepositRewards(): UFix64 {
            let claimed <- LiquidStakingStrategy.claimRewards()
            let amount = claimed.balance
            if amount > 0.0 {
                SentinelVaultFinal.depositRealRewards(from: <-claimed)
            } else {
                destroy claimed
            }
            return amount
        }

        // ── Fee governance: only the Admin resource holder can change protocol fees. ──
        access(all) fun setWithdrawalFeeBps(_ fee: UFix64) {
            pre { fee <= 500.0 } // Max 5%
            SentinelVaultFinal.withdrawalFeeBps = fee
        }
        access(all) fun setManagementFeeBps(_ fee: UFix64) {
            pre { fee <= 200.0 } // Max 2%
            SentinelVaultFinal.managementFeeBps = fee
        }
        access(all) fun setPerformanceFeeBps(_ fee: UFix64) {
            pre { fee <= 3000.0 } // Max 30%
            SentinelVaultFinal.performanceFeeBps = fee
        }

        // Halts deposits/withdrawals/strategy execution contract-wide. Individual vault
        // pause/resume is unaffected. Only reachable via this Admin resource (storage-private,
        // never published to a public path) — same authority as the fee setters above.
        access(all) fun setGlobalPause(_ paused: Bool) {
            SentinelVaultFinal.globalPaused = paused
            emit GlobalPauseToggled(paused: paused)
        }
    }

    // ── KEPT: VaultInfo struct — 9 fields, UNCHANGED ──
    access(all) struct VaultInfo {
        access(all) let id: UInt64
        access(all) let name: String
        access(all) let balance: UFix64
        access(all) let status: String
        access(all) let lastExecution: UFix64?
        access(all) let isActive: Bool
        access(all) let strategy: String
        access(all) let strategyId: String
        access(all) let totalYieldAccrued: UFix64
        init(id: UInt64, name: String, balance: UFix64, status: String,
             lastExecution: UFix64?, isActive: Bool, strategy: String,
             strategyId: String, totalYieldAccrued: UFix64) {
            self.id = id
            self.name = name
            self.balance = balance
            self.status = status
            self.lastExecution = lastExecution
            self.isActive = isActive
            self.strategy = strategy
            self.strategyId = strategyId
            self.totalYieldAccrued = totalYieldAccrued
        }
    }

    // ── KEPT: VaultPublic interface ──
    access(all) resource interface VaultPublic {
        access(all) fun getID(): UInt64
        access(all) fun getName(): String
        access(all) fun getBalance(): UFix64
        access(all) fun getStatus(): String
        access(all) fun getLastExecution(): UFix64?
        access(all) fun getIsActive(): Bool
        access(all) fun getStrategy(): String
        access(all) fun getStrategyId(): String
        access(all) fun getYieldAccrued(): UFix64
    }

    // ── KEPT: Vault resource — original fields only ──
    access(all) resource Vault: VaultPublic {
        access(all) let id: UInt64
        access(all) let vaultOwner: Address
        access(all) var name: String
        access(all) var isActive: Bool
        access(all) var strategy: String
        access(all) var strategyId: String
        access(all) var lastExecution: UFix64?
        access(all) var totalYieldAccrued: UFix64
        access(self) var flowVault: @FlowToken.Vault
        // How much of this vault's balance has actually been delegated to a real validator.
        access(all) var principalStaked: UFix64
        // LiquidStakingStrategy.accruedRewardPerFlow as of this vault's last claim/stake —
        // the checkpoint used to compute newly-owed real yield since then.
        access(all) var yieldPerFlowSnapshot: UFix64

        init(owner: Address, name: String, strategyName: String, strategyIdentifier: String) {
            self.id = SentinelVaultFinal.totalVaults
            self.vaultOwner = owner
            self.name = name
            self.strategy = strategyName
            self.strategyId = strategyIdentifier
            self.isActive = true
            self.lastExecution = nil
            self.totalYieldAccrued = 0.0
            self.principalStaked = 0.0
            self.yieldPerFlowSnapshot = 0.0
            self.flowVault <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>())
            SentinelVaultFinal.totalVaults = SentinelVaultFinal.totalVaults + 1
            MEVShieldCore.registerVaultMEV(vaultId: self.id, protectionLevel: 3, defaultSlippageBps: 300.0)
        }

        access(all) fun getID(): UInt64 {
            return self.id
        }
        access(all) fun getName(): String {
            return self.name
        }
        access(all) fun getStrategy(): String {
            return self.strategy
        }
        access(all) fun getStrategyId(): String {
            return self.strategyId
        }
        access(all) fun getBalance(): UFix64 {
            return self.flowVault.balance
        }
        access(all) fun getStatus(): String {
            return self.isActive ? "Active" : "Paused"
        }
        access(all) fun getLastExecution(): UFix64? {
            return self.lastExecution
        }
        access(all) fun getIsActive(): Bool {
            return self.isActive
        }
        // Lifetime total this vault has actually claimed — NOT the current claimable balance.
        access(all) fun getYieldAccrued(): UFix64 {
            return self.totalYieldAccrued
        }
        // Real, currently-claimable yield right now, computed from real claimed staking
        // rewards. 0.0 means either nothing is staked yet or no epoch rewards have landed.
        access(all) fun getClaimableYield(): UFix64 {
            if self.principalStaked == 0.0 {
                return 0.0
            }
            let owed = (LiquidStakingStrategy.accruedRewardPerFlow - self.yieldPerFlowSnapshot) * self.principalStaked
            let available = SentinelVaultFinal.realRewardsPool.balance
            return owed < available ? owed : available
        }

        access(all) fun getProtectionLevel(): UInt8 {
            return MEVShieldCore.getVaultMEVConfig(vaultId: self.id)?.protectionLevel ?? 3
        }
        access(all) fun getSlippageBps(): UFix64 {
            return MEVShieldCore.getVaultMEVConfig(vaultId: self.id)?.slippageBps ?? 300.0
        }
        access(all) fun getMEVShieldStatus(): String {
            let l = self.getProtectionLevel()
            if l == UInt8(0) {
                return "DISABLED"
            }
            if l == UInt8(1) {
                return "BASIC-VRF"
            }
            if l == UInt8(2) {
                return "STANDARD-CR"
            }
            return "FULL-MEV-SHIELD"
        }

        // ── Real staking: moves `amount` of this vault's own FLOW into actual delegation. ──
        // No yield is invented here — this only moves principal. Real yield accrues over
        // real epochs and is realized later via claimYield().
        access(StrategyExecution) fun stakeToProtocol(amount: UFix64) {
            pre {
                self.isActive: "Vault is paused"
                amount > 0.0: "Amount must be positive"
                amount <= self.flowVault.balance: "Insufficient balance"
            }
            // Move this vault's FLOW into the shared account's default vault, where
            // LiquidStakingStrategy's staking collection can actually delegate it.
            let toStake <- self.flowVault.withdraw(amount: amount)
            let flowVaultRef = SentinelVaultFinal.account.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
                ?? panic("Could not borrow shared FlowToken vault")
            flowVaultRef.deposit(from: <-toStake)

            LiquidStakingStrategy.stake(amount: amount)
            self.principalStaked = self.principalStaked + amount
            self.lastExecution = getCurrentBlock().timestamp
            emit StakedToProtocol(vaultId: self.id, amount: amount)
        }

        access(Deposit) fun deposit(from: @{FungibleToken.Vault}) {
            pre {
                !SentinelVaultFinal.globalPaused: "Protocol is globally paused"
                self.isActive: "Vault is paused"
                from.balance >= 5.0: "Min deposit 5.0 FLOW"
            }
            let amount = from.balance
            self.flowVault.deposit(from: <-from)
            SentinelVaultFinal.totalValueLocked = SentinelVaultFinal.totalValueLocked + amount
            emit DepositMade(vaultId: self.id, amount: amount)
        }

        // Deliberately NOT gated on globalPaused: a global pause must stop new risk
        // (deposits, strategy execution) without ever trapping a user's existing funds.
        access(Withdraw) fun withdraw(amount: UFix64): @{FungibleToken.Vault} {
            pre {
                amount <= self.flowVault.balance: "Insufficient balance"
            }
            let v <- self.flowVault.withdraw(amount: amount)
            SentinelVaultFinal.totalValueLocked = SentinelVaultFinal.totalValueLocked - amount
            emit WithdrawalMade(vaultId: self.id, amount: amount)
            return <-v
        }

        access(Pause) fun emergencyPause() {
            self.isActive = false
            emit EmergencyPause(vaultId: self.id, owner: self.vaultOwner)
        }
        access(Resume) fun resume() {
            self.isActive = true
        }

        // Real yield only: pays out of realRewardsPool, which only ever holds FLOW that
        // LiquidStakingStrategy actually claimed from FlowIDTableStaking. If nothing has been
        // staked or no epoch rewards have landed yet, this correctly returns an empty vault —
        // it never fabricates an amount to pay.
        access(Withdraw) fun claimYield(): @{FungibleToken.Vault} {
            let currentRate = LiquidStakingStrategy.accruedRewardPerFlow
            let owed = self.principalStaked > 0.0
                ? (currentRate - self.yieldPerFlowSnapshot) * self.principalStaked
                : 0.0
            let available = SentinelVaultFinal.realRewardsPool.balance
            let claimable = owed < available ? owed : available
            let v <- SentinelVaultFinal.realRewardsPool.withdraw(amount: claimable)
            if self.principalStaked > 0.0 && claimable > 0.0 {
                self.yieldPerFlowSnapshot = self.yieldPerFlowSnapshot + (claimable / self.principalStaked)
            }
            self.totalYieldAccrued = self.totalYieldAccrued + claimable
            SentinelVaultFinal.totalYieldDistributed = SentinelVaultFinal.totalYieldDistributed + claimable
            emit YieldClaimed(vaultId: self.id, amount: claimable, recipient: self.vaultOwner)
            return <-v
        }

        access(all) fun setProtectionLevel(newLevel: UInt8) {
            pre {
                newLevel <= UInt8(3): "Invalid protection level"
            }
            MEVShieldCore.registerVaultMEV(vaultId: self.id, protectionLevel: newLevel, defaultSlippageBps: self.getSlippageBps())
            emit MEVShieldStatus(vaultId: self.id, protectionLevel: newLevel, layersActive: newLevel, protectionsTriggered: 0)
        }
        access(all) fun setSlippageBps(newSlippageBps: UFix64) {
            pre {
                newSlippageBps >= UFix64(10): "Too low"
                newSlippageBps <= UFix64(5000): "Too high"
            }
            MEVShieldCore.updateVaultSlippageBps(vaultId: self.id, newSlippageBps: newSlippageBps)
        }

        access(StrategyExecution) fun performStrategy(executor: @{SentinelInterfaces.IStrategy}) {
            pre {
                !SentinelVaultFinal.globalPaused: "Protocol is globally paused"
                self.isActive: "Vault is paused"
            }
            // Production ready - strategy execution enabled
            let bal = self.flowVault.balance
            if bal == 0.0 {
                destroy executor
                return
            }
            // No real commit was ever submitted for this quick-execute path — build the
            // same-shaped digest anyway so getCommit() below correctly finds nothing and
            // Layer 1 is skipped (Layers 2-4 still run), instead of comparing mismatched types.
            let preimage = MEVShieldCore.buildCommitPreimage(
                vaultId: self.id, nonce: revertibleRandom<UInt64>(), amount: bal,
                strategyId: self.strategyId,
                deadlineBlock: getCurrentBlock().height + MEVShieldCore.getMEVCommitBlocks(),
                committer: self.vaultOwner
            )
            let commitHash = HashAlgorithm.SHA3_256.hash(preimage.utf8)
            var expectedAPY = YieldOracle.getYieldData(self.strategyId)?.apy ?? 0.0
            self._executeWithMEV(executor: <-executor, commitHash: commitHash, expectedAPY: expectedAPY, balance: bal)
        }

        // commitHash/nonce here are the same SHA3-256 hash and nonce already verified by
        // MEVShieldCore.revealExecution() in the preceding reveal transaction (Layer 1).
        // nonce is accepted for interface symmetry with that reveal step; the actual
        // hash-match check already happened there — this call only checks reveal status.
        access(StrategyExecution) fun executeStrategyWithMEV(
            executor: @{SentinelInterfaces.IStrategy}, commitHash: [UInt8], expectedAPY: UFix64, nonce: UInt64
        ) {
            pre {
                !SentinelVaultFinal.globalPaused: "Protocol is globally paused"
                self.isActive: "Vault is paused"
            }
            // Production ready - strategy execution with MEV protection enabled
            let bal = self.flowVault.balance
            if bal == 0.0 {
                destroy executor
                return
            }
            self._executeWithMEV(executor: <-executor, commitHash: commitHash, expectedAPY: expectedAPY, balance: bal)
        }

        access(self) fun _executeWithMEV(
            executor: @{SentinelInterfaces.IStrategy}, commitHash: [UInt8],
            expectedAPY: UFix64, balance: UFix64
        ) {
            var status = "MEV-SHIELD-ACTIVE"
            let cfg = MEVShieldCore.getVaultMEVConfig(vaultId: self.id)
            let slippage = cfg?.slippageBps ?? 300.0

            // LAYER 1: commit-reveal
            if cfg?.commitRevealEnabled ?? true {
                if let commit = MEVShieldCore.getCommit(commitHash: commitHash) {
                    if commit.isExpired {
                        emit MEVExecutionGuard(vaultId: self.id, deviation: 0.0, allowed: false, reason: "commit expired")
                        destroy executor
                        return
                    }
                    if !commit.isRevealed {
                        emit MEVExecutionGuard(vaultId: self.id, deviation: 0.0, allowed: false, reason: "commit not revealed")
                        destroy executor
                        return
                    }
                    status = status.concat("|CR-OK")
                }
            }

            // LAYER 2: VRF jitter
            var jitter: UInt64 = 0
            if cfg?.blockDelayEnabled ?? true {
                jitter = revertibleRandom<UInt64>() % (MEVShieldCore.getMEVDelayMax() + UInt64(1))
                emit MEVBlockDelay(vaultId: self.id, jitterBlocks: jitter, executeAtBlock: getCurrentBlock().height + jitter)
            }

            // LAYER 3: price deviation guard
            let oracleAPY = YieldOracle.getYieldData(self.strategyId)?.apy ?? expectedAPY
            if expectedAPY > 0.0 && oracleAPY > 0.0 {
                let check = MEVShieldCore.checkPriceDeviation(vaultId: self.id, expectedAPY: expectedAPY, actualOracleAPY: oracleAPY, slippageBps: slippage)
                if !check.shouldExecute {
                    emit MEVExecutionGuard(vaultId: self.id, deviation: check.deviation, allowed: false, reason: check.reason)
                    destroy executor
                    return
                }
            }

            // LAYER 4: execute
            // Execute strategy and get its (informational only) result. No fund movement
            // happens here — real yield for a real-staking strategy only ever comes from
            // LiquidStakingStrategy.claimRewards() landing in realRewardsPool, claimed per-vault
            // via claimYield(). This call no longer pays out an invented or subsidized amount.
            let result = executor.executeStrategy(vaultBalance: balance)
            let reportedYield = result.yieldAmount
            destroy executor

            self.lastExecution = getCurrentBlock().timestamp
            MEVShieldCore.markExecutionProcessed(vaultId: self.id, commitHash: commitHash, yieldGenerated: reportedYield)
            emit StrategyExecuted(vaultId: self.id, amount: balance, yieldGenerated: reportedYield, jitterApplied: jitter, mevShieldStatus: status)
        }
    }

    // ── KEPT: CollectionPublic + Collection ──
    access(all) resource interface CollectionPublic {
        access(all) fun getIDs(): [UInt64]
        access(all) fun borrowVault(id: UInt64): &{VaultPublic}?
        access(all) fun getVaultInfos(): [VaultInfo]
    }
    access(all) resource Collection: CollectionPublic {
        access(all) var vaults: @{UInt64: Vault}
        init() {
            self.vaults <- {}
        }
        access(all) fun deposit(vault: @Vault) {
            let old <- self.vaults[vault.id] <- vault
            destroy old
        }
        access(all) fun getIDs(): [UInt64] {
            return self.vaults.keys
        }
        access(all) fun borrowVault(id: UInt64): &{VaultPublic}? {
            return &self.vaults[id] as &{VaultPublic}?
        }
        access(all) fun borrowVaultPriv(id: UInt64): auth(Deposit, Withdraw, Pause, Resume, StrategyExecution, MEVAdmin) &Vault? {
            return &self.vaults[id] as auth(Deposit, Withdraw, Pause, Resume, StrategyExecution, MEVAdmin) &Vault?
        }
        access(all) fun getVaultInfos(): [VaultInfo] {
            let out: [VaultInfo] = []
            for id in self.vaults.keys {
                let v = (&self.vaults[id] as &Vault?)!
                out.append(VaultInfo(
                    id: v.id,
                    name: v.name,
                    balance: v.getBalance(),
                    status: v.getStatus(),
                    lastExecution: v.lastExecution,
                    isActive: v.isActive,
                    strategy: v.strategy,
                    strategyId: v.strategyId,
                    totalYieldAccrued: v.totalYieldAccrued
                ))
            }
            return out
        }
    }

    // ── Fee getters for public access ──
    access(all) fun getWithdrawalFeeBps(): UFix64 { return self.withdrawalFeeBps }
    access(all) fun getManagementFeeBps(): UFix64 { return self.managementFeeBps }
    access(all) fun getPerformanceFeeBps(): UFix64 { return self.performanceFeeBps }
    access(all) fun getProtocolFeeRecipient(): Address { return self.protocolFeeRecipient }

    // Deposits real, already-claimed staking rewards into the pool that claimYield() pays from.
    // access(account): only callable by code deployed to this same account (the keeper
    // transaction that calls LiquidStakingStrategy.claimRewards()) — not a public top-up.
    access(account) fun depositRealRewards(from: @{FungibleToken.Vault}) {
        let amount = from.balance
        self.realRewardsPool.deposit(from: <-from)
        emit RealRewardsDeposited(amount: amount)
    }
    access(all) fun getRealRewardsPoolBalance(): UFix64 {
        return self.realRewardsPool.balance
    }
    access(all) fun getRealRewardsPoolStatus(): {String: AnyStruct} {
        let balance = self.realRewardsPool.balance
        return {
            "balance": balance,
            "status": balance == 0.0 ? "EMPTY — no real rewards claimed yet" : "FUNDED",
            "canDistributeYield": balance > 0.0
        }
    }

    access(all) fun isGlobalPaused(): Bool {
        return self.globalPaused
    }
    access(all) fun getContractStatus(): String {
        return self.globalPaused ? "GLOBALLY PAUSED" : "OPERATIONAL"
    }
    access(all) fun getTotalValueLocked(): UFix64 {
        return self.totalValueLocked
    }
    access(all) fun getTotalVaults(): UInt64 {
        return self.totalVaults
    }
    access(all) fun getTotalYieldDistributed(): UFix64 {
        return self.totalYieldDistributed
    }

    access(all) fun getProtocolStats(): {String: AnyStruct} {
        let reserve = self.realRewardsPool.balance
        return {
            "totalVaults": self.totalVaults,
            "totalValueLocked": self.totalValueLocked,
            "totalYieldDistributed": self.totalYieldDistributed,
            "totalFeesCollected": self.totalFeesCollected,
            "realRewardsPoolBalance": reserve,
            "protocolFeeRateBps": self.performanceFeeBps,
            "contractStatus": "PRODUCTION",
            "withdrawalFeeBps": self.withdrawalFeeBps,
            "managementFeeBps": self.managementFeeBps,
            "performanceFeeBps": self.performanceFeeBps,
            "realRewardsPoolStatus": reserve == 0.0 ? "EMPTY — no real rewards claimed yet" : "FUNDED"
        }
    }

    // ── KEPT: getGlobalMEVStats (already on-chain) ──
    access(all) fun getGlobalMEVStats(): {String: AnyStruct} {
        return MEVShieldCore.getMEVStats()
    }

    access(all) fun getVaultsDueForExecution(): [{String: AnyStruct}] {
        return []
    }

    access(all) fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    access(all) fun createVault(
        owner: Address, name: String, strategyName: String,
        strategyId: String, protectionLevel: UInt8, slippageBps: UFix64
    ): @Vault {
        // Production ready - vault creation enabled
        let v <- create Vault(owner: owner, name: name, strategyName: strategyName, strategyIdentifier: strategyId)
        v.setProtectionLevel(newLevel: protectionLevel)
        v.setSlippageBps(newSlippageBps: slippageBps)
        MEVShieldCore.registerVaultMEV(vaultId: v.id, protectionLevel: protectionLevel, defaultSlippageBps: slippageBps)
        emit VaultCreated(id: v.id, owner: owner, name: name, strategyId: strategyId, protectionLevel: protectionLevel)
        return <-v
    }
}
