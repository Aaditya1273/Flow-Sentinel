'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import * as fcl from '@onflow/fcl'
import { useAccount } from 'wagmi'

// Configure FCL for Flow Testnet
fcl.config({
  'accessNode.api': process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || 'https://rest-testnet.onflow.org',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
  'app.detail.title': 'Flow Sentinel',
  'app.detail.icon': '/logo.png',
  'app.detail.description': 'Autonomous DeFi Wealth Manager',
  '0xSentinelVault': process.env.NEXT_PUBLIC_SENTINEL_VAULT_ADDRESS || '0x136b642d0aa31ca9',
  '0xSentinelInterfaces': process.env.NEXT_PUBLIC_SENTINEL_INTERFACES_ADDRESS || '0x136b642d0aa31ca9',
  '0xFungibleToken': process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS || '0x9a0766d93b6608b7',
  '0xFlowToken': process.env.NEXT_PUBLIC_FLOW_TOKEN_ADDRESS || '0x7e60df042a9c0868',
})

interface FlowUser {
  loggedIn: boolean
  addr?: string
  cid?: string
}

interface FlowContextType {
  user: FlowUser
  logIn: () => void
  logOut: () => void
  loading: boolean
  walletType: 'flow' | 'evm' | null
  setWalletType: (type: 'flow' | 'evm' | null) => void
  isConnected: boolean
}

const FlowContext = createContext<FlowContextType | undefined>(undefined)

export function FlowProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FlowUser>({ loggedIn: false })
  const [loading, setLoading] = useState(true)
  const [walletType, setWalletType] = useState<'flow' | 'evm' | null>(null)
  
  // EVM wallet connection
  const { address: evmAddress, isConnected: evmConnected } = useAccount()

  // Check if any wallet is connected
  const isConnected = user.loggedIn || evmConnected

  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe((user: FlowUser) => {
      setUser(user)
      if (user.loggedIn && !walletType) {
        setWalletType('flow')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [walletType])

  // Handle EVM wallet connection
  useEffect(() => {
    if (evmConnected && evmAddress && !walletType) {
      setWalletType('evm')
    }
    setLoading(false)
  }, [evmConnected, evmAddress, walletType])

  const logIn = () => {
    setLoading(true)
    if (walletType === 'flow') {
      fcl.authenticate()
    }
    // EVM login is handled by RainbowKit
  }

  const logOut = () => {
    setLoading(true)
    if (walletType === 'flow') {
      fcl.unauthenticate()
    }
    // EVM logout is handled by RainbowKit
    setWalletType(null)
  }

  // Create a unified user object
  const unifiedUser = {
    loggedIn: isConnected,
    addr: walletType === 'flow' ? user.addr : evmAddress,
    cid: user.cid
  }

  return (
    <FlowContext.Provider value={{ 
      user: unifiedUser, 
      logIn, 
      logOut, 
      loading, 
      walletType, 
      setWalletType,
      isConnected 
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