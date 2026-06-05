import '@testing-library/jest-dom'
import { vi } from 'vitest'

// ── Mock FCL (Flow Client Library) ──
// Provides mock blockchain data for tests without a running emulator.

const mockStrategies = [
  {
    id: 'liquid-staking-pro',
    name: 'Flow Liquid Staking Pro',
    description: 'Delegate FLOW to a trusted Flow staking node',
    riskLevel: 1,
    category: 'liquid-staking',
    minDeposit: 10.0,
    expectedAPY: 6.5,
    apySource: 'flow-staking',
    tvl: 0.0,
    participants: 0,
    isActive: true,
    verified: true,
    features: ['Real Flow Staking', 'Oracle-Powered APY', 'MEV Protection', 'Instant Liquidity'],
  },
  {
    id: 'defi-yield-maximizer',
    name: 'DeFi Yield Maximizer',
    description: 'Multi-protocol yield farming with oracle-powered APY',
    riskLevel: 2,
    category: 'yield-farming',
    minDeposit: 100.0,
    expectedAPY: 8.2,
    apySource: 'defi-labs-aggregator',
    tvl: 0.0,
    participants: 0,
    isActive: true,
    verified: true,
    features: ['Oracle-Powered APY', 'Multi-Protocol', 'Auto-Compound', 'MEV Protection'],
  },
  {
    id: 'arbitrage-hunter',
    name: 'Arbitrage Hunter',
    description: 'Cross-DEX arbitrage with oracle-verified prices',
    riskLevel: 2,
    category: 'arbitrage',
    minDeposit: 250.0,
    expectedAPY: 5.8,
    apySource: 'dex-aggregator',
    tvl: 0.0,
    participants: 0,
    isActive: true,
    verified: true,
    features: ['Oracle-Powered APY', 'MEV Protection', 'Cross-DEX', 'Gas-Optimized'],
  },
]

vi.mock('@onflow/fcl', () => ({
  default: {
    query: vi.fn().mockImplementation(async ({ cadence }) => {
      if (cadence.includes('StrategyRegistry.getAllStrategies')) {
        return mockStrategies
      }
      if (cadence.includes('getVaultInfos')) {
        return []
      }
      if (cadence.includes('getAccount')) {
        return null
      }
      if (cadence.includes('StrategyRegistry.getAllStrategies')) {
        return mockStrategies
      }
      if (cadence.includes('getVaultInfos')) {
        return []
      }
      if (cadence.includes('flowTokenBalance')) {
        return 1000.0
      }
      return null
    }),
    mutate: vi.fn().mockResolvedValue('mock-transaction-id'),
    tx: vi.fn().mockReturnValue({ onceSealed: vi.fn().mockResolvedValue({}) }),
    currentUser: vi.fn().mockReturnValue({ addr: '0xf8d6e0586b0a20c7', loggedIn: true }),
    send: vi.fn().mockResolvedValue({}),
    decode: vi.fn().mockResolvedValue([]),
    block: vi.fn().mockResolvedValue({ height: 1000000, timestamp: Date.now() }),
  },
  query: vi.fn().mockImplementation(async ({ cadence }: { cadence: string }) => {
    if (cadence?.includes('StrategyRegistry.getAllStrategies')) {
      return mockStrategies
    }
    if (cadence?.includes('getVaultInfos')) {
      return []
    }
    return 1000.0
  }),
  mutate: vi.fn().mockResolvedValue('mock-transaction-id'),
  tx: vi.fn().mockReturnValue({ onceSealed: vi.fn().mockResolvedValue({}) }),
  currentUser: { addr: '0xf8d6e0586b0a20c7', loggedIn: true },
  send: vi.fn().mockResolvedValue({}),
  decode: vi.fn().mockResolvedValue([]),
  block: vi.fn().mockResolvedValue({ height: 1000000, timestamp: Date.now() }),
}))
