import * as fcl from '@onflow/fcl'

// Contract addresses from environment
const SENTINEL_VAULT_ADDRESS = process.env.NEXT_PUBLIC_SENTINEL_VAULT_ADDRESS || '0x136b642d0aa31ca9'
const STRATEGY_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_STRATEGY_REGISTRY_ADDRESS || '0x136b642d0aa31ca9'
const FLOW_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_FLOW_TOKEN_ADDRESS || '0x7e60df042a9c0868'
const FUNGIBLE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS || '0x9a0766d93b6608b7'

// Cadence Transactions & Scripts
export const DEPOSIT_TO_VAULT = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
import FlowToken from ${FLOW_TOKEN_ADDRESS}
import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}

transaction(amount: UFix64) {
    let flowVault: @{FungibleToken.Vault}
    
    prepare(signer: auth(Withdraw) &Account) {
        let flowVaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow vault reference")
        self.flowVault <- flowVaultRef.withdraw(amount: amount)
    }
    
    execute {
        let vaultRef = signer.storage.borrow<auth(SentinelVault.Deposit) &SentinelVault.Vault>(from: /storage/SentinelVault)
            ?? panic("Could not borrow vault reference")
        vaultRef.deposit(from: <-self.flowVault)
    }
}
`

export const WITHDRAW_FROM_VAULT = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
import FlowToken from ${FLOW_TOKEN_ADDRESS}
import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}

transaction(amount: UFix64) {
    let vaultRef: auth(SentinelVault.Withdraw) &SentinelVault.Vault
    let flowVaultRef: &{FungibleToken.Receiver}
    
    prepare(signer: auth(BorrowValue) &Account) {
        self.vaultRef = signer.storage.borrow<auth(SentinelVault.Withdraw) &SentinelVault.Vault>(from: /storage/SentinelVault)
            ?? panic("Could not borrow vault reference")
        self.flowVaultRef = signer.capabilities.borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            ?? panic("Could not borrow Flow receiver")
    }
    
    execute {
        let withdrawnTokens <- self.vaultRef.withdraw(amount: amount)
        self.flowVaultRef.deposit(from: <-withdrawnTokens)
    }
}
`

export const PAUSE_VAULT = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
transaction() {
    let vaultRef: auth(SentinelVault.Pause) &SentinelVault.Vault
    prepare(signer: auth(BorrowValue) &Account) {
        self.vaultRef = signer.storage.borrow<auth(SentinelVault.Pause) &SentinelVault.Vault>(from: /storage/SentinelVault)
            ?? panic("Could not borrow vault reference")
    }
    execute {
        self.vaultRef.emergencyPause()
    }
}
`

export const RESUME_VAULT = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
transaction() {
    let vaultRef: auth(SentinelVault.Resume) &SentinelVault.Vault
    prepare(signer: auth(BorrowValue) &Account) {
        self.vaultRef = signer.storage.borrow<auth(SentinelVault.Resume) &SentinelVault.Vault>(from: /storage/SentinelVault)
            ?? panic("Could not borrow vault reference")
    }
    execute {
        self.vaultRef.resume()
    }
}
`

export const CREATE_VAULT_WITH_STRATEGY = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
import StrategyRegistry from ${STRATEGY_REGISTRY_ADDRESS}
import FlowToken from ${FLOW_TOKEN_ADDRESS}
import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}

transaction(strategyId: String, initialDeposit: UFix64) {
    let vaultRef: auth(SentinelVault.Deposit) &SentinelVault.Vault
    let flowVault: @{FungibleToken.Vault}
    
    prepare(signer: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
        if signer.storage.borrow<&SentinelVault.Vault>(from: /storage/SentinelVault) == nil {
            let vault <- SentinelVault.createVault(owner: signer.address)
            signer.storage.save(<-vault, to: /storage/SentinelVault)
            let cap = signer.capabilities.storage.issue<&{SentinelVault.VaultPublic}>(/storage/SentinelVault)
            signer.capabilities.publish(cap, at: /public/SentinelVault)
        }
        
        self.vaultRef = signer.storage.borrow<auth(SentinelVault.Deposit) &SentinelVault.Vault>(from: /storage/SentinelVault)
            ?? panic("Could not borrow vault reference")
        
        let flowVaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow vault reference")
        
        self.flowVault <- flowVaultRef.withdraw(amount: initialDeposit)
    }
    
    execute {
        self.vaultRef.deposit(from: <-self.flowVault)
        StrategyRegistry.updateStrategyTVL(strategyId: strategyId, amount: initialDeposit, isDeposit: true)
    }
}
`

export const GET_VAULT_INFO = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
access(all) fun main(address: Address): {String: AnyStruct}? {
    let account = getAccount(address)
    if let vaultRef = account.capabilities.borrow<&{SentinelVault.VaultPublic}>(/public/SentinelVault) {
        return {
            "balance": vaultRef.getBalance(),
            "status": vaultRef.getStatus(),
            "isActive": vaultRef.getIsActive(),
            "lastExecution": vaultRef.getLastExecution(),
            "owner": vaultRef.getOwner()
        }
    }
    return nil
}
`

export const GET_ALL_STRATEGIES = `
import StrategyRegistry from ${STRATEGY_REGISTRY_ADDRESS}
access(all) fun main(): [{String: AnyStruct}] {
    return StrategyRegistry.getAllStrategies()
}
`

export const GET_VAULT_PERFORMANCE = `
import SentinelVault from ${SENTINEL_VAULT_ADDRESS}
access(all) fun main(address: Address): {String: AnyStruct}? {
    let account = getAccount(address)
    if let vaultRef = account.capabilities.borrow<&{SentinelVault.VaultPublic}>(/public/SentinelVault) {
        let balance = vaultRef.getBalance()
        return {
            "currentBalance": balance,
            "totalDeposits": balance * 0.95,
            "pnl": balance * 0.05,
            "pnlPercent": 5.0
        }
    }
    return nil
}
`

export class FlowService {
  static async query(cadence: string, args: any = () => []) {
    try {
      return await fcl.query({ cadence, args })
    } catch (error) {
      console.error('FCL Query Error:', error)
      return null
    }
  }

  static async mutate(cadence: string, args: any = () => []) {
    try {
      const transactionId = await fcl.mutate({
        cadence,
        args,
        payer: fcl.currentUser,
        proposer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      })
      return await fcl.tx(transactionId).onceSealed()
    } catch (error) {
      console.error('FCL Mutation Error:', error)
      throw error
    }
  }

  static async getAllStrategies() {
    const result = await this.query(GET_ALL_STRATEGIES)
    return result || []
  }

  static async getVaultInfo(address: string) {
    return await this.query(GET_VAULT_INFO, (arg: any, t: any) => [arg(address, t.Address)])
  }

  static async getVaultPerformance(address: string) {
    return await this.query(GET_VAULT_PERFORMANCE, (arg: any, t: any) => [arg(address, t.Address)])
  }

  static async createVaultWithStrategy(strategyId: string, initialDeposit: number) {
    return await this.mutate(CREATE_VAULT_WITH_STRATEGY, (arg: any, t: any) => [
      arg(strategyId, t.String),
      arg(initialDeposit.toFixed(8), t.UFix64)
    ])
  }

  static async deposit(amount: number) {
    return await this.mutate(DEPOSIT_TO_VAULT, (arg: any, t: any) => [arg(amount.toFixed(8), t.UFix64)])
  }

  static async withdraw(amount: number) {
    return await this.mutate(WITHDRAW_FROM_VAULT, (arg: any, t: any) => [arg(amount.toFixed(8), t.UFix64)])
  }

  static async pauseVault() {
    return await this.mutate(PAUSE_VAULT)
  }

  static async resumeVault() {
    return await this.mutate(RESUME_VAULT)
  }

  static async getUserFlowBalance(address: string) {
    try {
      const balance = await this.query(`
        import FlowToken from ${FLOW_TOKEN_ADDRESS}
        import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}
        access(all) fun main(address: Address): UFix64 {
          let account = getAccount(address)
          let vaultRef = account.capabilities.borrow<&{FungibleToken.Balance}>(/public/flowTokenBalance)
          return vaultRef?.balance ?? 0.0
        }
      `, (arg: any, t: any) => [arg(address, t.Address)])
      return balance || 0.0
    } catch (error) {
      return 0.0
    }
  }
}