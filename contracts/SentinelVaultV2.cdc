import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868
import SentinelInterfaces from 0xc13b08053be24e87

access(all) contract SentinelVaultFinal {
    
    // Entitlements
    access(all) entitlement Deposit
    access(all) entitlement Withdraw
    access(all) entitlement Pause
    access(all) entitlement Resume
    access(all) entitlement StrategyExecution
    
    // Events
    access(all) event VaultCreated(id: UInt64, owner: Address, name: String, strategyId: String)
    access(all) event StrategyExecuted(vaultId: UInt64, amount: UFix64, yieldGenerated: UFix64, jitterApplied: UInt64)
    access(all) event EmergencyPause(vaultId: UInt64, owner: Address)
    access(all) event DepositMade(vaultId: UInt64, amount: UFix64)
    access(all) event WithdrawalMade(vaultId: UInt64, amount: UFix64)
    access(all) event YieldClaimed(vaultId: UInt64, amount: UFix64, recipient: Address)
    access(all) event YieldReserveFunded(amount: UFix64, from: Address)
    
    // Paths
    access(all) let VaultCollectionStoragePath: StoragePath
    access(all) let VaultCollectionPublicPath: PublicPath
    
    // Global state
    access(all) var totalVaults: UInt64
    access(all) var totalValueLocked: UFix64
    access(all) var totalYieldDistributed: UFix64
    access(self) var yieldReserve: @FlowToken.Vault
    
    init() {
        self.VaultCollectionStoragePath = /storage/SentinelVaultV2Collection
        self.VaultCollectionPublicPath = /public/SentinelVaultV2Collection
        self.totalVaults = 0
        self.totalValueLocked = 0.0
        self.totalYieldDistributed = 0.0
        self.yieldReserve <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>()) as! @FlowToken.Vault
    }
    
    // Public struct for vault info
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
        
        init(id: UInt64, name: String, balance: UFix64, status: String, lastExecution: UFix64?, isActive: Bool, strategy: String, strategyId: String, totalYieldAccrued: UFix64) {
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
        access(all) var scheduledTaskId: UInt64?
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
            self.flowVault <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>()) as! @FlowToken.Vault
            
            SentinelVaultFinal.totalVaults = SentinelVaultFinal.totalVaults + 1
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

        access(Deposit) fun deposit(from: @{FungibleToken.Vault}) {
            pre { self.isActive: "Vault is paused" }
            let amount = from.balance
            self.flowVault.deposit(from: <-from)
            SentinelVaultFinal.totalValueLocked = SentinelVaultFinal.totalValueLocked + amount
            emit DepositMade(vaultId: self.id, amount: amount)
        }
        
        access(Withdraw) fun withdraw(amount: UFix64): @{FungibleToken.Vault} {
            pre { amount <= self.flowVault.balance: "Insufficient balance" }
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

        // Claim accrued yield from the protocol's yield reserve
        access(Withdraw) fun claimYield(): @{FungibleToken.Vault} {
            pre {
                self.totalYieldAccrued > 0.0: "No yield to claim"
                self.totalYieldAccrued <= SentinelVaultFinal.yieldReserve.balance: "Yield reserve insufficient"
            }
            let yieldAmount = self.totalYieldAccrued
            
            // Transfer yield from protocol reserve to user
            let yieldVault <- SentinelVaultFinal.yieldReserve.withdraw(amount: yieldAmount)
            
            // Reset accrued yield tracker
            self.totalYieldAccrued = 0.0
            SentinelVaultFinal.totalYieldDistributed = SentinelVaultFinal.totalYieldDistributed + yieldAmount
            
            emit YieldClaimed(vaultId: self.id, amount: yieldAmount, recipient: self.vaultOwner)
            
            return <-yieldVault
        }

        // Autonomous Strategy Execution - gated by StrategyExecution entitlement
        access(StrategyExecution) fun performStrategy(executor: @{SentinelInterfaces.IStrategy}) {
            pre { self.isActive: "Vault is paused" }
            
            let currentBalance = self.flowVault.balance
            if currentBalance == 0.0 { 
                destroy executor
                return 
            }

            // Execute the linked strategy through its IStrategy interface
            let yieldAmount = executor.executeStrategy(vaultBalance: currentBalance)
            
            // Calculate VRF jitter for MEV protection (tracked but not used to delay)
            let jitter = UInt64(revertibleRandom<UInt64>() % 100)
            
            // Accrue yield to the vault (will be claimable from yield reserve)
            if yieldAmount > 0.0 {
                self.totalYieldAccrued = self.totalYieldAccrued + yieldAmount
            }
            
            self.lastExecution = getCurrentBlock().timestamp
            
            emit StrategyExecuted(vaultId: self.id, amount: currentBalance, yieldGenerated: yieldAmount, jitterApplied: jitter)
            
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

        access(all) fun borrowVaultPriv(id: UInt64): auth(Deposit, Withdraw, Pause, Resume, StrategyExecution) &Vault? {
            return &self.vaults[id] as auth(Deposit, Withdraw, Pause, Resume, StrategyExecution) &Vault?
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

    // Fund the yield reserve so users can claim their accrued yield
    access(all) fun fundYieldReserve(from: @{FungibleToken.Vault}) {
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

    // Create a new vault with strategy linkage
    access(all) fun createVault(owner: Address, name: String, strategyName: String, strategyId: String): @Vault {
        let vault <- create Vault(owner: owner, name: name, strategyName: strategyName, strategyIdentifier: strategyId)
        emit VaultCreated(id: vault.id, owner: owner, name: name, strategyId: strategyId)
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
}
