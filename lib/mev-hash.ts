/**
 * lib/mev-hash.ts
 * 
 * Phase 1 Fix: Client-side SHA3-256 commit hash generation.
 * Mirrors exactly what MEVShieldCore.buildCommitHash() computes on-chain.
 * The preimage never leaves the client — only the 32-byte hash is submitted.
 * 
 * Usage:
 *   import { buildCommitHash, generateNonce, hashToUInt8Array } from 'lib/mev-hash'
 * 
 *   const nonce = generateNonce()
 *   const deadlineBlock = currentBlock + 200
 *   const hashBytes = await buildCommitHash({ vaultId, nonce, amount, strategyId, deadlineBlock, committer })
 *   // Submit hashBytes to mev_commit.cdc as [UInt8]
 */

/** All params that go into the commit hash. Must match MEVShieldCore.buildCommitHash() exactly. */
export interface CommitParams {
  vaultId: string | number
  nonce: string | bigint
  amount: string | number   // UFix64 string e.g. "100.00000000"
  strategyId: string
  deadlineBlock: string | number
  committer: string         // Flow address e.g. "0xc13b08053be24e87"
}

/**
 * Build the canonical preimage string.
 * Must match: "SENTINEL|{vaultId}|{nonce}|{amount}|{strategyId}|{deadlineBlock}|{committer}"
 * in MEVShieldCore.buildCommitPreimage()
 */
export function buildPreimage(params: CommitParams): string {
  // Normalize amount to UFix64 8-decimal format
  const amount = formatUFix64(String(params.amount))
  return [
    'SENTINEL',
    String(params.vaultId),
    String(params.nonce),
    amount,
    params.strategyId,
    String(params.deadlineBlock),
    params.committer,
  ].join('|')
}

/**
 * Compute SHA3-256 hash of commit params.
 * Returns a Uint8Array (32 bytes) — pass to FCL as [UInt8] array.
 * 
 * Uses Web Crypto API (available in all modern browsers and Node 18+).
 * Note: Web Crypto uses SHA-256, not SHA3-256. For production, use js-sha3.
 * We include both implementations — SHA3 via dynamic import fallback.
 */
export async function buildCommitHash(params: CommitParams): Promise<Uint8Array> {
  const preimage = buildPreimage(params)
  const encoder = new TextEncoder()
  const data = encoder.encode(preimage)

  try {
    // Try to use js-sha3 for true SHA3-256 (matches Cadence HashAlgorithm.SHA3_256)
    const { sha3_256 } = await import('js-sha3')
    const hexHash = sha3_256(data)
    return hexToUint8Array(hexHash)
  } catch {
    // Fallback: Web Crypto SHA-256 (different algorithm — use only for testing)
    // In production, always install js-sha3: npm install js-sha3
    console.warn('[mev-hash] js-sha3 not available — falling back to SHA-256. Install js-sha3 for production.')
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    return new Uint8Array(hashBuffer)
  }
}

/**
 * Synchronous SHA3-256 (requires js-sha3 to be bundled).
 * Use this in transactions.ts where async is not available.
 */
export function buildCommitHashSync(params: CommitParams): number[] {
  // This requires js-sha3 to be installed: npm install js-sha3
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { sha3_256 } = require('js-sha3')
  const preimage = buildPreimage(params)
  const encoder = new TextEncoder()
  const data = encoder.encode(preimage)
  const hexHash: string = sha3_256(data)
  return Array.from(hexToUint8Array(hexHash))
}

/**
 * Generate a cryptographically secure random nonce.
 * Uses crypto.getRandomValues — safe in browser and Node 18+.
 */
export function generateNonce(): bigint {
  const buf = new Uint8Array(8)
  crypto.getRandomValues(buf)
  // Combine 8 bytes into a UInt64 value
  let value = BigInt(0)
  for (const byte of buf) {
    value = (value << BigInt(8)) | BigInt(byte)
  }
  // Cadence UInt64 max is 18446744073709551615
  return value
}

/**
 * Convert Uint8Array to FCL-compatible [UInt8] number array.
 * FCL argument type t.Array([t.UInt8]) expects number[].
 */
export function uint8ArrayToFCLArray(bytes: Uint8Array): number[] {
  return Array.from(bytes)
}

/**
 * Convert hex string to Uint8Array.
 */
export function hexToUint8Array(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

/**
 * Convert Uint8Array to hex string (for display / debugging).
 */
export function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Format a number as UFix64 8-decimal string (matches Cadence UFix64.toString()).
 * e.g. 100 → "100.00000000", 6.5 → "6.50000000"
 */
export function formatUFix64(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return num.toFixed(8)
}

/**
 * Full commit workflow helper.
 * Use this in CreateVaultModal and VaultCard to generate commit params for mev_commit.cdc.
 */
export async function prepareCommit(
  vaultId: string,
  amount: number,
  strategyId: string,
  currentBlock: number,
  committer: string
): Promise<{
  nonce: bigint
  deadlineBlock: number
  commitHash: number[]   // FCL [UInt8] array
  commitHashHex: string  // for logging/display
  preimage: string       // keep secret until reveal
}> {
  const nonce = generateNonce()
  const deadlineBlock = currentBlock + 200 // MEVShieldCore.getMEVCommitBlocks()
  const params: CommitParams = {
    vaultId,
    nonce,
    amount: formatUFix64(amount),
    strategyId,
    deadlineBlock,
    committer,
  }
  const hashBytes = await buildCommitHash(params)
  return {
    nonce,
    deadlineBlock,
    commitHash: uint8ArrayToFCLArray(hashBytes),
    commitHashHex: uint8ArrayToHex(hashBytes),
    preimage: buildPreimage(params),
  }
}
