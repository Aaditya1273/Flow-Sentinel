// ── Cadence Transaction Scripts ──
// State-changing transactions. All import addresses resolved via ${...} template.
// Phase 1 Fix: TRIGGER_STRATEGY uses [UInt8] SHA3-256 commit hash via mev-hash.ts helper.

import {
  SENTINEL_VAULT_ADDRESS,
  SENTINEL_INTERFACES_ADDRESS,
  STRATEGY_REGISTRY_ADDRESS,
  LIQUID_STAKING_STRATEGY_ADDRESS,
  YIELD_FARMING_STRATEGY_ADDRESS,
  ARBITRAGE_STRATEGY_ADDRESS,
  FLOW_TOKEN_ADDRESS,
  FUNGIBLE_TOKEN_ADDRESS,
} from 'lib/addresses'

export const DEPOSIT_TO_VAULT = `
import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}
import FlowToken from ${FLOW_TOKEN_ADDRESS}
import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}

transaction(vaultId: UInt64, amount: UFix64) {
    let flowVault: @{FungibleToken.Vault}
    let vaultRef: auth(SentinelVaultFinal.Deposit) &SentinelVaultFinal.Vault
    
    prepare(signer: auth(FungibleToken.Withdraw, BorrowValue) &Account) {
        let flowVaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow vault reference")
        self.flowVault <- flowVaultRef.withdraw(amount: amount)
        
        let collection = signer.storage.borrow<&SentinelVaultFinal.Collection>(from: SentinelVaultFinal.VaultCollectionStoragePath)
            ?? panic("Could not borrow collection reference")
        self.vaultRef = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Could not borrow vault reference")
    }
    
    execute {
        self.vaultRef.deposit(from: <-self.flowVault)
    }
}
`

export const WITHDRAW_FROM_VAULT = `
import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}
import FlowToken from ${FLOW_TOKEN_ADDRESS}
import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}

transaction(vaultId: UInt64, amount: UFix64) {
    let vaultResource: auth(SentinelVaultFinal.Withdraw) &SentinelVaultFinal.Vault
    let flowVaultRef: &{FungibleToken.Receiver}
    
    prepare(signer: auth(BorrowValue) &Account) {
        let collection = signer.storage.borrow<&SentinelVaultFinal.Collection>(from: SentinelVaultFinal.VaultCollectionStoragePath)
            ?? panic("Could not borrow collection reference")
        self.vaultResource = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Could not borrow vault reference")
        
        self.flowVaultRef = signer.capabilities.borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            ?? panic("Could not borrow Flow receiver")
    }
    
    execute {
        let withdrawnTokens <- self.vaultResource.withdraw(amount: amount)
        self.flowVaultRef.deposit(from: <-withdrawnTokens)
    }
}
`

export const PAUSE_VAULT = `
import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}

transaction(vaultId: UInt64) {
    let vaultRef: auth(SentinelVaultFinal.Pause) &SentinelVaultFinal.Vault
    
    prepare(signer: auth(BorrowValue) &Account) {
        let collection = signer.storage.borrow<&SentinelVaultFinal.Collection>(from: SentinelVaultFinal.VaultCollectionStoragePath)
            ?? panic("Could not borrow collection reference")
        self.vaultRef = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Could not borrow vault reference")
    }
    
    execute {
        self.vaultRef.emergencyPause()
    }
}
`

export const RESUME_VAULT = `
import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}

transaction(vaultId: UInt64) {
    let vaultRef: auth(SentinelVaultFinal.Resume) &SentinelVaultFinal.Vault
    
    prepare(signer: auth(BorrowValue) &Account) {
        let collection = signer.storage.borrow<&SentinelVaultFinal.Collection>(from: SentinelVaultFinal.VaultCollectionStoragePath)
            ?? panic("Could not borrow collection reference")
        self.vaultRef = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Could not borrow vault reference")
    }
    
    execute {
        self.vaultRef.resume()
    }
}
`

export const CREATE_VAULT_WITH_STRATEGY = `
import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}
import StrategyRegistry from ${STRATEGY_REGISTRY_ADDRESS}
import MEVShieldCore from ${SENTINEL_VAULT_ADDRESS}
import FlowToken from ${FLOW_TOKEN_ADDRESS}
import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}

transaction(strategyId: String, vaultName: String, initialDeposit: UFix64) {
    let collectionRef: &SentinelVaultFinal.Collection
    let flowVault: @{FungibleToken.Vault}
    
    prepare(signer: auth(BorrowValue, Storage, Capabilities) &Account) {
        if let existing = signer.storage.type(at: SentinelVaultFinal.VaultCollectionStoragePath) {
            if existing != Type<@SentinelVaultFinal.Collection>() {
                let old <- signer.storage.load<@AnyResource>(from: SentinelVaultFinal.VaultCollectionStoragePath)
                destroy old
                signer.capabilities.unpublish(SentinelVaultFinal.VaultCollectionPublicPath)
            }
        }

        if signer.storage.borrow<&SentinelVaultFinal.Collection>(from: SentinelVaultFinal.VaultCollectionStoragePath) == nil {
            let collection <- SentinelVaultFinal.createEmptyCollection()
            signer.storage.save(<-collection, to: SentinelVaultFinal.VaultCollectionStoragePath)
        }
        
        signer.capabilities.unpublish(SentinelVaultFinal.VaultCollectionPublicPath)
        let cap = signer.capabilities.storage.issue<&{SentinelVaultFinal.CollectionPublic}>(SentinelVaultFinal.VaultCollectionStoragePath)
        signer.capabilities.publish(cap, at: SentinelVaultFinal.VaultCollectionPublicPath)
        
        self.collectionRef = signer.storage.borrow<&SentinelVaultFinal.Collection>(from: SentinelVaultFinal.VaultCollectionStoragePath)
            ?? panic("Could not borrow collection reference")
        
        let flowVaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow vault reference")
        
        self.flowVault <- flowVaultRef.withdraw(amount: initialDeposit)
    }
    
    execute {
        let strategyInfo = StrategyRegistry.getStrategy(strategyId: strategyId) ?? panic("Strategy not found")
        let strategyName = strategyInfo["name"] as! String
        
        let vault <- SentinelVaultFinal.createVault(
            owner: signer.address,
            name: vaultName,
            strategyName: strategyName,
            strategyId: strategyId,
            protectionLevel: 3,
            slippageBps: 300.0
        )
        vault.deposit(from: <-self.flowVault)
        
        self.collectionRef.deposit(vault: <-vault)
        StrategyRegistry.updateStrategyTVL(strategyId: strategyId, amount: initialDeposit, isDeposit: true)
    }
}
`

export const CLEANUP_STORAGE = `
import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}

transaction() {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        let old <- signer.storage.load<@AnyResource>(from: SentinelVaultFinal.VaultCollectionStoragePath)
        destroy old
        signer.capabilities.unpublish(SentinelVaultFinal.VaultCollectionPublicPath)
    }
}
`

// Phase 1 Fix: TRIGGER_STRATEGY now accepts [UInt8] commitHash generated off-chain.
// The frontend calls prepareCommit() from lib/mev-hash.ts to generate the hash,
// then passes commitHash (number[]) as a Cadence [UInt8] argument.
// This ensures the hash is a real SHA3-256 hash — not a plaintext string.
export const TRIGGER_STRATEGY = `
import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}
import SentinelInterfaces from ${SENTINEL_INTERFACES_ADDRESS}
import MEVShieldCore from ${SENTINEL_VAULT_ADDRESS}
import LiquidStakingStrategy from ${LIQUID_STAKING_STRATEGY_ADDRESS}
import YieldFarmingStrategy from ${YIELD_FARMING_STRATEGY_ADDRESS}
import ArbitrageStrategy from ${ARBITRAGE_STRATEGY_ADDRESS}
import YieldOracle from ${SENTINEL_VAULT_ADDRESS}

// commitHash: [UInt8] — SHA3-256 hash bytes generated off-chain via lib/mev-hash.ts
// nonce: UInt64 — random nonce used to generate the hash (must match)
// expectedAPY: UFix64 — fetched from YieldOracle before calling this transaction
transaction(vaultId: UInt64, commitHash: [UInt8], nonce: UInt64, expectedAPY: UFix64) {
    let vaultRef: auth(SentinelVaultFinal.StrategyExecution) &SentinelVaultFinal.Vault

    prepare(signer: auth(BorrowValue) &Account) {
        assert(commitHash.length == 32, message: "commitHash must be 32 bytes (SHA3-256)")

        let collection = signer.storage.borrow<&SentinelVaultFinal.Collection>(
            from: SentinelVaultFinal.VaultCollectionStoragePath
        ) ?? panic("Could not borrow collection reference")

        self.vaultRef = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Could not borrow vault reference")
    }

    execute {
        let strategyId = self.vaultRef.getStrategyId()
        let balance = self.vaultRef.getBalance()
        let deadlineBlock = getCurrentBlock().height + MEVShieldCore.getMEVCommitBlocks()

        // Create commit (hash already computed off-chain)
        MEVShieldCore.createCommit(
            vaultId: vaultId,
            commitHash: commitHash,
            protectionLevel: 3,
            committedBy: self.vaultRef.vaultOwner
        )

        // Reveal — verifies hash, applies VRF jitter, enqueues
        MEVShieldCore.revealExecution(
            vaultId: vaultId,
            commitHash: commitHash,
            nonce: nonce,
            amount: balance,
            strategyId: strategyId,
            deadlineBlock: deadlineBlock,
            expectedAPY: expectedAPY,
            slippageBps: 300.0
        )

        // Execute strategy with full MEV protection
        if strategyId == "liquid-staking-pro" {
            let executor <- LiquidStakingStrategy.createExecutor()
            self.vaultRef.executeStrategyWithMEV(
                executor: <-executor, commitHash: commitHash,
                expectedAPY: expectedAPY, nonce: nonce
            )
        } else if strategyId == "defi-yield-maximizer" || strategyId == "high-yield-farming" {
            let executor <- YieldFarmingStrategy.createExecutor()
            self.vaultRef.executeStrategyWithMEV(
                executor: <-executor, commitHash: commitHash,
                expectedAPY: expectedAPY, nonce: nonce
            )
        } else if strategyId == "arbitrage-hunter" {
            let executor <- ArbitrageStrategy.createExecutor()
            self.vaultRef.executeStrategyWithMEV(
                executor: <-executor, commitHash: commitHash,
                expectedAPY: expectedAPY, nonce: nonce
            )
        } else {
            // Default to liquid staking for unknown strategies
            let executor <- LiquidStakingStrategy.createExecutor()
            self.vaultRef.executeStrategyWithMEV(
                executor: <-executor, commitHash: commitHash,
                expectedAPY: expectedAPY, nonce: nonce
            )
        }
    }
}
`

export const CLAIM_YIELD = `
import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}
import FlowToken from ${FLOW_TOKEN_ADDRESS}
import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}

transaction(vaultId: UInt64) {
    let vaultRef: auth(SentinelVaultFinal.Withdraw) &SentinelVaultFinal.Vault
    let flowReceiver: &{FungibleToken.Receiver}

    prepare(signer: auth(BorrowValue) &Account) {
        let collection = signer.storage.borrow<&SentinelVaultFinal.Collection>(from: SentinelVaultFinal.VaultCollectionStoragePath)
            ?? panic("Could not borrow collection reference")
        self.vaultRef = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Could not borrow vault reference")

        self.flowReceiver = signer.capabilities.borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            ?? panic("Could not borrow Flow receiver")
    }

    execute {
        let claimedYield <- self.vaultRef.claimYield()
        self.flowReceiver.deposit(from: <-claimedYield)
    }
}
`

// Phase 2: Fund the yield reserve directly with FLOW tokens
export const FUND_YIELD_RESERVE = `
import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}
import FlowToken from ${FLOW_TOKEN_ADDRESS}
import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}

transaction(amount: UFix64) {
    let flowVault: @{FungibleToken.Vault}

    prepare(signer: auth(FungibleToken.Withdraw, BorrowValue) &Account) {
        let vault = signer.storage
            .borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("No Flow vault found")
        self.flowVault <- vault.withdraw(amount: amount)
    }

    execute {
        SentinelVaultFinal.fundYieldReserve(from: <-self.flowVault)
    }
}
`
