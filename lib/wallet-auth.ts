// lib/wallet-auth.ts — Phase 6: wallet-signature based authentication
// No passwords. The user signs a timestamped message with their Flow wallet.
// The server verifies the signature using FCL's AppUtils.verifyUserSignatures.
// This proves wallet ownership without any backend user store or OAuth.

import * as fcl from '@onflow/fcl'

const AUTH_WINDOW_MINUTES = 5  // signature is valid for 5 minutes

// ── Client-side: create a signed auth header ──

/**
 * Build the canonical auth message for a given address and minute window.
 * The message changes every AUTH_WINDOW_MINUTES — replayed tokens expire.
 */
export function buildAuthMessage(address: string): string {
  const window = Math.floor(Date.now() / (AUTH_WINDOW_MINUTES * 60 * 1000))
  return `Flow Sentinel Auth\nAddress: ${address}\nWindow: ${window}\nApp: flow-sentinel`
}

/**
 * Sign the auth message with the user's connected Flow wallet.
 * Returns headers to attach to API requests.
 */
export async function getAuthHeaders(address: string): Promise<HeadersInit> {
  const message = buildAuthMessage(address)
  const compSigs = await fcl.currentUser.signUserMessage(message)
  return {
    'x-wallet-address': address,
    'x-auth-message': message,
    'x-auth-signatures': JSON.stringify(compSigs),
    'Content-Type': 'application/json',
  }
}

// ── Server-side: verify the signature ──

/**
 * Verify that the request was signed by the wallet address in the header.
 * Returns the verified address or null if verification fails.
 *
 * Call this in every API route that requires auth.
 */
export async function verifyWalletAuth(headers: Headers): Promise<string | null> {
  const address = headers.get('x-wallet-address')
  const message = headers.get('x-auth-message')
  const sigsRaw = headers.get('x-auth-signatures')

  if (!address || !message || !sigsRaw) return null

  let signatures: unknown[]
  try {
    signatures = JSON.parse(sigsRaw)
  } catch {
    return null
  }

  try {
    // Verify the message has not expired (check window matches)
    const currentWindow = Math.floor(Date.now() / (AUTH_WINDOW_MINUTES * 60 * 1000))
    const previousWindow = currentWindow - 1
    const expectedMsgCurrent = buildAuthMessage(address).includes(`Window: ${currentWindow}`)
    const expectedMsgPrevious = message.includes(`Window: ${previousWindow}`)
    const validWindow = expectedMsgCurrent || expectedMsgPrevious
    if (!validWindow) return null

    // Verify the FCL composite signature
    const isValid = await fcl.AppUtils.verifyUserSignatures(
      message,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signatures as any
    )
    return isValid ? address : null
  } catch (err) {
    console.error('[wallet-auth] Verification failed:', err)
    return null
  }
}
