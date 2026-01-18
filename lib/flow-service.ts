import * as fcl from '@onflow/fcl'

// Contract addresses from environment
const SENTINEL_VAULT_ADDRESS = process.env.NEXT_PUBLIC_SENTINEL_VAULT_ADDRESS || '0x136b642d0aa31ca9'
const STRATEGY_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_STRATEGY_REGISTRY_ADDRESS || '0x136b642d0aa31ca9'
const FLOW_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_FLOW_TOKEN_ADDRESS || '0x7e60df042a9c0868'
const FUNGIBLE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS || '0x9a0766d93b6608b7'

// Cadence Transactions & Scripts
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
import FlowToken from ${FLOW_TOKEN_ADDRESS}
import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}

transaction(strategyId: String, vaultName: String, initialDeposit: UFix64) {
    let collectionRef: &SentinelVaultFinal.Collection
    let flowVault: @{FungibleToken.Vault}
    
    prepare(signer: auth(BorrowValue, Storage, Capabilities) &Account) {
        // Safe check for existing collection to avoid type mismatch errors
        if let existing = signer.storage.type(at: SentinelVaultFinal.VaultCollectionStoragePath) {
            if existing != Type<@SentinelVaultFinal.Collection>() {
                // Wipe old incompatible collection
                let old <- signer.storage.load<@AnyResource>(from: SentinelVaultFinal.VaultCollectionStoragePath)
                destroy old
                // Also unpublish old capability to avoid conflicts
                signer.capabilities.unpublish(SentinelVaultFinal.VaultCollectionPublicPath)
            }
        }

        if signer.storage.borrow<&SentinelVaultFinal.Collection>(from: SentinelVaultFinal.VaultCollectionStoragePath) == nil {
            let collection <- SentinelVaultFinal.createEmptyCollection()
            signer.storage.save(<-collection, to: SentinelVaultFinal.VaultCollectionStoragePath)
        }
        
        // ALWAYS re-publish capability to ensure it points to the correct contract/interface version
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
        
        let vault <- SentinelVaultFinal.createVault(owner: self.collectionRef.owner!.address, name: vaultName, strategy: strategyName)
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
        
        // Also cleanup public paths
        signer.capabilities.unpublish(SentinelVaultFinal.VaultCollectionPublicPath)
    }
}
`

export const GET_VAULT_LIST = `
import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}
access(all) fun main(address: Address): [SentinelVaultFinal.VaultInfo] {
    let account = getAccount(address)
    if let collectionRef = account.capabilities.borrow<&{SentinelVaultFinal.CollectionPublic}>(SentinelVaultFinal.VaultCollectionPublicPath) {
        return collectionRef.getVaultInfos()
    }
    return []
}
`

export const GET_ALL_STRATEGIES = `
import StrategyRegistry from ${STRATEGY_REGISTRY_ADDRESS}
access(all) fun main(): [{String: AnyStruct}] {
    return StrategyRegistry.getAllStrategies()
}
`

export const TRIGGER_STRATEGY = `
import SentinelVaultFinal from ${SENTINEL_VAULT_ADDRESS}

transaction(vaultId: UInt64) {
    let vaultRef: &SentinelVaultFinal.Vault
    
    prepare(signer: auth(BorrowValue) &Account) {
        let collection = signer.storage.borrow<&SentinelVaultFinal.Collection>(from: SentinelVaultFinal.VaultCollectionStoragePath)
            ?? panic("Could not borrow collection reference")
        self.vaultRef = collection.borrowVaultPriv(id: vaultId)
            ?? panic("Could not borrow vault reference")
    }
    
    execute {
        self.vaultRef.performStrategy()
    }
}
`

// Event types for tracking history
export interface VaultEvent {
  type: 'deposit' | 'withdraw' | 'created'
  vaultId: string
  amount: number
  timestamp: number // Unix timestamp in seconds
  blockHeight: number
}

export interface PerformanceDataPoint {
  timestamp: number
  balance: number
  cumulativePnl: number
}

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
      return {
        transactionId,
        sealed: fcl.tx(transactionId).onceSealed()
      }
    } catch (error) {
      console.error('FCL Mutation Error:', error)
      throw error
    }
  }

  static async getAllStrategies() {
    const result = await this.query(GET_ALL_STRATEGIES)
    return result || []
  }

  static async getVaultList(address: string) {
    const result = await this.query(GET_VAULT_LIST, (arg: any, t: any) => [arg(address, t.Address)])
    return result || []
  }

  // Fetch vault events from blockchain using Access API
  static async getVaultEvents(address: string): Promise<VaultEvent[]> {
    try {
      // Get the latest block to determine range
      const latestBlock = await fcl.block({ sealed: true })
      const latestHeight = latestBlock.height

      // Query events from the last ~30 days worth of blocks (assuming ~1 block per second)
      // Flow produces roughly 1 block per second, so 30 days ≈ 2,592,000 blocks
      // We limit to last 100,000 blocks to avoid timeout
      const startHeight = Math.max(0, latestHeight - 100000)

      const eventTypes = [
        `A.${SENTINEL_VAULT_ADDRESS.replace('0x', '')}.SentinelVaultFinal.VaultCreated`,
        `A.${SENTINEL_VAULT_ADDRESS.replace('0x', '')}.SentinelVaultFinal.DepositMade`,
        `A.${SENTINEL_VAULT_ADDRESS.replace('0x', '')}.SentinelVaultFinal.WithdrawalMade`
      ]

      const events: VaultEvent[] = []

      for (const eventType of eventTypes) {
        try {
          const result = await fcl.send([
            fcl.getEventsAtBlockHeightRange(eventType, startHeight, latestHeight)
          ])

          const decoded = await fcl.decode(result)

          if (decoded && Array.isArray(decoded)) {
            for (const event of decoded) {
              const eventData = event.data

              // Filter events for this user's vaults
              if (eventData.owner === address || eventData.vaultId !== undefined) {
                events.push({
                  type: eventType.includes('Created') ? 'created' :
                    eventType.includes('Deposit') ? 'deposit' : 'withdraw',
                  vaultId: eventData.vaultId?.toString() || eventData.id?.toString() || '0',
                  amount: parseFloat(eventData.amount || '0'),
                  timestamp: event.blockTimestamp ? new Date(event.blockTimestamp).getTime() / 1000 : Date.now() / 1000,
                  blockHeight: event.blockHeight || 0
                })
              }
            }
          }
        } catch (err) {
          console.warn(`Could not fetch events for ${eventType}:`, err)
        }
      }

      // Sort by timestamp
      events.sort((a, b) => a.timestamp - b.timestamp)

      return events
    } catch (error) {
      console.error('Error fetching vault events:', error)
      return []
    }
  }

  // Calculate vault age in days based on first event
  static getVaultAgeInDays(events: VaultEvent[]): number {
    if (events.length === 0) return 0

    const firstEventTime = events[0].timestamp * 1000 // Convert to milliseconds
    const now = Date.now()
    const ageMs = now - firstEventTime
    const ageDays = ageMs / (1000 * 60 * 60 * 24)

    return ageDays
  }

  // Build performance history from events
  static buildPerformanceHistory(events: VaultEvent[], currentBalance: number): PerformanceDataPoint[] {
    if (events.length === 0) return []

    const history: PerformanceDataPoint[] = []
    let runningBalance = 0
    let totalDeposited = 0

    for (const event of events) {
      if (event.type === 'deposit' || event.type === 'created') {
        runningBalance += event.amount
        totalDeposited += event.amount
      } else if (event.type === 'withdraw') {
        runningBalance -= event.amount
      }

      history.push({
        timestamp: event.timestamp,
        balance: runningBalance,
        cumulativePnl: runningBalance - totalDeposited
      })
    }

    // Add current state as the latest point
    history.push({
      timestamp: Date.now() / 1000,
      balance: currentBalance,
      cumulativePnl: currentBalance - totalDeposited
    })

    return history
  }

  // Check if enough data is available for the selected timeframe
  static hasEnoughDataForTimeframe(vaultAgeDays: number, timeframe: string): boolean {
    const requiredDays: Record<string, number> = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
      'all': 0 // All time always has enough data
    }

    return vaultAgeDays >= (requiredDays[timeframe] || 0)
  }

  // Get remaining time needed for timeframe
  static getRemainingTimeForTimeframe(vaultAgeDays: number, timeframe: string): string {
    const requiredDays: Record<string, number> = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }

    const required = requiredDays[timeframe] || 0
    const remaining = required - vaultAgeDays

    if (remaining <= 0) return ''

    if (remaining < 1) {
      const hours = Math.ceil(remaining * 24)
      return `${hours} hour${hours !== 1 ? 's' : ''}`
    }

    const days = Math.ceil(remaining)
    return `${days} day${days !== 1 ? 's' : ''}`
  }

  static async createVaultWithStrategy(strategyId: string, vaultName: string, initialDeposit: number) {
    return this.mutate(CREATE_VAULT_WITH_STRATEGY, (arg: any, t: any) => [
      arg(strategyId, t.String),
      arg(vaultName, t.String),
      arg(initialDeposit.toFixed(8), t.UFix64)
    ])
  }

  static async deposit(vaultId: string, amount: number) {
    return this.mutate(DEPOSIT_TO_VAULT, (arg: any, t: any) => [
      arg(vaultId, t.UInt64),
      arg(amount.toFixed(8), t.UFix64)
    ])
  }

  static async withdraw(vaultId: string, amount: number) {
    return this.mutate(WITHDRAW_FROM_VAULT, (arg: any, t: any) => [
      arg(vaultId, t.UInt64),
      arg(amount.toFixed(8), t.UFix64)
    ])
  }

  static async pauseVault(vaultId: string) {
    return this.mutate(PAUSE_VAULT, (arg: any, t: any) => [arg(vaultId, t.UInt64)])
  }

  static async resumeVault(vaultId: string) {
    return this.mutate(RESUME_VAULT, (arg: any, t: any) => [arg(vaultId, t.UInt64)])
  }

  static async triggerStrategy(vaultId: string) {
    return this.mutate(TRIGGER_STRATEGY, (arg: any, t: any) => [arg(vaultId, t.UInt64)])
  }

  static async cleanupIncompatibleStorage() {
    return this.mutate(CLEANUP_STORAGE, () => [])
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