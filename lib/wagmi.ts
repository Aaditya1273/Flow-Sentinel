import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains'
import { createStorage, cookieStorage } from 'wagmi'

// Custom Flow EVM chain
const flowEVM = {
  id: 747,
  name: 'Flow EVM',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: { name: 'FlowScan', url: 'https://evm.flowscan.io' },
  },
} as const

const flowTestnet = {
  id: 545,
  name: 'Flow EVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: { name: 'FlowScan Testnet', url: 'https://testnet.evm.flowscan.io' },
  },
  testnet: true,
} as const

export const config = getDefaultConfig({
  appName: 'Flow Sentinel',
  // Flow FCL wallet is the PRIMARY auth method for this app.
  // EVM wallet support (MetaMask, Rainbow) via RainbowKit is SECONDARY.
  // For EVM to work, get a project ID from https://cloud.reown.com (formerly WalletConnect)
  // WARNING: Without a valid project ID, EVM wallet connections will silently fail.
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || (() => {
    if (typeof window !== 'undefined') {
      console.warn(
        '⚠️ NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID not set. ' +
        'EVM wallets (MetaMask, Rainbow) will not work. ' +
        'Get a project ID at https://cloud.reown.com'
      )
    }
    return 'demo-project-id'
  })(),
  chains: [flowTestnet, flowEVM, mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
})