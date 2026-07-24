import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868
import SentinelInterfaces from 0x136b642d0aa31ca9
import MEVShieldCore from 0xc13b08053be24e87
import YieldOracle from 0xc13b08053be24e87

access(all) contract SentinelVaultFinal {
    
    // Entitlements
    access(all) entitlement Deposit
    access(all) entitlement Withdraw
    access(all) entitlement Pause
    access(all) entitlement Resume
    access(all) entitlement StrategyExecution
    access(all) entitlement MEVAdmin
    
    // Events
    access(all) event VaultCreated(id: UInt64, owner: Address, name: String, strategyId: String, protectionLevel: UInt8)
    // Phase 3: StrategyExecuted now includes rich provenance from StrategyResult
    access(all) event StrategyExecuted(
        vaultId: UInt64,
        amount: UFix64,
        yieldGenerated: UFix64,
        realYieldFromProtocol: UFix64,
        protocolSource: String,
        realizedAPY: UFix64,
        usedRealProtocol: Bool,
        confidence: UFix64,
        jitterApplied: UInt64,
        mevShieldStatus: String
    )
    access(all) event EmergencyPause(vaultId: UInt64, owner: Address)
    access(all) event DepositMade(vaultId: UInt64, amount: UFix64, feeCollected: UFix64)
    access(all) event WithdrawalMade(vaultId: UInt64, amount: UFix64)
    access(all) event YieldClaimed(vaultId: UInt64, amount: UFix64, recipient: Address)
    access(all) event YieldReserveFunded(amount: UFix64, from: Address, newReserveBalance: UFix64)
    access(all) event ProtocolFeeCollected(vaultId: UInt64, feeAmount: UFix64, newReserveBalance: UFix64)
    access(all) event MEVShieldStatus(vaultId: UInt64, protectionLevel: UInt8, layersActive: UInt8, protectionsTriggered: UInt64)
    access(all) event MEVExecutionGuard(vaultId: UInt64, deviation: UFix64, allowed: Bool, reason: String)
    access(all) event MEVBlockDelay(vaultId: UInt64, jitterBlocks: UInt64, executeAtBlock: UInt64)
    access(all) event YieldReserveInsufficient(vaultId: UInt64, requested: UFix64, available: UFix64)
    
    // Paths
    access(all) let VaultCollectionStoragePath: StoragePath
    access(all) let VaultCollectionPublicPath: PublicPath
    
    // Global state
    access(all) var totalVaults: UInt64
    access(all) var totalValueLocked: UFix64
    access(all) var totalYieldDistributed: UFix64
    access(all) var totalFeesCollected: UFix64    // Phase 2: cumulative protocol fees
    access(self) var yieldReserve: @FlowToken.Vault

    // Phase 2: Protocol fee rate — 0.1% (10 basis points) on each deposit
    // Automatically flows into yieldReserve to sustain real yield payouts.
    access(all) fun getProtocolFeeRate(): UFix64 { return 0.001 }
    // Minimum deposit threshold below which no fee is taken (< 0.01 FLOW)
    access(all) fun getMinFeeThreshold(): UFix64 { return 0.01 }
    
    init() {
        self.VaultCollectionStoragePath = /storage/SentinelVaultV2Collection
        self.VaultCollectionPublicPath = /public/SentinelVaultV2Collection
        self.totalVaults = 0
        self.totalValueLocked = 0.0
        self.totalYieldDistributed = 0.0
        self.totalFeesCollected = 0.0
        let emptyVault <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>())
        self.yieldReserve <- emptyVault
    }
    
    // VaultInfo struct — backward-compatible with deployed on-chain version (no new fields)
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
        
        init(
            id: UInt64, name: String, balance: UFix64, status: String,
            lastExecution: UFix64?, isActive: Bool, strategy: String,
            strategyId: String, totalYieldAccrued: UFix64
        ) {
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
        
        init(owner: Address, name: String, strategyName: String, strategyIdentifier: String) {
            self.id = SentinelVaultFinal.totalVaults
            self.vaultOwner = owner
            self.name = name
            self.strategy = strategyName
            self.strategyId = strategyIdentifier
            self.isActive = true
            self.lastExecution = nil
            self.totalYieldAccrued = 0.0
            let emptyVault <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>())
            self.flowVault <- emptyVault
            
            SentinelVaultFinal.totalVaults = SentinelVaultFinal.totalVaults + 1
            
            MEVShieldCore.registerVaultMEV(
                vaultId: self.id,
                protectionLevel: 3,
                defaultSlippageBps: 300.0
            )
        }
        
        access(all) fun getID(): UInt64 { return self.id }
        access(all) fun getName(): String { return self.name }
        access(all) fun getStrategy(): String { return self.strategy }
        access(all) fun getStrategyId(): String { return self.strategyId }
        access(all) fun getBalance(): UFix64 { return self.flowVault.balance }
        access(all) fun getStatus(): String { return self.isActive ? "Active" : "Paused" }
        access(all) fun getLastExecution(): UFix64? { return self.lastExecution }
        access(all) fun getIsActive(): Bool { return self.isActive }
        access(all) fun getYieldAccrued(): UFix64 { return self.totalYieldAccrued }

        // MEV status computed dynamically from MEVShieldCore (no new stored fields)
        access(all) fun getProtectionLevel(): UInt8 {
            if let config = MEVShieldCore.getVaultMEVConfig(vaultId: self.id) {
                return config.protectionLevel
            }
            return 3
        }

        access(all) fun getSlippageBps(): UFix64 {
            if let config = MEVShieldCore.getVaultMEVConfig(vaultId: self.id) {
                return config.slippageBps
            }
            return 300.0
        }

        access(all) fun getMEVShieldStatus(): String {
            let level = self.getProtectionLevel()
            if level == UInt8(0) { return "DISABLED" }
            if level == UInt8(1) { return "BASIC-VRF" }
            if level == UInt8(2) { return "STANDARD-CR" }
            return "FULL-MEV-SHIELD"
        }

        // Phase 2: 0.1% protocol fee on every deposit auto-flows into yieldReserve.
        // This makes the reserve self-sustaining — real yield can be distributed.
        // Fee is only taken if deposit is above minimum threshold (0.01 FLOW).
        access(Deposit) fun deposit(from: @{FungibleToken.Vault}) {
            pre {
                self.isActive: "Vault is paused"
                from.balance >= 0.001: "Minimum deposit is 0.001 FLOW"
            }
            let grossAmount = from.balance

            // Calculate protocol fee (0.1% of deposit, zero if below threshold)
            var feeAmount: UFix64 = 0.0
            if grossAmount >= SentinelVaultFinal.getMinFeeThreshold() {
                feeAmount = grossAmount * SentinelVaultFinal.getProtocolFeeRate()
            }
            let netDeposit = grossAmount - feeAmount

            // Split: fee → yieldReserve, net → user's flowVault
            if feeAmount > 0.0 {
                let feeVault <- (from as! @FlowToken.Vault).withdraw(amount: feeAmount)
                SentinelVaultFinal.yieldReserve.deposit(from: <-feeVault)
                SentinelVaultFinal.totalFeesCollected = SentinelVaultFinal.totalFeesCollected + feeAmount
                emit ProtocolFeeCollected(
                    vaultId: self.id,
                    feeAmount: feeAmount,
                    newReserveBalance: SentinelVaultFinal.yieldReserve.balance
                )
            }

            self.flowVault.deposit(from: <-from)
            SentinelVaultFinal.totalValueLocked = SentinelVaultFinal.totalValueLocked + netDeposit
            emit DepositMade(vaultId: self.id, amount: netDeposit, feeCollected: feeAmount)
        }
        
        access(Withdraw) fun withdraw(amount: UFix64): @{FungibleToken.Vault} {
            pre {
                amount <= self.flowVault.balance: "Insufficient balance"
            }
            let withdrawnVault <- self.flowVault.withdraw(amount: amount)
            SentinelVaultFinal.totalValueLocked = SentinelVaultFinal.totalValueLocked - amount
            emit WithdrawalMade(vaultId: self.id, amount: amount)
            return <-withdrawnVault
        }

        access(Pause) fun emergencyPause() {
            self.isActive = false
            emit EmergencyPause(vaultId: self.id, owner: self.vaultOwner)
        }
        
        access(Resume) fun resume() {
            self.isActive = true
        }

        // Phase 1 Fix #4: clamp to actual vault balance — never panic on insufficient balance.
        // totalYieldAccrued tracks what the user is owed; the vault balance may be less
        // if the yield reserve was partially funded. Pay out what is available.
        access(Withdraw) fun claimYield(): @{FungibleToken.Vault} {
            pre {
                self.totalYieldAccrued > 0.0: "No yield to claim — execute a strategy first"
            }
            let owed = self.totalYieldAccrued
            // Clamp: never withdraw more than the vault actually holds
            let claimable = owed < self.flowVault.balance ? owed : self.flowVault.balance
            pre {
                claimable > 0.0: "Vault balance is zero — yield reserve may need funding"
            }
            let yieldVault <- self.flowVault.withdraw(amount: claimable)
            // Reduce accrued by what was actually paid; remainder stays pending
            self.totalYieldAccrued = owed - claimable
            SentinelVaultFinal.totalYieldDistributed = SentinelVaultFinal.totalYieldDistributed + claimable
            emit YieldClaimed(vaultId: self.id, amount: claimable, recipient: self.vaultOwner)
            return <-yieldVault
        }

        // ── MEV Administration ──
        access(all) fun setProtectionLevel(newLevel: UInt8) {
            pre { newLevel <= UInt8(3): "Invalid protection level (0-3)" }
            let currentSlippage = self.getSlippageBps()
            MEVShieldCore.registerVaultMEV(
                vaultId: self.id,
                protectionLevel: newLevel,
                defaultSlippageBps: currentSlippage
            )
            emit MEVShieldStatus(
                vaultId: self.id,
                protectionLevel: newLevel,
                layersActive: newLevel,
                protectionsTriggered: 0
            )
        }
        
        access(all) fun setSlippageBps(newSlippageBps: UFix64) {
            pre { newSlippageBps >= UFix64(10): "Slippage too low (min 0.1%)" }
            MEVShieldCore.updateVaultSlippageBps(
                vaultId: self.id,
                newSlippageBps: newSlippageBps
            )
        }

        // ── MEV-Protected Strategy Execution ──
        // performStrategy: auto-generates commit hash on-chain using revertibleRandom nonce.
        // Use this for the simplified single-transaction path (trigger_strategy_v2.cdc).
        access(StrategyExecution) fun performStrategy(executor: @{SentinelInterfaces.IStrategy}) {
            pre { self.isActive: "Vault is paused" }
            let currentBalance = self.flowVault.balance
            if currentBalance == 0.0 { destroy executor; return }

            let nonce = revertibleRandom<UInt64>()
            let deadlineBlock = getCurrentBlock().height + MEVShieldCore.getMEVCommitBlocks()
            // Phase 1 Fix: use real SHA3_256 hash
            let commitHash = MEVShieldCore.buildCommitHash(
                vaultId: self.id,
                nonce: nonce,
                amount: currentBalance,
                strategyId: self.strategyId,
                deadlineBlock: deadlineBlock,
                committer: self.vaultOwner
            )
            var expectedAPY = 0.0
            if let oracleData = YieldOracle.getYieldData(self.strategyId) {
                expectedAPY = oracleData.apy
            }
            MEVShieldCore.createCommit(
                vaultId: self.id,
                commitHash: commitHash,
                protectionLevel: self.getProtectionLevel(),
                committedBy: self.vaultOwner
            )
            self.executeWithMEVCheck(
                executor: <-executor,
                commitHash: commitHash,
                expectedAPY: expectedAPY,
                nonce: nonce,
                currentBalance: currentBalance
            )
        }

        // executeStrategyWithMEV: used by the two-step commit-reveal path (mev_reveal.cdc).
        // Caller has already committed the hash on-chain via mev_commit.cdc.
        access(StrategyExecution) fun executeStrategyWithMEV(
            executor: @{SentinelInterfaces.IStrategy},
            commitHash: [UInt8],
            expectedAPY: UFix64,
            nonce: UInt64
        ) {
            pre { self.isActive: "Vault is paused" }
            let currentBalance = self.flowVault.balance
            if currentBalance == 0.0 { destroy executor; return }
            self.executeWithMEVCheck(
                executor: <-executor,
                commitHash: commitHash,
                expectedAPY: expectedAPY,
                nonce: nonce,
                currentBalance: currentBalance
            )
        }
        
        access(self) fun executeWithMEVCheck(
            executor: @{SentinelInterfaces.IStrategy},
            commitHash: [UInt8],
            expectedAPY: UFix64,
            nonce: UInt64,
            currentBalance: UFix64
        ) {
            var protectionStatus = "MEV-SHIELD-ACTIVE|SHA3-HASH"
            var shouldAbort: Bool = false
            var abortReason: String = ""
            let mevConfig = MEVShieldCore.getVaultMEVConfig(vaultId: self.id)
            let crEnabled = mevConfig?.commitRevealEnabled ?? true
            let bdEnabled = mevConfig?.blockDelayEnabled ?? true
            let protectionLevel = mevConfig?.protectionLevel ?? 3
            let slippageBps = mevConfig?.slippageBps ?? 300.0
            let commitHashHex = MEVShieldCore.hashToHex(commitHash)

            // LAYER 1: COMMIT-REVEAL GUARD
            if crEnabled {
                if let commit = MEVShieldCore.getCommit(commitHashHex: commitHashHex) {
                    if commit.isRevealed {
                        protectionStatus = protectionStatus.concat("|CR-OK")
                    } else if commit.isExpired {
                        shouldAbort = true
                        abortReason = "MEV: commit expired — resubmit with new nonce"
                    } else {
                        shouldAbort = true
                        abortReason = "MEV: commit not yet revealed — call mev_reveal.cdc first"
                    }
                } else {
                    if protectionLevel >= UInt8(3) {
                        shouldAbort = true
                        abortReason = "MEV: Full protection requires prior commit — call mev_commit.cdc first"
                    } else {
                        protectionStatus = protectionStatus.concat("|CR-SKIP")
                    }
                }
            }

            if shouldAbort {
                emit MEVExecutionGuard(vaultId: self.id, deviation: 0.0, allowed: false, reason: abortReason)
                destroy executor
                return
            }

            // LAYER 2: VRF BLOCK-DELAY JITTER
            var jitterBlocks: UInt64 = 0
            if bdEnabled {
                jitterBlocks = revertibleRandom<UInt64>() % (MEVShieldCore.getMEVDelayMax() + UInt64(1))
                protectionStatus = protectionStatus.concat("|VRF-").concat(jitterBlocks.toString()).concat("blk")
                emit MEVBlockDelay(vaultId: self.id, jitterBlocks: jitterBlocks, executeAtBlock: getCurrentBlock().height + jitterBlocks)
            }

            // LAYER 3: PRICE DEVIATION GUARD (now uses correct OR logic)
            var actualOracleAPY = expectedAPY
            if let oracleData = YieldOracle.getYieldData(self.strategyId) {
                actualOracleAPY = oracleData.apy
            }
            if expectedAPY > 0.0 && actualOracleAPY > 0.0 {
                let oracleCheck = MEVShieldCore.checkPriceDeviation(
                    vaultId: self.id, expectedAPY: expectedAPY,
                    actualOracleAPY: actualOracleAPY, slippageBps: slippageBps
                )
                if !oracleCheck.shouldExecute {
                    emit MEVExecutionGuard(vaultId: self.id, deviation: oracleCheck.deviation, allowed: false, reason: oracleCheck.reason)
                    destroy executor
                    return
                }
                protectionStatus = protectionStatus.concat("|PG-OK(").concat(oracleCheck.deviation.toString()).concat(")")
            }

            // Phase 3: EXECUTE STRATEGY — now returns StrategyResult with full provenance
            let result = executor.executeStrategy(vaultBalance: currentBalance)
            let yieldAmount = result.yieldAmount

            if yieldAmount > 0.0 {
                let availableReserve = SentinelVaultFinal.yieldReserve.balance
                let actualDistribute = yieldAmount < availableReserve ? yieldAmount : availableReserve
                if actualDistribute > 0.0 {
                    let yieldSource <- SentinelVaultFinal.yieldReserve.withdraw(amount: actualDistribute)
                    self.flowVault.deposit(from: <-yieldSource)
                    self.totalYieldAccrued = self.totalYieldAccrued + actualDistribute
                }
                if actualDistribute < yieldAmount {
                    emit YieldReserveInsufficient(vaultId: self.id, requested: yieldAmount, available: availableReserve)
                }
            }
            self.lastExecution = getCurrentBlock().timestamp

            // LAYER 4: mark processed (removes from pending queue)
            MEVShieldCore.markExecutionProcessed(vaultId: self.id, commitHashHex: commitHashHex, yieldGenerated: yieldAmount)

            // Phase 3: emit rich StrategyExecuted with all provenance fields
            emit StrategyExecuted(
                vaultId: self.id,
                amount: currentBalance,
                yieldGenerated: yieldAmount,
                realYieldFromProtocol: yieldAmount,
                protocolSource: result.protocolSource,
                realizedAPY: result.realizedAPY,
                usedRealProtocol: result.usedRealProtocol,
                confidence: result.confidence,
                jitterApplied: jitterBlocks,
                mevShieldStatus: protectionStatus.concat("|").concat(result.executionNote)
            )

            destroy executor
        }
    }

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
            let id = vault.id
            let oldVault <- self.vaults[id] <- vault
            destroy oldVault
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
            let infos: [VaultInfo] = []
            for id in self.vaults.keys {
                let v = (&self.vaults[id] as &Vault?)!
                infos.append(VaultInfo(
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
            return infos
        }
    }

    // --- Contract-level admin functions ---
    // Contract-level pause is managed at the transaction layer via MultiSigAdmin.
    // Individual vaults have their own pause mechanism (emergencyPause/resume).
    access(all) fun getContractStatus(): String {
        return "OPERATIONAL"
    }

    access(all) fun fundYieldReserve(from: @{FungibleToken.Vault}) {
        let amount = from.balance
        self.yieldReserve.deposit(from: <-from)
        emit YieldReserveFunded(amount: amount, from: self.account.address, newReserveBalance: self.yieldReserve.balance)
    }

    access(all) fun fundYieldReserveWithAuth(from: @{FungibleToken.Vault}) {
        let amount = from.balance
        self.yieldReserve.deposit(from: <-from)
        emit YieldReserveFunded(amount: amount, from: self.account.address, newReserveBalance: self.yieldReserve.balance)
    }

    // Get current yield reserve balance
    access(all) fun getYieldReserveBalance(): UFix64 {
        return self.yieldReserve.balance
    }

    access(all) fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    // Create a new vault with strategy linkage — automatically registers MEV protection
    access(all) fun createVault(
        owner: Address,
        name: String,
        strategyName: String,
        strategyId: String,
        protectionLevel: UInt8,
        slippageBps: UFix64
    ): @Vault {
        pre {
            true: "Vault creation is always allowed"
        }
        let vault <- create Vault(
            owner: owner,
            name: name,
            strategyName: strategyName,
            strategyIdentifier: strategyId
        )
        
        vault.setProtectionLevel(newLevel: protectionLevel)
        vault.setSlippageBps(newSlippageBps: slippageBps)
        
        MEVShieldCore.registerVaultMEV(
            vaultId: vault.id,
            protectionLevel: protectionLevel,
            defaultSlippageBps: slippageBps
        )
        
        emit VaultCreated(
            id: vault.id,
            owner: owner,
            name: name,
            strategyId: strategyId,
            protectionLevel: protectionLevel
        )
        
        return <-vault
    }
    
    access(all) fun getTotalValueLocked(): UFix64 { return self.totalValueLocked }
    access(all) fun getTotalVaults(): UInt64 { return self.totalVaults }
    access(all) fun getTotalYieldDistributed(): UFix64 { return self.totalYieldDistributed }
    access(all) fun getTotalFeesCollected(): UFix64 { return self.totalFeesCollected }
    access(all) fun getProtocolFeeRateBps(): UFix64 { return self.getProtocolFeeRate() * 10000.0 }

    // Phase 2: Comprehensive protocol stats — used by GET_PROTOCOL_STATS script
    access(all) fun getProtocolStats(): {String: AnyStruct} {
        return {
            "totalVaults": self.totalVaults,
            "totalValueLocked": self.totalValueLocked,
            "totalYieldDistributed": self.totalYieldDistributed,
            "totalFeesCollected": self.totalFeesCollected,
            "yieldReserveBalance": self.yieldReserve.balance,
            "protocolFeeRateBps": self.getProtocolFeeRate() * 10000.0,
            "contractStatus": self.getContractStatus(),
            // Reserve health thresholds (in FLOW)
            "reserveHealthCritical": 10.0,   // < 10 FLOW = critical
            "reserveHealthWarning": 100.0,   // < 100 FLOW = warning
            "reserveHealthGood": 100.0,      // >= 100 FLOW = good
            "reserveStatus": self.yieldReserve.balance < 10.0
                ? "CRITICAL"
                : self.yieldReserve.balance < 100.0
                    ? "WARNING"
                    : "HEALTHY"
        }
    }

    access(all) fun getGlobalMEVStats(): {String: AnyStruct} {
        return MEVShieldCore.getMEVStats()
    }
}
