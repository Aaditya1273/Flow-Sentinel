'use client'

import '@/lib/storage-polyfill'
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import * as fcl from '@onflow/fcl'

import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'
import { errorReporter } from '@/lib/sentry-wrapper'
import {
  SENTINEL_VAULT_ADDRESS,
  SENTINEL_INTERFACES_ADDRESS,
  STRATEGY_REGISTRY_ADDRESS,
  LIQUID_STAKING_STRATEGY_ADDRESS,
  YIELD_FARMING_STRATEGY_ADDRESS,
  ARBITRAGE_STRATEGY_ADDRESS,
  FLOW_TOKEN_ADDRESS,
  FUNGIBLE_TOKEN_ADDRESS,
} from 'lib/addresses'

// Configure FCL for Flow Testnet
if (typeof window !== 'undefined') {
  fcl.config({
    'accessNode.api': process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || 'https://rest-testnet.onflow.org',
    'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
    'discovery.authn.endpoint': 'https://fcl-discovery.onflow.org/api/testnet/authn',
    'walletconnect.projectId': process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'c4f79cc821944d9680842e34466bfb',
    'app.detail.title': 'Flow Sentinel',
    'app.detail.icon': '/logo.png',
    'app.detail.description': 'Autonomous DeFi Wealth Manager',
    '0xSentinelVaultFinal': SENTINEL_VAULT_ADDRESS,
    '0xMEVShieldCore': SENTINEL_VAULT_ADDRESS,
    '0xYieldOracle': SENTINEL_VAULT_ADDRESS,
    '0xSentinelInterfaces': SENTINEL_INTERFACES_ADDRESS,
    '0xStrategyRegistry': STRATEGY_REGISTRY_ADDRESS,
    '0xLiquidStakingStrategy': LIQUID_STAKING_STRATEGY_ADDRESS,
    '0xYieldFarmingStrategy': YIELD_FARMING_STRATEGY_ADDRESS,
    '0xArbitrageStrategy': ARBITRAGE_STRATEGY_ADDRESS,
    '0xFungibleToken': FUNGIBLE_TOKEN_ADDRESS,
    '0xFlowToken': FLOW_TOKEN_ADDRESS,
  })
}

// Expected network ID for Flow EVM Testnet
const EXPECTED_EVM_CHAIN_ID = 545

interface FlowUser {
  loggedIn?: boolean
  addr?: string
  cid?: string
}

export type WalletType = 'flow' | 'evm' | null

export type AuthErrorType = 'none' | 'rejected' | 'network' | 'expired' | 'unknown'

interface AuthError {
  type: AuthErrorType
  message: string
}

interface FlowContextType {
  user: FlowUser
  logIn: (type?: WalletType) => Promise<void>
  logOut: () => Promise<void>
  loading: boolean
  walletType: WalletType
  setWalletType: (type: WalletType) => void
  isConnected: boolean
  authError: AuthError | null
  clearAuthError: () => void
  showDisconnectConfirm: boolean
  setShowDisconnectConfirm: (show: boolean) => void
  isWrongNetwork: boolean
  switchToFlowTestnet: () => Promise<void>
}

const FlowContext = createContext<FlowContextType | undefined>(undefined)

export function FlowProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FlowUser>({ loggedIn: false })
  const [loading, setLoading] = useState(true)
  const [walletType, setWalletType] = useState<WalletType>(null)
  const [authError, setAuthError] = useState<AuthError | null>(null)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [lastFlowDisconnect, setLastFlowDisconnect] = useState(0)

  // EVM wallet connection
  const { address: evmAddress, isConnected: evmConnected, chainId } = useAccount()
  const { disconnect: disconnectEvm } = useDisconnect()
  const { switchChain } = useSwitchChain()

  // Check if connected to wrong EVM network
  const isWrongNetwork = walletType === 'evm' && evmConnected && chainId !== EXPECTED_EVM_CHAIN_ID

  // Combined connection status
  const isConnected = user.loggedIn || evmConnected

  // ── FCL Flow wallet subscription (auto-reconnect) ──
  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe((fclUser: FlowUser) => {
      setUser(fclUser)
      if (fclUser.loggedIn) {
        setWalletType('flow')
        setAuthError(null) // Clear any previous auth error on successful connection
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, []) // Only mount once — FCL manages reconnection internally

  // ── EVM wallet detection ──
  useEffect(() => {
    if (evmConnected && evmAddress && !user.loggedIn) {
      setWalletType('evm')
      setAuthError(null)
    }
    if (!evmConnected && walletType === 'evm') {
      // EVM disconnected — wait a beat before clearing to avoid flash
      const timer = setTimeout(() => {
        if (!evmConnected) setWalletType(null)
      }, 500)
      return () => clearTimeout(timer)
    }
    setLoading(false)
  }, [evmConnected, evmAddress, user.loggedIn, walletType])

  // ── Flow wallet disconnect detection ──
  useEffect(() => {
    if (!user.loggedIn && walletType === 'flow' && Date.now() - lastFlowDisconnect > 1000) {
      setWalletType(null)
    }
  }, [user.loggedIn, walletType, lastFlowDisconnect])

  // ── Session expiry check ──
  useEffect(() => {
    if (!isConnected) return

    // Check wallet session every 120 seconds
    const interval = setInterval(async () => {
      if (walletType === 'flow') {
        try {
          const current = await fcl.currentUser.snapshot()
          if (!current.loggedIn) {
            setAuthError({ type: 'expired', message: 'Wallet session expired. Please reconnect.' })
            setWalletType(null)
            setUser({ loggedIn: false })
          }
        } catch {
          // Silently fail — session check isn't critical
        }
      } else if (walletType === 'evm') {
        if (!evmConnected) {
          setAuthError({ type: 'expired', message: 'EVM wallet disconnected. Please reconnect.' })
          setWalletType(null)
        }
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isConnected, walletType, evmConnected])

  // ── Log in ──
  const logIn = useCallback(async (type?: WalletType) => {
    const targetType = type || walletType || 'flow'
    setLoading(true)
    setAuthError(null)

    try {
      if (targetType === 'flow') {
        setWalletType('flow')
        await fcl.authenticate()
      } else if (targetType === 'evm') {
        // EVM login is handled by RainbowKit's openConnectModal
        // This path is only used when switching to EVM programmatically
        setWalletType('evm')
        // Trigger RainbowKit connect modal
        window.dispatchEvent(new CustomEvent('sentinel-connect-evm'))
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error)

      // Detect user rejection
      if (
        errMsg.toLowerCase().includes('declined') ||
        errMsg.toLowerCase().includes('rejected') ||
        errMsg.toLowerCase().includes('user cancelled') ||
        errMsg.toLowerCase().includes('user rejected') ||
        errMsg.toLowerCase().includes('[authn] resolve rejected')
      ) {
        setAuthError({ type: 'rejected', message: 'Signature was rejected. Please try again when ready.' })
        setWalletType(null)
      } else {
        errorReporter.captureException(error, { component: 'FlowContext', action: 'logIn' })
        setAuthError({ type: 'unknown', message: `Connection failed: ${errMsg.slice(0, 120)}` })
        setWalletType(null)
      }
    } finally {
      setLoading(false)
    }
  }, [walletType])

  // ── Log out (with disconnect confirmation) ──
  const logOut = useCallback(async () => {
    setLoading(true)
    try {
      if (walletType === 'flow') {
        await fcl.unauthenticate()
        setLastFlowDisconnect(Date.now())
      } else if (walletType === 'evm') {
        disconnectEvm()
      }
      setWalletType(null)
      setUser({ loggedIn: false })
      setShowDisconnectConfirm(false)
      setAuthError(null)
    } catch (error) {
      errorReporter.captureException(error, { component: 'FlowContext', action: 'logOut' })
    } finally {
      setLoading(false)
    }
  }, [walletType, disconnectEvm])

  // ── Switch to Flow Testnet (EVM) ──
  const switchToFlowTestnet = useCallback(async () => {
    try {
      await switchChain({ chainId: EXPECTED_EVM_CHAIN_ID })
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Failed to switch network'
      setAuthError({ type: 'network', message: errMsg })
    }
  }, [switchChain])

  // ── Clear auth error ──
  const clearAuthError = useCallback(() => setAuthError(null), [])

  // Unified user object
  const unifiedUser: FlowUser = {
    loggedIn: isConnected,
    addr: walletType === 'flow' ? user.addr : evmAddress,
    cid: user.cid,
  }

  return (
    <FlowContext.Provider value={{
      user: unifiedUser,
      logIn,
      logOut,
      loading,
      walletType,
      setWalletType,
      isConnected,
      authError,
      clearAuthError,
      showDisconnectConfirm,
      setShowDisconnectConfirm,
      isWrongNetwork,
      switchToFlowTestnet,
    }}>
      {children}
    </FlowContext.Provider>
  )
}

export function useFlow() {
  const context = useContext(FlowContext)
  if (context === undefined) {
    throw new Error('useFlow must be used within a FlowProvider')
  }
  return context
}
