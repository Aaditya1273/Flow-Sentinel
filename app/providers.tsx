'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { config } from 'lib/wagmi'
import { FlowProvider } from 'lib/flow'
import { TransactionProvider } from 'lib/transactions'
import { useState } from 'react'

import '@rainbow-me/rainbowkit/styles.css'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#00D4FF',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          <FlowProvider>
            <TransactionProvider>
              {children}
            </TransactionProvider>
          </FlowProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}