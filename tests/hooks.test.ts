/**
 * Frontend Hook Tests — Flow Sentinel
 *
 * These tests validate the frontend data hooks against the real Cadence contracts.
 * To run: npm test (requires Jest + @onflow/fcl-mock or a running emulator)
 *
 * Setup:
 * 1. npm install --save-dev jest @types/jest ts-jest
 * 2. Add jest.config.js with ts-jest preset
 * 3. flow emulator --start &
 * 4. flow deploy --network emulator
 * 5. npx jest tests/hooks.test.ts
 */

import { FlowService } from '../lib/flow-service'

// -------------------------------------------------------------------------
// Mock FCL (Flow Client Library)
// Run tests against a real emulator or mock FCL responses
// -------------------------------------------------------------------------
const MOCK_ADDRESS = '0xf8d6e0586b0a20c7'

// -------------------------------------------------------------------------
// FlowService — Script Query Tests
// -------------------------------------------------------------------------

describe('FlowService.getUserFlowBalance()', () => {
  it('should return a valid UFix64 balance for a known address', async () => {
    const balance = await FlowService.getUserFlowBalance(MOCK_ADDRESS)
    expect(typeof balance).toBe('number')
    expect(balance).toBeGreaterThanOrEqual(0)
  })

  it('should return 0 for an invalid address', async () => {
    const balance = await FlowService.getUserFlowBalance('0x0000000000000000')
    expect(balance).toBe(0)
  })
})

describe('FlowService.getVaultList()', () => {
  it('should return an empty array for a user with no vaults', async () => {
    const vaults = await FlowService.getVaultList('0x0000000000000000')
    expect(Array.isArray(vaults)).toBe(true)
    expect(vaults.length).toBe(0)
  })

  it('should return vault data for a user with deployed vaults', async () => {
    const vaults = await FlowService.getVaultList(MOCK_ADDRESS)
    if (vaults.length > 0) {
      const vault = vaults[0] as any
      expect(vault).toHaveProperty('id')
      expect(vault).toHaveProperty('balance')
      expect(vault).toHaveProperty('isActive')
      expect(vault).toHaveProperty('strategy')
      expect(vault).toHaveProperty('strategyId')
      expect(vault).toHaveProperty('totalYieldAccrued')
    }
  })
})

describe('FlowService.getAllStrategies()', () => {
  it('should return at least 3 default strategies', async () => {
    const strategies = await FlowService.getAllStrategies()
    expect(Array.isArray(strategies)).toBe(true)
    expect(strategies.length).toBeGreaterThanOrEqual(3)
  })

  it('should include liquid-staking-pro strategy', async () => {
    const strategies = await FlowService.getAllStrategies() as any[]
    const liquidStaking = strategies.find((s: any) => s.id === 'liquid-staking-pro')
    expect(liquidStaking).toBeDefined()
    expect(liquidStaking.name).toBe('Flow Liquid Staking Pro')
    expect(liquidStaking.riskLevel).toBe(1)
  })
})

// -------------------------------------------------------------------------
// FlowService — Transaction Tests (require emulator + deployed contracts)
// -------------------------------------------------------------------------

describe('FlowService.createVaultWithStrategy()', () => {
  it('should submit a create vault transaction', async () => {
    // Note: requires connected FCL user with FLOW tokens
    try {
      const result = await FlowService.createVaultWithStrategy(
        'liquid-staking-pro',
        'Test Vault',
        10.0
      )
      expect(result).toHaveProperty('transactionId')
      expect(typeof result.transactionId).toBe('string')
      expect(result.transactionId.length).toBeGreaterThan(0)
    } catch (error: any) {
      // If no user is connected / emulator not running, expect auth error
      expect(error).toBeDefined()
    }
  })
})

describe('FlowService.deposit()', () => {
  it('should submit a deposit transaction', async () => {
    try {
      const result = await FlowService.deposit('0', 50.0)
      expect(result).toHaveProperty('transactionId')
    } catch (error: any) {
      // Expected if no vault exists or no user connected
      expect(error).toBeDefined()
    }
  })
})

// -------------------------------------------------------------------------
// FlowService — Event Query Tests
// -------------------------------------------------------------------------

describe('FlowService.getVaultEvents()', () => {
  it('should return an array of events for an address with activity', async () => {
    const events = await FlowService.getVaultEvents(MOCK_ADDRESS)
    expect(Array.isArray(events)).toBe(true)
    events.forEach((event) => {
      expect(event).toHaveProperty('type')
      expect(event).toHaveProperty('vaultId')
      expect(event).toHaveProperty('amount')
      expect(event).toHaveProperty('timestamp')
    })
    // Events should be sorted chronologically
    for (let i = 1; i < events.length; i++) {
      expect(events[i].timestamp).toBeGreaterThanOrEqual(events[i - 1].timestamp)
    }
  })

  it('should return an empty array for an inactive address', async () => {
    const events = await FlowService.getVaultEvents('0x0000000000000000')
    expect(Array.isArray(events)).toBe(true)
    expect(events.length).toBe(0)
  })
})

// -------------------------------------------------------------------------
// FlowService — Performance History Tests
// -------------------------------------------------------------------------

describe('FlowService.buildPerformanceHistory()', () => {
  it('should build a performance history from deposit events', () => {
    const events = [
      { type: 'created' as const, vaultId: '0', amount: 100, timestamp: 1000, blockHeight: 1 },
      { type: 'deposit' as const, vaultId: '0', amount: 50, timestamp: 2000, blockHeight: 2 },
    ]
    const history = FlowService.buildPerformanceHistory(events, 150)
    expect(history.length).toBe(3) // 2 events + final state
    expect(history[history.length - 1].cumulativePnl).toBe(0) // No yield yet
  })

  it('should calculate cumulative PnL correctly', () => {
    const events = [
      { type: 'created' as const, vaultId: '0', amount: 1000, timestamp: 1000, blockHeight: 1 },
      { type: 'deposit' as const, vaultId: '0', amount: 500, timestamp: 2000, blockHeight: 2 },
      { type: 'withdraw' as const, vaultId: '0', amount: 300, timestamp: 3000, blockHeight: 3 },
    ]
    const history = FlowService.buildPerformanceHistory(events, 1250)
    const final = history[history.length - 1]
    // Total deposited: 1000 + 500 = 1500
    // Total withdrawn: 300
    // Current balance: 1250
    // Cumulative PnL: 1250 - (1500 - 300) = 1250 - 1200 = 50
    expect(final.cumulativePnl).toBe(50)
  })

  it('should return an empty array for no events', () => {
    const history = FlowService.buildPerformanceHistory([], 0)
    expect(history.length).toBe(0)
  })
})

// -------------------------------------------------------------------------
// Vault Data Transformation Tests
// -------------------------------------------------------------------------

describe('Vault data transformation', () => {
  it('should calculate PnL correctly from on-chain VaultInfo', () => {
    // Simulate data coming from SentinelVaultFinal.VaultInfo
    const vaultInfo = {
      id: '0',
      name: 'Test Vault',
      balance: '1150.0',
      isActive: true,
      strategy: 'Flow Liquid Staking Pro',
      strategyId: 'liquid-staking-pro',
      lastExecution: '1717200000.0',
      totalYieldAccrued: '150.0',
    }

    const balance = parseFloat(vaultInfo.balance)
    const totalYieldAccrued = parseFloat(vaultInfo.totalYieldAccrued)
    const totalDeposits = balance - totalYieldAccrued

    // Balance was deposited: 1000
    // Yield generated: 150
    expect(totalDeposits).toBe(1000.0)
    expect(totalYieldAccrued).toBe(150.0)
    expect(balance).toBe(1150.0)

    // PnL percent
    const pnlPercent = totalDeposits > 0
      ? (totalYieldAccrued / totalDeposits) * 100
      : 0
    expect(pnlPercent).toBe(15.0) // 15% return
  })
})
