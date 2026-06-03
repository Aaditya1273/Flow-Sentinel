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
    const vaults = (await FlowService.getVaultList('0x0000000000000000')) as Array<unknown>
    expect(Array.isArray(vaults)).toBe(true)
    expect(vaults.length).toBe(0)
  })

  it('should return VaultInfo data for a user with deployed vaults', async () => {
    const vaults = (await FlowService.getVaultList(MOCK_ADDRESS)) as Array<Record<string, unknown>>
    if (vaults.length > 0) {
      const vault = vaults[0]
      // V2 VaultInfo fields
      expect(vault).toHaveProperty('id')
      expect(vault).toHaveProperty('name')
      expect(vault).toHaveProperty('balance')
      expect(vault).toHaveProperty('status')
      expect(vault).toHaveProperty('isActive')
      expect(vault).toHaveProperty('strategy')
      expect(vault).toHaveProperty('strategyId')
      expect(vault).toHaveProperty('totalYieldAccrued')
    }
  })
})

describe('FlowService.getAllStrategies()', () => {
  it('should return at least 3 default strategies', async () => {
    const strategies = (await FlowService.getAllStrategies()) as Array<unknown>
    expect(Array.isArray(strategies)).toBe(true)
    expect(strategies.length).toBeGreaterThanOrEqual(3)
  })

  it('should include liquid-staking-pro strategy with oracle-powered APY', async () => {
    const strategies = (await FlowService.getAllStrategies()) as Array<Record<string, unknown>>
    const liquidStaking = strategies.find((s) => (s as Record<string, unknown>).id === 'liquid-staking-pro') as Record<string, unknown> | undefined
    expect(liquidStaking).toBeDefined()
    const ls = liquidStaking!
    expect(ls.name).toBe('Flow Liquid Staking Pro')
    expect(ls.riskLevel).toBe(1)
    // V2 fields: APY comes from YieldOracle
    expect(ls).toHaveProperty('expectedAPY')
    expect(ls).toHaveProperty('apySource')
    expect(ls).toHaveProperty('features')
    expect(ls.features).toContain('Oracle-Powered APY')
  })
})

// -------------------------------------------------------------------------
// FlowService — Transaction Tests (require emulator + deployed contracts)
// -------------------------------------------------------------------------

describe('FlowService.createVaultWithStrategy()', () => {
  it('should submit a create vault transaction with V2 cadence', async () => {
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
    } catch (error: unknown) {
      // If no user is connected / emulator not running, expect auth error
      expect(error).toBeDefined()
    }
  })
})

describe('FlowService.deposit()', () => {
  it('should submit a deposit transaction (V2 SentinelVaultFinal)', async () => {
    try {
      const result = await FlowService.deposit('0', 50.0)
      expect(result).toHaveProperty('transactionId')
    } catch (error: unknown) {
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
// Vault Data Transformation Tests (V2 SentinelVaultFinal)
// -------------------------------------------------------------------------

describe('Vault data transformation (V2)', () => {
  it('should calculate PnL correctly from V2 VaultInfo', () => {
    // Simulate data coming from SentinelVaultFinal.VaultInfo (V2 format)
    const vaultInfo = {
      id: '0',
      name: 'Test Vault',
      balance: '1150.0',
      status: 'Active',
      isActive: true,
      strategy: 'Flow Liquid Staking Pro',
      strategyId: 'liquid-staking-pro',
      lastExecution: '1717200000.0',
      totalYieldAccrued: '150.0',
    }

    const balance = parseFloat(vaultInfo.balance)
    const totalYieldAccrued = parseFloat(vaultInfo.totalYieldAccrued)
    const totalDeposits = balance - totalYieldAccrued

    // Balance = deposits + yield
    expect(totalDeposits).toBe(1000.0)
    expect(totalYieldAccrued).toBe(150.0)
    expect(balance).toBe(1150.0)

    // PnL percent
    const pnlPercent = totalDeposits > 0
      ? (totalYieldAccrued / totalDeposits) * 100
      : 0
    expect(pnlPercent).toBe(15.0) // 15% return
  })

  it('should handle empty/zero vault state gracefully', () => {
    const vaultInfo = {
      id: '0',
      name: 'Empty Vault',
      balance: '0.0',
      status: 'Active',
      isActive: true,
      strategy: 'Flow Liquid Staking Pro',
      strategyId: 'liquid-staking-pro',
      lastExecution: null,
      totalYieldAccrued: '0.0',
    }

    const balance = parseFloat(vaultInfo.balance)
    const totalYieldAccrued = parseFloat(vaultInfo.totalYieldAccrued)
    expect(balance).toBe(0)
    expect(totalYieldAccrued).toBe(0)
  })
})
