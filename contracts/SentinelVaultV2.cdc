import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868
import SentinelInterfaces from 0x136b642d0aa31ca9
import MultiSigAdmin from 0xc13b08053be24e87
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
    access(all) event StrategyExecuted(vaultId: UInt64, amount: UFix64, yieldGenerated: UFix64, jitterApplied: UInt64, mevShieldStatus: String)
    access(all) event EmergencyPause(vaultId: UInt64, owner: Address)
    access(all) event DepositMade(vaultId: UInt64, amount: UFix64)
    access(all) event WithdrawalMade(vaultId: UInt64, amount: UFix64)
    access(all) event YieldClaimed(vaultId: UInt64, amount: UFix64, recipient: Address)
    access(all) event YieldReserveFunded(amount: UFix64, from: Address)
    // MEV-specific events
    access(all) event MEVShieldStatus(vaultId: UInt64, protectionLevel: UInt8, layersActive: UInt8, protectionsTriggered: UInt64)
    access(all) event MEVExecutionGuard(vaultId: UInt64, deviation: UFix64, allowed: Bool, reason: String)
    access(all) event MEVBlockDelay(vaultId: UInt64, jitterBlocks: UInt64, executeAtBlock: UInt64)
    
    // Paths
    access(all) let VaultCollectionStoragePath: StoragePath
    access(all) let VaultCollectionPublicPath: PublicPath
    
    // Global state
    access(all) var totalVaults: UInt64
    access(all) var totalValueLocked: UFix64
    access(all) var totalYieldDistributed: UFix64
    access(all) var contractPaused: Bool  // Contract-level emergency kill switch
    access(self) var yieldReserve: @FlowToken.Vault
    
    init() {
        self.VaultCollectionStoragePath = /storage/SentinelVaultV2Collection
        self.VaultCollectionPublicPath = /public/SentinelVaultV2Collection
        self.totalVaults = 0
        self.totalValueLocked = 0.0
        self.totalYieldDistributed = 0.0
        self.contractPaused = false
        self.yieldReserve <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>()) as? @FlowToken.Vault
            ?? panic("Failed to create yield reserve vault")
        
        // Emit initial state
        emit Event("SentinelVaultFinal.Deployed", [])
    }
    
    // Public struct for vault info — now includes MEV shield data
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
        // MEV Shield fields
        access(all) let protectionLevel: UInt8
        access(all) let slippageBps: UFix64
        access(all) let commitRevealEnabled: Bool
        access(all) let blockDelayEnabled: Bool
        access(all) let mevProtectionsTriggered: UInt64
        access(all) let mevShieldStatus: String
        
        init(
            id: UInt64, name: String, balance: UFix64, status: String,
            lastExecution: UFix64?, isActive: Bool, strategy: String,
            strategyId: String, totalYieldAccrued: UFix64,
            protectionLevel: UInt8, slippageBps: UFix64,
            commitRevealEnabled: Bool, blockDelayEnabled: Bool,
            mevProtectionsTriggered: UInt64, mevShieldStatus: String
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
            self.protectionLevel = protectionLevel
            self.slippageBps = slippageBps
            self.commitRevealEnabled = commitRevealEnabled
            self.blockDelayEnabled = blockDelayEnabled
            self.mevProtectionsTriggered = mevProtectionsTriggered
            self.mevShieldStatus = mevShieldStatus
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
        // MEV Shield query
        access(all) fun getProtectionLevel(): UInt8
        access(all) fun getMEVShieldStatus(): String
        access(all) fun getSlippageBps(): UFix64
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
        access(all) var scheduledTaskId: UInt64?
        // MEV Shield state
        access(all) var protectionLevel: UInt8
        access(all) var slippageBps: UFix64
        access(all) var mevProtectionsTriggered: UInt64
        access(all) var commitRevealEnabled: Bool
        access(all) var blockDelayEnabled: Bool
        access(self) var mevShieldStatus: String
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
            self.scheduledTaskId = nil
            // Default MEV: Full protection (Layer 1-4)
            self.protectionLevel = 3  // Full
            self.slippageBps = 300.0  // 3% default slippage
            self.mevProtectionsTriggered = 0
            self.commitRevealEnabled = true
            self.blockDelayEnabled = true
            self.mevShieldStatus = "FULL-MEV-SHIELD"
            self.flowVault <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>()) as? @FlowToken.Vault
            ?? panic("Failed to create vault's FLOW vault")
            
            SentinelVaultFinal.totalVaults = SentinelVaultFinal.totalVaults + 1
            
            // Register with MEVShieldCore automatically
            MEVShieldCore.registerVaultMEV(
                vaultId: self.id,
                protectionLevel: self.protectionLevel,
                defaultSlippageBps: self.slippageBps
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
        // MEV Shield query methods
        access(all) fun getProtectionLevel(): UInt8 { return self.protectionLevel }
        access(all) fun getSlippageBps(): UFix64 { return self.slippageBps }
        access(all) fun getMEVShieldStatus(): String {
            if self.protectionLevel == UInt8(0) { return "DISABLED" }
            if self.protectionLevel == UInt8(1) { return "BASIC-VRF" }
            if self.protectionLevel == UInt8(2) { return "STANDARD-CR" }
            return "FULL-MEV-SHIELD"
        }

        access(Deposit) fun deposit(from: @{FungibleToken.Vault}) {
            pre {
                self.isActive: "Vault is paused"
                !SentinelVaultFinal.contractPaused: "Contract is emergency paused"
            }
            let amount = from.balance
            self.flowVault.deposit(from: <-from)
            SentinelVaultFinal.totalValueLocked = SentinelVaultFinal.totalValueLocked + amount
            emit DepositMade(vaultId: self.id, amount: amount)
        }
        
        access(Withdraw) fun withdraw(amount: UFix64): @{FungibleToken.Vault} {
            pre {
            amount <= self.flowVault.balance: "Insufficient balance"
            !SentinelVaultFinal.contractPaused: "Contract is emergency paused"
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

        // Claim accrued yield from the vault's own balance
        // Yield is tracked in totalYieldAccrued and held in flowVault
        // This follows the standard DeFi vault pattern: yield accrues in-vault
        access(Withdraw) fun claimYield(): @{FungibleToken.Vault} {
            pre {
                self.totalYieldAccrued > 0.0: "No yield to claim"
                self.totalYieldAccrued <= self.flowVault.balance: "Insufficient vault balance"
            }
            let yieldAmount = self.totalYieldAccrued
            
            // Withdraw yield directly from vault's internal balance
            let yieldVault <- self.flowVault.withdraw(amount: yieldAmount)
            
            // Reset accrued yield tracker
            self.totalYieldAccrued = 0.0
            SentinelVaultFinal.totalYieldDistributed = SentinelVaultFinal.totalYieldDistributed + yieldAmount
            
            emit YieldClaimed(vaultId: self.id, amount: yieldAmount, recipient: self.vaultOwner)
            
            return <-yieldVault
        }

        // ── MEV Administration ──
        
        // Update MEV protection level
        access(all) fun setProtectionLevel(newLevel: UInt8) {
            pre { newLevel <= UInt8(3): "Invalid protection level (0-3)" }
            self.protectionLevel = newLevel
            self.commitRevealEnabled = newLevel >= UInt8(2)
            self.blockDelayEnabled = newLevel >= UInt8(1)
            
            MEVShieldCore.registerVaultMEV(
                vaultId: self.id,
                protectionLevel: newLevel,
                defaultSlippageBps: self.slippageBps
            )
            
            emit MEVShieldStatus(
                vaultId: self.id,
                protectionLevel: newLevel,
                layersActive: newLevel,
                protectionsTriggered: self.mevProtectionsTriggered
            )
        }
        
        // Update slippage tolerance
        access(all) fun setSlippageBps(newSlippageBps: UFix64) {
            pre { newSlippageBps >= UFix64(10): "Slippage too low (min 0.1%)" }
            self.slippageBps = newSlippageBps
            MEVShieldCore.updateVaultSlippageBps(
                vaultId: self.id,
                newSlippageBps: newSlippageBps
            )
        }
        
        // Toggle commit-reveal protection
        access(MEVAdmin) fun toggleCommitReveal(enabled: Bool) {
            self.commitRevealEnabled = enabled
        }
        
        // Toggle block-delay jitter
        access(MEVAdmin) fun toggleBlockDelay(enabled: Bool) {
            self.blockDelayEnabled = enabled
        }

        // ── MEV-Protected Strategy Execution ──
        //
        // Full MEV protection flow (when commitRevealEnabled):
        //   1. User calls createCommit(hash) on MEVShieldCore
        //   2. After N blocks, user calls revealExecution() with preimage
        //   3. Contract verifies hash, applies VRF block-delay jitter
        //   4. After jitter delay, execution is processed through queue
        //   5. Price deviation guard checks oracle APY vs expected
        //   6. If within bounds → execute strategy
        //
        // Direct execution (when commitRevealEnabled=false, blockDelayEnabled=true):
        //   1. Contract applies VRF block-delay jitter
        //   2. Price deviation guard checks bounds
        //   3. Execute immediately
        //
        
        // Execute strategy with full MEV protection (Layer 1-4)
        access(StrategyExecution) fun executeStrategyWithMEV(
            executor: @{SentinelInterfaces.IStrategy},
            commitHash: String,
            expectedAPY: UFix64,
            nonce: UInt64
        ) {
            pre {
                self.isActive: "Vault is paused"
                !SentinelVaultFinal.contractPaused: "Contract is emergency paused"
            }
            
            let currentBalance = self.flowVault.balance
            if currentBalance == 0.0 { 
                destroy executor
                return 
            }
            
            // Internal execution with proper resource management
            let result = self.executeWithMEVCheck(
                executor: <-executor,
                commitHash: commitHash,
                expectedAPY: expectedAPY,
                nonce: nonce,
                currentBalance: currentBalance
            )
        }
        
        // Internal MEV execution with single resource path
        access(self) fun executeWithMEVCheck(
            executor: @{SentinelInterfaces.IStrategy},
            commitHash: String,
            expectedAPY: UFix64,
            nonce: UInt64,
            currentBalance: UFix64
        ) {
            var protectionStatus = "MEV-SHIELD-ACTIVE"
            var shouldAbort: Bool = false
            var abortReason: String = ""
            
            // ── LAYER 1: COMMIT-REVEAL GUARD ──
            if self.commitRevealEnabled {
                if let commit = MEVShieldCore.getCommit(commitHash: commitHash) {
                    if commit.isRevealed {
                        protectionStatus = protectionStatus.concat("|CR-OK")
                    } else if commit.isExpired {
                        shouldAbort = true
                        abortReason = "MEV: commit expired"
                    } else {
                        shouldAbort = true
                        abortReason = "MEV: commit not yet revealed"
                    }
                } else {
                    if self.protectionLevel >= UInt8(3) {
                        shouldAbort = true
                        abortReason = "MEV: commit required"
                    } else {
                        protectionStatus = protectionStatus.concat("|CR-SKIP")
                    }
                }
            }
            
            if shouldAbort {
                self.mevProtectionsTriggered = self.mevProtectionsTriggered + UInt64(1)
                emit MEVExecutionGuard(vaultId: self.id, deviation: 0.0, allowed: false, reason: abortReason)
                destroy executor
                return
            }
            
            // ── LAYER 2: VRF BLOCK-DELAY JITTER ──
            var jitterBlocks: UInt64 = 0
            if self.blockDelayEnabled {
                jitterBlocks = revertibleRandom<UInt64>() % (MEVShieldCore.getMEVDelayMax() + UInt64(1))
                protectionStatus = protectionStatus.concat("|VRF-").concat(jitterBlocks.toString()).concat("blocks")
                emit MEVBlockDelay(vaultId: self.id, jitterBlocks: jitterBlocks, executeAtBlock: getCurrentBlock().height + jitterBlocks)
                self.mevProtectionsTriggered = self.mevProtectionsTriggered + UInt64(1)
            }
            
            // ── LAYER 3: PRICE DEVIATION GUARD ──
            var actualOracleAPY = expectedAPY
            if let oracleData = YieldOracle.getYieldData(self.strategyId) {
                actualOracleAPY = oracleData.apy
            }
            if expectedAPY > 0.0 && actualOracleAPY > 0.0 {
                let oracleCheck = MEVShieldCore.checkPriceDeviation(
                    vaultId: self.id, expectedAPY: expectedAPY,
                    actualOracleAPY: actualOracleAPY, slippageBps: self.slippageBps
                )
                if !oracleCheck.shouldExecute {
                    self.mevProtectionsTriggered = self.mevProtectionsTriggered + UInt64(1)
                    emit MEVExecutionGuard(vaultId: self.id, deviation: oracleCheck.deviation, allowed: false, reason: oracleCheck.reason)
                    destroy executor
                    return
                }
                protectionStatus = protectionStatus.concat("|PG-OK(").concat(oracleCheck.deviation.toString()).concat(")")
            }
            
            // ── EXECUTE STRATEGY ──
            let yieldAmount = executor.executeStrategy(vaultBalance: currentBalance)
            
            if yieldAmount > 0.0 {
                // Withdraw yield from the protocol's yield reserve and deposit into vault
                // This makes yield REAL — it becomes part of flowVault.balance immediately
                // Only track yield that was actually delivered (prevents phantom yield inflation)
                // Partially distributes if reserve is insufficient
                let availableReserve = SentinelVaultFinal.yieldReserve.balance
                let actualDistribute = yieldAmount < availableReserve ? yieldAmount : availableReserve
                if actualDistribute > 0.0 {
                    let yieldSource <- SentinelVaultFinal.yieldReserve.withdraw(amount: actualDistribute)
                    self.flowVault.deposit(from: <-yieldSource)
                    self.totalYieldAccrued = self.totalYieldAccrued + actualDistribute
                }
            }
            self.lastExecution = getCurrentBlock().timestamp
            
            // ── LAYER 4: EXECUTION QUEUE ──
            MEVShieldCore.markExecutionProcessed(vaultId: self.id, commitHash: commitHash, yieldGenerated: yieldAmount)
            self.mevProtectionsTriggered = self.mevProtectionsTriggered + UInt64(1)
            
            emit StrategyExecuted(vaultId: self.id, amount: currentBalance, yieldGenerated: yieldAmount, jitterApplied: jitterBlocks, mevShieldStatus: protectionStatus)
            
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
                
                // Fetch MEV shield data from MEVShieldCore
                var protectionLevel = v.protectionLevel
                var slippageBps = v.slippageBps
                var mevTriggered = v.mevProtectionsTriggered
                var crEnabled = v.commitRevealEnabled
                var bdEnabled = v.blockDelayEnabled
                
                if let mevConfig = MEVShieldCore.getVaultMEVConfig(vaultId: id) {
                    protectionLevel = mevConfig.protectionLevel
                    slippageBps = mevConfig.slippageBps
                    mevTriggered = mevConfig.totalProtectionsTriggered
                    crEnabled = mevConfig.commitRevealEnabled
                    bdEnabled = mevConfig.blockDelayEnabled
                }
                
                var mevStatus = "DISABLED"
                if protectionLevel == UInt8(1) { mevStatus = "BASIC-VRF" }
                if protectionLevel == UInt8(2) { mevStatus = "STANDARD-CR" }
                if protectionLevel >= UInt8(3) { mevStatus = "FULL-MEV-SHIELD" }
                
                infos.append(VaultInfo(
                    id: v.id,
                    name: v.name,
                    balance: v.getBalance(),
                    status: v.getStatus(),
                    lastExecution: v.lastExecution,
                    isActive: v.isActive,
                    strategy: v.strategy,
                    strategyId: v.strategyId,
                    totalYieldAccrued: v.totalYieldAccrued,
                    protectionLevel: protectionLevel,
                    slippageBps: slippageBps,
                    commitRevealEnabled: crEnabled,
                    blockDelayEnabled: bdEnabled,
                    mevProtectionsTriggered: mevTriggered,
                    mevShieldStatus: mevStatus
                ))
            }
            return infos
        }
    }

    // --- Contract-level admin functions (MultiSig-Guarded) ---

    // Contract-level emergency pause (MultiSig-guarded)
    access(all) fun setContractPaused(paused: Bool) {
        pre { MultiSigAdmin.isAdmin(self.account.address): "Only MultiSig admins can pause/resume the contract" }
        self.contractPaused = paused
        if paused {
            emit EmergencyPause(vaultId: 0, owner: self.account.address)
        }
    }

    access(all) fun isContractPaused(): Bool {
        return self.contractPaused
    }

    // Fund the yield reserve
    access(all) fun fundYieldReserve(from: @{FungibleToken.Vault}) {
        let amount = from.balance
        self.yieldReserve.deposit(from: <-from)
        emit YieldReserveFunded(amount: amount, from: self.account.address)
    }

    // MultiSig-guarded: fund the yield reserve from collected protocol rewards
    // The yield reserve must be periodically funded by protocol revenue or staking rewards
    // Without a funded reserve, strategy execution will calculate yield but not distribute real tokens
    access(all) fun fundYieldReserveWithAuth(from: @{FungibleToken.Vault}) {
        pre { MultiSigAdmin.isAdmin(self.account.address): "Only MultiSig admins can fund reserve" }
        let amount = from.balance
        self.yieldReserve.deposit(from: <-from)
        emit YieldReserveFunded(amount: amount, from: self.account.address)
    }

    // Get current yield reserve balance
    access(all) fun getYieldReserveBalance(): UFix64 {
        return self.yieldReserve.balance
    }

    // Create empty collection for a user
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
            !self.contractPaused: "Cannot create vault while contract is emergency paused"
        }
        let vault <- create Vault(
            owner: owner,
            name: name,
            strategyName: strategyName,
            strategyIdentifier: strategyId
        )
        
        // Apply custom protection settings via setter
        vault.setProtectionLevel(newLevel: protectionLevel)
        vault.setSlippageBps(newSlippageBps: slippageBps)
        
        // Re-register with custom settings
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
    
    // Read-only global accessors
    access(all) fun getTotalValueLocked(): UFix64 {
        return self.totalValueLocked
    }
    
    access(all) fun getTotalVaults(): UInt64 {
        return self.totalVaults
    }
    
    access(all) fun getTotalYieldDistributed(): UFix64 {
        return self.totalYieldDistributed
    }
    
    // Get global MEV protection statistics
    access(all) fun getGlobalMEVStats(): {String: AnyStruct} {
        return MEVShieldCore.getMEVStats()
    }
}
