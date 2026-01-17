import * as fcl from '@onflow/fcl'

// Contract addresses from environment
const SENTINEL_VAULT_ADDRESS = process.env.NEXT_PUBLIC_SENTINEL_VAULT_ADDRESS || '0x136b642d0aa31ca9'
const SENTINEL_INTERFACES_ADDRESS = process.env.NEXT_PUBLIC_SENTINEL_INTERFACES_ADDRESS || '0x136b642d0aa31ca9'
const STRATEGY_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_STRATEGY_REGISTRY_ADDRESS || '0x136b642d0aa31ca9'
const LIQUID_STAKING_STRATEGY_ADDRESS = process.env.NEXT_PUBLIC_LIQUID_STAKING_STRATEGY_ADDRESS || '0x136b642d0aa31ca9'
const YIELD_FARMING_STRATEGY_ADDRESS = process.env.NEXT_PUBLIC_YIELD_FARMING_STRATEGY_ADDRESS || '0x136b642d0aa31ca9'
const ARBITRAGE_STRATEGY_ADDRESS = process.env.NEXT_PUBLIC_ARBITRAGE_STRATEGY_ADDRESS || '0x136b642d0aa31ca9'

// Scripts to query blockchain data
export const GET_ALL_STRATEGIES = `
import StrategyRegistry from ${STRATEGY_REGISTRY_ADDRESS}

access(all) fun main(): [{String: AnyStruct}] {
    return StrategyRegistry.getAllStrategies()
}
`

export const GET_STRATEGY_BY_ID = `
import StrategyRegistry from ${STRATEGY_REGISTRY_ADDRESS}

access(all) fun main(strategyId: String): {String: AnyStruct}? {
    return StrategyRegistry.getStrategy(strategyId: strategyId)
}
`

export const GET_STRATEGIES_BY_CATEGORY = `
import StrategyRegistry from ${STRATEGY_REGISTRY_ADDRESS}

access(all) fun main(category: String): [{String: AnyStruct}] {
    let account = getAccount(${STRATEGY_REGISTRY_ADDRESS})
    
    if let registryRef = account.capabilities.borrow<&StrategyRegistry.Registry{StrategyRegistry.RegistryPublic}>(/public/StrategyRegistry) {
        return registryRef.getStrategiesByCategory(category: category)
    }
    
    return []
}
`

export const GET_FEATURED_STRATEGIES = `
import StrategyRegistry from ${STRATEGY_REGISTRY_ADDRESS}

access(all) fun main(): [{String: AnyStruct}] {
    let account = getAccount(${STRATEGY_REGISTRY_ADDRESS})
    
    if let registryRef = account.capabilities.borrow<&StrategyRegistry.Registry{StrategyRegistry.RegistryPublic}>(/public/StrategyRegistry) {
        return registryRef.getFeaturedStrategies()
    }
    
    return []
}
`

export const GET_STRATEGY_METRICS = `
import StrategyRegistry from ${STRATEGY_REGISTRY_ADDRESS}

access(all) fun main(strategyId: String): {String: AnyStruct}? {
    let account = getAccount(${STRATEGY_REGISTRY_ADDRESS})
    
    if let registryRef = account.capabilities.borrow<&StrategyRegistry.Registry{StrategyRegistry.RegistryPublic}>(/public/StrategyRegistry) {
        return registryRef.getStrategyMetrics(strategyId: strategyId)
    }
    
    return nil
}
`

export const GET_VAULT_INFO = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}

access(all) fun main(address: Address): {String: AnyStruct}? {
    let account = getAccount(address)
    
    if let vaultRef = account.capabilities.borrow<&SentinelVault.Vault{SentinelVault.VaultPublic}>(/public/SentinelVault) {
        return {
            "id": vaultRef.id,
            "balance": vaultRef.getBalance(),
            "isActive": vaultRef.getIsActive(),
            "lastExecution": vaultRef.getLastExecution(),
            "owner": vaultRef.getOwner()
        }
    }
    
    return nil
}
`

export const GET_VAULT_PERFORMANCE = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}

access(all) fun main(address: Address): {String: AnyStruct}? {
    let account = getAccount(address)
    
    if let vaultRef = account.capabilities.borrow<&SentinelVault.Vault{SentinelVault.VaultPublic}>(/public/SentinelVault) {
        let balance = vaultRef.getBalance()
        
        // For demo purposes, simulate performance data
        let simulatedDeposits = balance * 0.9 // Assume 90% of balance was deposited
        let pnl = balance > simulatedDeposits ? balance - simulatedDeposits : 0.0
        let pnlPercent = simulatedDeposits > 0.0 ? (pnl / simulatedDeposits) * 100.0 : 0.0
        
        return {
            "currentBalance": balance,
            "totalDeposits": simulatedDeposits,
            "pnl": pnl,
            "pnlPercent": pnlPercent
        }
    }
    
    return nil
}
`

// Transactions
export const CREATE_VAULT_WITH_STRATEGY = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
import StrategyRegistry from ${STRATEGY_REGISTRY_ADDRESS}
import FlowToken from ${process.env.NEXT_PUBLIC_FLOW_TOKEN_ADDRESS || '0x7e60df042a9c0868'}
import FungibleToken from ${process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS || '0x9a0766d93b6608b7'}

transaction(strategyId: String, initialDeposit: UFix64) {
    let vaultRef: &SentinelVault.Vault
    let flowVault: @{FungibleToken.Vault}
    
    prepare(signer: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
        // Verify strategy exists
        let strategy = StrategyRegistry.getStrategy(strategyId: strategyId)
            ?? panic("Strategy not found: ".concat(strategyId))
        
        // Check minimum deposit requirement
        let minDeposit = strategy["minDeposit"] as! UFix64
        if initialDeposit < minDeposit {
            panic("Initial deposit below minimum required: ".concat(minDeposit.toString()))
        }
        
        // Create the vault
        let vault <- SentinelVault.createVault(owner: signer.address)
        
        // Save it to storage
        signer.storage.save(<-vault, to: /storage/SentinelVault)
        
        // Create public capability
        let cap = signer.capabilities.storage.issue<&SentinelVault.Vault{SentinelVault.VaultPublic}>(/storage/SentinelVault)
        signer.capabilities.publish(cap, at: /public/SentinelVault)
        
        // Get vault reference for deposit
        self.vaultRef = signer.storage.borrow<&SentinelVault.Vault>(from: /storage/SentinelVault)!
        
        // Get Flow tokens for initial deposit
        let flowVaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow vault reference")
        
        self.flowVault <- flowVaultRef.withdraw(amount: initialDeposit)
    }
    
    execute {
        // Make initial deposit
        self.vaultRef.deposit(from: <-self.flowVault)
        
        // Update strategy TVL
        StrategyRegistry.updateStrategyTVL(strategyId: strategyId, amount: initialDeposit, isDeposit: true)
    }
}
`

export const DEPOSIT_TO_VAULT = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
import FlowToken from ${process.env.NEXT_PUBLIC_FLOW_TOKEN_ADDRESS || '0x7e60df042a9c0868'}
import FungibleToken from ${process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS || '0x9a0766d93b6608b7'}

transaction(amount: UFix64) {
    let vaultRef: auth(SentinelVault.Deposit) &SentinelVault.Vault
    let flowVault: @{FungibleToken.Vault}
    
    prepare(signer: auth(BorrowValue) &Account) {
        // Get vault reference
        self.vaultRef = signer.storage.borrow<auth(SentinelVault.Deposit) &SentinelVault.Vault>(from: /storage/SentinelVault)
            ?? panic("Could not borrow vault reference")
        
        // Get Flow tokens to deposit
        let flowVaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow vault reference")
        
        self.flowVault <- flowVaultRef.withdraw(amount: amount)
    }
    
    execute {
        self.vaultRef.deposit(from: <-self.flowVault)
    }
}
`

export const WITHDRAW_FROM_VAULT = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
import FlowToken from ${process.env.NEXT_PUBLIC_FLOW_TOKEN_ADDRESS || '0x7e60df042a9c0868'}
import FungibleToken from ${process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS || '0x9a0766d93b6608b7'}

transaction(amount: UFix64) {
    let vaultRef: auth(SentinelVault.Withdraw) &SentinelVault.Vault
    let flowVaultRef: auth(FungibleToken.Receive) &FlowToken.Vault
    
    prepare(signer: auth(BorrowValue) &Account) {
        // Get vault reference
        self.vaultRef = signer.storage.borrow<auth(SentinelVault.Withdraw) &SentinelVault.Vault>(from: /storage/SentinelVault)
            ?? panic("Could not borrow vault reference")
        
        // Get Flow vault to receive tokens
        self.flowVaultRef = signer.storage.borrow<auth(FungibleToken.Receive) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow vault reference")
    }
    
    execute {
        let withdrawnTokens <- self.vaultRef.withdraw(amount: amount)
        self.flowVaultRef.deposit(from: <-withdrawnTokens)
    }
}
`

// Service functions
export class FlowService {
  // Strategy-related functions
  static async getAllStrategies() {
    try {
      const result = await fcl.query({
        cadence: GET_ALL_STRATEGIES
      })
      return result || []
    } catch (error) {
      console.error('Error fetching all strategies:', error)
      return []
    }
  }

  static async getStrategyById(strategyId: string) {
    try {
      const result = await fcl.query({
        cadence: GET_STRATEGY_BY_ID,
        args: (arg: any, t: any) => [arg(strategyId, t.String)]
      })
      return result
    } catch (error) {
      console.error('Error fetching strategy:', error)
      return null
    }
  }

  static async getStrategiesByCategory(category: string) {
    try {
      const result = await fcl.query({
        cadence: GET_STRATEGIES_BY_CATEGORY,
        args: (arg: any, t: any) => [arg(category, t.String)]
      })
      return result || []
    } catch (error) {
      console.error('Error fetching strategies by category:', error)
      return []
    }
  }

  static async getFeaturedStrategies() {
    try {
      const result = await fcl.query({
        cadence: GET_FEATURED_STRATEGIES
      })
      return result || []
    } catch (error) {
      console.error('Error fetching featured strategies:', error)
      return []
    }
  }

  static async getStrategyMetrics(strategyId: string) {
    try {
      const result = await fcl.query({
        cadence: GET_STRATEGY_METRICS,
        args: (arg: any, t: any) => [arg(strategyId, t.String)]
      })
      return result
    } catch (error) {
      console.error('Error fetching strategy metrics:', error)
      return null
    }
  }

  // Vault-related functions
  static async getVaultInfo(address: string) {
    try {
      const result = await fcl.query({
        cadence: GET_VAULT_INFO,
        args: (arg: any, t: any) => [arg(address, t.Address)]
      })
      return result
    } catch (error) {
      console.error('Error fetching vault info:', error)
      return null
    }
  }

  static async getVaultPerformance(address: string) {
    try {
      const result = await fcl.query({
        cadence: GET_VAULT_PERFORMANCE,
        args: (arg: any, t: any) => [arg(address, t.Address)]
      })
      return result
    } catch (error) {
      console.error('Error fetching vault performance:', error)
      return null
    }
  }

  static async createVaultWithStrategy(strategyId: string, initialDeposit: number) {
    try {
      const transactionId = await fcl.mutate({
        cadence: CREATE_VAULT_WITH_STRATEGY,
        args: (arg: any, t: any) => [
          arg(strategyId, t.String),
          arg(initialDeposit.toFixed(8), t.UFix64)
        ],
        payer: fcl.currentUser,
        proposer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      })

      console.log('Vault creation transaction submitted:', transactionId)
      
      // Wait for transaction to be sealed
      const transaction = await fcl.tx(transactionId).onceSealed()
      console.log('Vault creation transaction sealed:', transaction)
      
      return transaction
    } catch (error) {
      console.error('Error creating vault with strategy:', error)
      throw error
    }
  }

  static async deposit(amount: number) {
    try {
      const transactionId = await fcl.mutate({
        cadence: DEPOSIT_TO_VAULT,
        args: (arg: any, t: any) => [
          arg(amount.toFixed(8), t.UFix64)
        ],
        payer: fcl.currentUser,
        proposer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      })

      console.log('Deposit transaction submitted:', transactionId)
      
      const transaction = await fcl.tx(transactionId).onceSealed()
      console.log('Deposit transaction sealed:', transaction)
      
      return transaction
    } catch (error) {
      console.error('Error depositing:', error)
      throw error
    }
  }

  static async withdraw(amount: number) {
    try {
      const transactionId = await fcl.mutate({
        cadence: WITHDRAW_FROM_VAULT,
        args: (arg: any, t: any) => [
          arg(amount.toFixed(8), t.UFix64)
        ],
        payer: fcl.currentUser,
        proposer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      })

      console.log('Withdraw transaction submitted:', transactionId)
      
      const transaction = await fcl.tx(transactionId).onceSealed()
      console.log('Withdraw transaction sealed:', transaction)
      
      return transaction
    } catch (error) {
      console.error('Error withdrawing:', error)
      throw error
    }
  }

  static async getUserFlowBalance(address: string) {
    try {
      const balance = await fcl.query({
        cadence: `
          import FlowToken from ${process.env.NEXT_PUBLIC_FLOW_TOKEN_ADDRESS || '0x7e60df042a9c0868'}
          import FungibleToken from ${process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS || '0x9a0766d93b6608b7'}
          
          access(all) fun main(address: Address): UFix64 {
            let account = getAccount(address)
            let vaultRef = account.capabilities.borrow<&FlowToken.Vault{FungibleToken.Balance}>(/public/flowTokenBalance)
              ?? panic("Could not borrow Balance reference to the Vault")
            
            return vaultRef.balance
          }
        `,
        args: (arg: any, t: any) => [arg(address, t.Address)]
      })
      return balance
    } catch (error) {
      console.error('Error fetching Flow balance:', error)
      return 0
    }
  }
}