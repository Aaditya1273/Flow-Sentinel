'use client'

import { useEffect, useState } from 'react'
import { Navbar } from 'components/layout/Navbar'

export default function PrivacyPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', background: 'radial-gradient(ellipse at center, rgba(0,239,139,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      
      <Navbar />

      <div style={{ paddingTop: 128, paddingBottom: 96, position: 'relative', zIndex: 10 }}>
        <div className="w-container" style={{ maxWidth: 800 }}>
          <h1 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, color: '#FAF8F5', margin: '0 0 8px', textTransform: 'uppercase' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(250,248,245,0.4)', marginBottom: 48 }}>
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <Section title="1. Information We Collect">
              <p><strong>Wallet Address.</strong> When you connect your wallet, we may access your public wallet address. This is pseudonymous information and is not linked to your identity unless you choose to associate it.</p>
              <p><strong>Transaction Data.</strong> Smart contract interactions (deposits, withdrawals, strategy executions) are recorded on the Flow blockchain and are publicly visible.</p>
              <p><strong>Usage Data.</strong> We collect anonymized usage statistics including page views and feature interactions through optional analytics. No personally identifiable information is tracked.</p>
            </Section>

            <Section title="2. Information We DO NOT Collect">
              <ul>
                <li>We do not collect your name, email, or phone number</li>
                <li>We do not collect your IP address</li>
                <li>We do not store your private keys or seed phrases</li>
                <li>We do not use cookies for tracking purposes</li>
                <li>We do not sell your data to third parties</li>
              </ul>
            </Section>

            <Section title="3. How We Use Your Information">
              <ul>
                <li>To display your vault and portfolio data</li>
                <li>To enable transaction execution on the Flow blockchain</li>
                <li>To improve user experience and fix bugs</li>
                <li>To communicate critical updates about the Protocol</li>
              </ul>
            </Section>

            <Section title="4. Blockchain Transparency">
              <p>All transactions on Flow Sentinel are executed on the Flow blockchain. Blockchain transactions are:</p>
              <ul>
                <li>Publicly visible to anyone</li>
                <li>Permanent and cannot be deleted</li>
                <li>Pseudonymous (associated with your wallet address, not your identity)</li>
              </ul>
            </Section>

            <Section title="5. Data Security">
              <p>We implement reasonable security measures to protect your data. However, no system is completely secure. You understand that:</p>
              <ul>
                <li>Blockchain data cannot be altered or deleted once confirmed</li>
                <li>Your wallet security is your own responsibility</li>
                <li>The Team cannot recover lost private keys or access your funds</li>
              </ul>
            </Section>

            <Section title="6. Third-Party Services">
              <p>The Protocol may integrate with third-party services including:</p>
              <ul>
                <li>WalletConnect (for EVM wallet support)</li>
                <li>Sentry (for error monitoring, if configured)</li>
                <li>Flow blockchain infrastructure</li>
              </ul>
              <p>These services have their own privacy policies. We encourage you to review them.</p>
            </Section>

            <Section title="7. Your Rights">
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul>
                <li>Access your data</li>
                <li>Request deletion of non-blockchain data</li>
                <li>Opt out of analytics collection</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p>Note that blockchain data cannot be deleted as it exists on a decentralized network.</p>
            </Section>

            <Section title="8. Changes to This Policy">
              <p>We may update this Privacy Policy from time to time. Changes will be posted in the Protocol interface. Continued use after changes constitutes acceptance of the updated policy.</p>
            </Section>

            <Section title="9. Contact">
              <p>For privacy-related inquiries, please contact the team through the official Discord server or support channels listed on the Flow Sentinel website.</p>
            </Section>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 32, borderRadius: 32, border: '1px solid rgba(250,248,245,0.08)', background: 'rgba(250,248,245,0.02)' }}>
      <h2 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: '1.125rem', fontWeight: 500, letterSpacing: '-0.02em', color: '#37DDDF', margin: '0 0 16px', textTransform: 'uppercase' }}>
        {title}
      </h2>
      <div style={{ fontSize: '0.8125rem', lineHeight: 1.8, color: 'rgba(250,248,245,0.7)' }}>
        {children}
      </div>
    </div>
  )
}
