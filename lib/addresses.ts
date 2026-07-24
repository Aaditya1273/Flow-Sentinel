// ── Contract Addresses (Single Source of Truth) ──
// All components should import addresses from here, not define their own.

export const SENTINEL_VAULT_ADDRESS = process.env.NEXT_PUBLIC_SENTINEL_VAULT_ADDRESS || '0xc13b08053be24e87'
export const SENTINEL_INTERFACES_ADDRESS = process.env.NEXT_PUBLIC_SENTINEL_INTERFACES_ADDRESS || '0x136b642d0aa31ca9'
export const STRATEGY_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_STRATEGY_REGISTRY_ADDRESS || '0xc13b08053be24e87'
export const LIQUID_STAKING_STRATEGY_ADDRESS = process.env.NEXT_PUBLIC_LIQUID_STAKING_STRATEGY_ADDRESS || '0xc13b08053be24e87'
export const YIELD_FARMING_STRATEGY_ADDRESS = process.env.NEXT_PUBLIC_YIELD_FARMING_STRATEGY_ADDRESS || '0xc13b08053be24e87'
export const ARBITRAGE_STRATEGY_ADDRESS = process.env.NEXT_PUBLIC_ARBITRAGE_STRATEGY_ADDRESS || '0xc13b08053be24e87'
export const FLOW_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_FLOW_TOKEN_ADDRESS || '0x7e60df042a9c0868'
export const FUNGIBLE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS || '0x9a0766d93b6608b7'

// ── Shared FCL Type Helpers ──
// Import these in any file that builds Cadence queries/mutations

export type FCLArg = (value: unknown, type: unknown) => unknown

export type FCLTypes = {
  Address: unknown
  UInt64: unknown
  UFix64: unknown
  String: unknown
  UInt8: unknown
  Bool: unknown
  // Array type factory — e.g. t.Array([t.UInt8])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Array: (itemType: unknown[]) => unknown
  // Optional type factory
  Optional: (innerType: unknown) => unknown
}

export type FCLArgsFn = (arg: FCLArg, t: FCLTypes) => unknown[]

// ── Stripped address helper ──
export function stripAddress(addr: string): string {
  return addr.replace('0x', '')
}
