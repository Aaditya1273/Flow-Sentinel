import * as fcl from '@onflow/fcl'

// Contract addresses from environment
const SENTINEL_VAULT_ADDRESS = process.env.NEXT_PUBLIC_SENTINEL_VAULT_ADDRESS || '0x136b642d0aa31ca9'
const SENTINEL_INTERFACES_ADDRESS = process.env.NEXT_PUBLIC_SENTINEL_INTERFACES_ADDRESS || '0x136b642d0aa31ca9'

// Scripts to query blockchain data
export const GET_VAULT_INFO = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
import SentinelInterfaces from ${SENTINEL_INTERFACES_ADDRESS}

access(all) fun main(address: Address): {String: AnyStruct}? {
    let account = getAccount(address)
    
    if let vaultRef = account.capabilities.borrow<&SentinelVault.Vault{SentinelInterfaces.VaultPublic}>(/public/SentinelVault) {
        return {
            "id": vaultRef.getID(),
            "name": vaultRef.getName(),
            "balance": vaultRef.getBalance(),
            "strategy": vaultRef.getStrategy(),
            "isActive": vaultRef.isActive(),
            "lastExecution": vaultRef.getLastExecution(),
            "totalDeposits": vaultRef.getTotalDeposits(),
            "totalWithdrawals": vaultRef.getTotalWithdrawals(),
            "createdAt": vaultRef.getCreatedAt()
        }
    }
    
    return nil
}
`

export const GET_ALL_VAULTS = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
import SentinelInterfaces from ${SENTINEL_INTERFACES_ADDRESS}

access(all) fun main(): [{String: AnyStruct}] {
    let vaults: [{String: AnyStruct}] = []
    
    // This would need to be implemented in the contract to track all vaults
    // For now, we'll return empty array and implement vault registry later
    
    return vaults
}
`

export const GET_VAULT_PERFORMANCE = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
import SentinelInterfaces from ${SENTINEL_INTERFACES_ADDRESS}

access(all) fun main(address: Address): {String: UFix64}? {
    let account = getAccount(address)
    
    if let vaultRef = account.capabilities.borrow<&SentinelVault.Vault{SentinelInterfaces.VaultPublic}>(/public/SentinelVault) {
        let balance = vaultRef.getBalance()
        let totalDeposits = vaultRef.getTotalDeposits()
        let pnl = balance > totalDeposits ? balance - totalDeposits : 0.0
        let pnlPercent = totalDeposits > 0.0 ? (pnl / totalDeposits) * 100.0 : 0.0
        
        return {
            "currentBalance": balance,
            "totalDeposits": totalDeposits,
            "pnl": pnl,
            "pnlPercent": pnlPercent
        }
    }
    
    return nil
}
`

export const GET_VAULT_ACTIVITIES = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
import SentinelInterfaces from ${SENTINEL_INTERFACES_ADDRESS}

access(all) fun main(address: Address): [AnyStruct] {
    // This would fetch recent activities/events from the vault
    // For now, return empty array - would need event indexing
    return []
}
`

// Transactions
export const CREATE_VAULT_TRANSACTION = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
import SentinelInterfaces from ${SENTINEL_INTERFACES_ADDRESS}
import FlowToken from ${process.env.NEXT_PUBLIC_FLOW_TOKEN_ADDRESS || '0x7e60df042a9c0868'}
import FungibleToken from ${process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS || '0x9a0766d93b6608b7'}

transaction(name: String, strategy: String, minDeposit: UFix64) {
    prepare(signer: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
        // Create the vault
        let vault <- SentinelVault.createVault(
            name: name,
            strategy: strategy,
            minDeposit: minDeposit
        )
        
        // Save it to storage
        signer.storage.save(<-vault, to: /storage/SentinelVault)
        
        // Create public capability
        let cap = signer.capabilities.storage.issue<&SentinelVault.Vault{SentinelInterfaces.VaultPublic}>(/storage/SentinelVault)
        signer.capabilities.publish(cap, at: /public/SentinelVault)
    }
}
`

export const DEPOSIT_TRANSACTION = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
import SentinelInterfaces from ${SENTINEL_INTERFACES_ADDRESS}
import FlowToken from ${process.env.NEXT_PUBLIC_FLOW_TOKEN_ADDRESS || '0x7e60df042a9c0868'}
import FungibleToken from ${process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS || '0x9a0766d93b6608b7'}

transaction(amount: UFix64) {
    let vaultRef: auth(SentinelInterfaces.VaultOwner) &SentinelVault.Vault
    let flowVault: @{FungibleToken.Vault}
    
    prepare(signer: auth(BorrowValue) &Account) {
        // Get vault reference
        self.vaultRef = signer.storage.borrow<auth(SentinelInterfaces.VaultOwner) &SentinelVault.Vault>(from: /storage/SentinelVault)
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

export const WITHDRAW_TRANSACTION = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
import SentinelInterfaces from ${SENTINEL_INTERFACES_ADDRESS}
import FlowToken from ${process.env.NEXT_PUBLIC_FLOW_TOKEN_ADDRESS || '0x7e60df042a9c0868'}
import FungibleToken from ${process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS || '0x9a0766d93b6608b7'}

transaction(amount: UFix64) {
    let vaultRef: auth(SentinelInterfaces.VaultOwner) &SentinelVault.Vault
    let flowVaultRef: auth(FungibleToken.Receive) &FlowToken.Vault
    
    prepare(signer: auth(BorrowValue) &Account) {
        // Get vault reference
        self.vaultRef = signer.storage.borrow<auth(SentinelInterfaces.VaultOwner) &SentinelVault.Vault>(from: /storage/SentinelVault)
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

  static async createVault(name: string, strategy: string, minDeposit: number) {
    try {
      const transactionId = await fcl.mutate({
        cadence: CREATE_VAULT_TRANSACTION,
        args: (arg: any, t: any) => [
          arg(name, t.String),
          arg(strategy, t.String),
          arg(minDeposit.toFixed(8), t.UFix64)
        ],
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 1000
      })

      console.log('Vault creation transaction submitted:', transactionId)
      
      // Wait for transaction to be sealed
      const transaction = await fcl.tx(transactionId).onceSealed()
      console.log('Vault creation transaction sealed:', transaction)
      
      return transaction
    } catch (error) {
      console.error('Error creating vault:', error)
      throw error
    }
  }

  static async deposit(amount: number) {
    try {
      const transactionId = await fcl.mutate({
        cadence: DEPOSIT_TRANSACTION,
        args: (arg: any, t: any) => [
          arg(amount.toFixed(8), t.UFix64)
        ],
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
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
        cadence: WITHDRAW_TRANSACTION,
        args: (arg: any, t: any) => [
          arg(amount.toFixed(8), t.UFix64)
        ],
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
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