import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868

access(all) contract SentinelVault {
    
    // Entitlements
    access(all) entitlement Deposit
    access(all) entitlement Withdraw
    access(all) entitlement Pause
    access(all) entitlement Resume
    
    // Events
    access(all) event VaultCreated(id: UInt64, owner: Address, name: String)
    access(all) event StrategyExecuted(vaultId: UInt64, amount: UFix64, jitterApplied: UInt64)
    access(all) event EmergencyPause(vaultId: UInt64, owner: Address)
    access(all) event DepositMade(vaultId: UInt64, amount: UFix64)
    access(all) event WithdrawalMade(vaultId: UInt64, amount: UFix64)
    
    // Paths
    access(all) let VaultCollectionStoragePath: StoragePath
    access(all) let VaultCollectionPublicPath: PublicPath
    
    // Global state
    access(all) var totalVaults: UInt64
    access(all) var totalValueLocked: UFix64
    
    init() {
        self.VaultCollectionStoragePath = /storage/SentinelVaultCollection
        self.VaultCollectionPublicPath = /public/SentinelVaultCollection
        self.totalVaults = 0
        self.totalValueLocked = 0.0
    }
    
    // Public interface for vault info
    access(all) struct VaultInfo {
        access(all) let id: UInt64
        access(all) let name: String
        access(all) let balance: UFix64
        access(all) let status: String
        access(all) let lastExecution: UFix64?
        access(all) let isActive: Bool
        access(all) let strategy: String
        
        init(id: UInt64, name: String, balance: UFix64, status: String, lastExecution: UFix64?, isActive: Bool, strategy: String) {
            self.id = id
            self.name = name
            self.balance = balance
            self.status = status
            self.lastExecution = lastExecution
            self.isActive = isActive
            self.strategy = strategy
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
    }
    
    access(all) resource Vault: VaultPublic {
        access(all) let id: UInt64
        access(all) let vaultOwner: Address
        access(all) var name: String
        access(all) var balance: UFix64
        access(all) var isActive: Bool
        access(all) var strategy: String
        access(all) var lastExecution: UFix64?
        access(all) var scheduledTaskId: UInt64?
        access(self) var flowVault: @FlowToken.Vault
        
        init(owner: Address, name: String, strategy: String) {
            self.id = SentinelVault.totalVaults
            self.vaultOwner = owner
            self.name = name
            self.strategy = strategy
            self.balance = 0.0
            self.isActive = true
            self.lastExecution = nil
            self.scheduledTaskId = nil
            self.flowVault <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>()) as! @FlowToken.Vault
            
            SentinelVault.totalVaults = SentinelVault.totalVaults + 1
        }
        
        access(all) fun getID(): UInt64 { return self.id }
        access(all) fun getName(): String { return self.name }
        access(all) fun getStrategy(): String { return self.strategy }
        access(all) fun getBalance(): UFix64 { return self.flowVault.balance }
        access(all) fun getStatus(): String { return self.isActive ? "Active" : "Paused" }
        access(all) fun getLastExecution(): UFix64? { return self.lastExecution }
        access(all) fun getIsActive(): Bool { return self.isActive }

        access(Deposit) fun deposit(from: @{FungibleToken.Vault}) {
            pre { self.isActive: "Vault is paused" }
            let amount = from.balance
            self.flowVault.deposit(from: <-from)
            self.balance = self.flowVault.balance
            SentinelVault.totalValueLocked = SentinelVault.totalValueLocked + amount
            emit DepositMade(vaultId: self.id, amount: amount)
        }
        
        access(Withdraw) fun withdraw(amount: UFix64): @{FungibleToken.Vault} {
            pre { amount <= self.flowVault.balance: "Insufficient balance" }
            let withdrawnVault <- self.flowVault.withdraw(amount: amount)
            self.balance = self.flowVault.balance
            SentinelVault.totalValueLocked = SentinelVault.totalValueLocked - amount
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

        access(all) fun borrowVaultPriv(id: UInt64): auth(Deposit, Withdraw, Pause, Resume) &Vault? {
            return &self.vaults[id] as auth(Deposit, Withdraw, Pause, Resume) &Vault?
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
                    strategy: v.strategy
                ))
            }
            return infos
        }
    }

    access(all) fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    access(all) fun createVault(owner: Address, name: String, strategy: String): @Vault {
        let vault <- create Vault(owner: owner, name: name, strategy: strategy)
        emit VaultCreated(id: vault.id, owner: owner, name: name)
        return <-vault
    }
}