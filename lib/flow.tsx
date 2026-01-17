'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import * as fcl from '@onflow/fcl'

// Configure FCL for Flow
fcl.config({
  'accessNode.api': process.env.NODE_ENV === 'production' 
    ? 'https://rest-mainnet.onflow.org' 
    : 'https://rest-testnet.onflow.org',
  'discovery.wallet': process.env.NODE_ENV === 'production'
    ? 'https://fcl-discovery.onflow.org/authn'
    : 'https://fcl-discovery.onflow.org/testnet/authn',
  'app.detail.title': 'Flow Sentinel',
  'app.detail.icon': '/logo.png',
  'app.detail.description': 'Autonomous DeFi Wealth Manager',
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
}

const FlowContext = createContext<FlowContextType | undefined>(undefined)

export function FlowProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FlowUser>({ loggedIn: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe((user: FlowUser) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logIn = () => {
    setLoading(true)
    fcl.authenticate()
  }

  const logOut = () => {
    setLoading(true)
    fcl.unauthenticate()
  }

  return (
    <FlowContext.Provider value={{ user, logIn, logOut, loading }}>
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