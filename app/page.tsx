import type { Metadata } from 'next'
import LandingPage from './landing/page'

export const metadata: Metadata = {
  title: 'Flow Sentinel: Autonomous DeFi Security Platform',
  description: 'Flow Sentinel is the Autonomous DeFi Security Platform. Protect, optimize, and grow your assets with cryptographic proofs, programmable sentinels, and always-on yield.',
}

export default function Home() {
  return <LandingPage />
}
