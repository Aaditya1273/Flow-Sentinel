import type { Metadata } from 'next'
import LandingPage from './landing/page'

export const metadata: Metadata = {
  title: 'Flow Sentinel: Protected Yield Vaults on Flow Blockchain',
  description: 'Flow Sentinel is a testnet FLOW custody prototype. Yield integrations and autonomous execution are disabled pending audited production adapters.',
}

export default function Home() {
  return <LandingPage />
}
