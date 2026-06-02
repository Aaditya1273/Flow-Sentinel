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
  // Get a REAL project ID from https://cloud.reown.com (formerly WalletConnect Cloud)
  // This is REQUIRED for EVM wallet connections (MetaMask, Rainbow, etc.)
  // WARNING: 'demo-project-id' will cause EVM wallets to fail silently
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo-project-id',
  chains: [flowTestnet, flowEVM, mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
})