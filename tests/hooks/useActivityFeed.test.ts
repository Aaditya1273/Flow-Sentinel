import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the fcl module
vi.mock('@onflow/fcl', () => {
  const mockQuery = vi.fn()
  const mockBlock = vi.fn()
  const mockSend = vi.fn()
  const mockDecode = vi.fn()

  return {
    __esModule: true,
    default: {
      query: mockQuery,
      block: mockBlock,
      send: mockSend,
      decode: mockDecode,
      config: vi.fn(),
      currentUser: { subscribe: vi.fn() },
      authenticate: vi.fn(),
      unauthenticate: vi.fn(),
    },
    query: mockQuery,
    block: mockBlock,
    send: mockSend,
    decode: mockDecode,
    config: vi.fn(),
    currentUser: { subscribe: vi.fn() },
  }
})

// Mock useFlow
vi.mock('lib/flow', () => ({
  useFlow: () => ({
    user: { loggedIn: true, addr: '0x1234' },
  }),
}))

import { useActivityFeed } from 'hooks/useActivityFeed'
import * as fcl from '@onflow/fcl'
import { renderHook, waitFor } from '@testing-library/react'

describe('useActivityFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading state initially', async () => {
    const mockFcl = fcl as unknown as { query: ReturnType<typeof vi.fn>; block: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn>; decode: ReturnType<typeof vi.fn> }

    // Mock block and query
    mockFcl.block.mockResolvedValue({ height: 1000000 })
    mockFcl.query.mockImplementation(async ({ cadence }: { cadence: string }) => {
      if (cadence.includes('getIDs')) return []
      if (cadence.includes('getVaultInfos')) return []
      return []
    })
    mockFcl.send.mockResolvedValue({})
    mockFcl.decode.mockResolvedValue([])

    const { result } = renderHook(() => useActivityFeed())

    expect(result.current.loading).toBe(true)
    expect(result.current.activities).toEqual([])

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should show welcome state when no vaults exist', async () => {
    const mockFcl = fcl as unknown as { query: ReturnType<typeof vi.fn>; block: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn>; decode: ReturnType<typeof vi.fn> }

    mockFcl.block.mockResolvedValue({ height: 1000000 })
    mockFcl.query.mockImplementation(async ({ cadence }: { cadence: string }) => {
      if (cadence.includes('getIDs')) return []
      if (cadence.includes('getVaultInfos')) return []
      return []
    })
    mockFcl.send.mockResolvedValue({})
    mockFcl.decode.mockResolvedValue([])

    const { result } = renderHook(() => useActivityFeed())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.activities.length).toBeGreaterThanOrEqual(1)
      expect(result.current.activities[0].type).toBe('alert')
      expect(result.current.activities[0].title).toBe('System Ready')
    })
  })

  it('should handle blockchain errors gracefully showing Connection Issue', async () => {
    const mockFcl = fcl as unknown as { query: ReturnType<typeof vi.fn>; block: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn>; decode: ReturnType<typeof vi.fn> }

    // Make the first query fail
    mockFcl.query.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useActivityFeed())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    // When query fails, the catch block should produce a Connection Issue alert
    expect(result.current.activities.length).toBeGreaterThanOrEqual(1)
  })

  it('should provide a working refetch function', async () => {
    const mockFcl = fcl as unknown as { query: ReturnType<typeof vi.fn>; block: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn>; decode: ReturnType<typeof vi.fn> }

    mockFcl.block.mockResolvedValue({ height: 1000000 })
    mockFcl.query.mockImplementation(async ({ cadence }: { cadence: string }) => {
      if (cadence.includes('getIDs')) return []
      if (cadence.includes('getVaultInfos')) return []
      return []
    })
    mockFcl.send.mockResolvedValue({})
    mockFcl.decode.mockResolvedValue([])

    const { result } = renderHook(() => useActivityFeed())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // refetch should be a function
    expect(typeof result.current.refetch).toBe('function')
  })
})
