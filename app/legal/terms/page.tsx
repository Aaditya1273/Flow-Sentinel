'use client'

import { useEffect, useState } from 'react'
import { Navbar } from 'components/layout/Navbar'

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p style={{ fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(250,248,245,0.4)', marginBottom: 48 }}>
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <Section title="1. Acceptance of Terms">
              <p>By accessing or using Flow Sentinel (&ldquo;the Protocol&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use the Protocol.</p>
              <p>These Terms constitute a binding agreement between you (&ldquo;User&rdquo;) and the Flow Sentinel development team (&ldquo;Team&rdquo;).</p>
            </Section>

            <Section title="2. Protocol Description">
              <p>Flow Sentinel is an autonomous DeFi wealth management protocol deployed on the Flow blockchain. It enables users to:</p>
              <ul>
                <li>Create and manage automated investment vaults</li>
                <li>Deposit FLOW tokens for strategy execution</li>
                <li>Participate in yield-generating strategies</li>
                <li>Utilize MEV protection mechanisms</li>
              </ul>
            </Section>

            <Section title="3. No Guarantee of Returns">
              <p><strong>CRITICAL: Flow Sentinel does not guarantee any returns.</strong> All strategies involve risk, including the potential total loss of deposited assets.</p>
              <p>Past performance displayed in any interface is for informational purposes only and does not predict future results. All APY and performance figures are estimates and may not reflect actual returns.</p>
              <p>Users acknowledge that DeFi strategies carry inherent risks including but not limited to:</p>
              <ul>
                <li>Smart contract vulnerabilities</li>
                <li>Market volatility and impermanent loss</li>
                <li>MEV attacks and front-running</li>
                <li>Oracle manipulation</li>
                <li>Blockchain network congestion</li>
                <li>Regulatory uncertainty</li>
              </ul>
            </Section>

            <Section title="4. User Responsibilities">
              <p>Users are solely responsible for:</p>
              <ul>
                <li>Maintaining the security of their wallet and private keys</li>
                <li>Understanding the risks associated with each strategy</li>
                <li>Complying with applicable laws and regulations</li>
                <li>Paying all transaction fees (gas costs) on the Flow network</li>
                <li>Reporting any suspected vulnerabilities responsibly</li>
              </ul>
            </Section>

            <Section title="5. Smart Contract Risk">
              <p>Flow Sentinel is governed by smart contracts deployed on the Flow blockchain. These contracts have undergone internal review but may contain undiscovered vulnerabilities.</p>
              <p>Users acknowledge that:</p>
              <ul>
                <li>Smart contracts may contain bugs that could result in loss of funds</li>
                <li>No smart contract is completely immune to exploitation</li>
                <li>The Team is not liable for losses resulting from contract vulnerabilities</li>
                <li>Users should only deposit funds they can afford to lose</li>
              </ul>
            </Section>

            <Section title="6. Fees">
              <p>The Protocol may charge fees for certain operations. Current fee structure:</p>
              <ul>
                <li>Vault creation: Gas costs only</li>
                <li>Deposits: Gas costs only</li>
                <li>Withdrawals: Gas costs only</li>
                <li>Strategy execution: Gas costs only + potential protocol fees</li>
              </ul>
              <p>Fee structures may change with notice posted in the Protocol interface.</p>
            </Section>

            <Section title="7. Limitation of Liability">
              <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE FLOW SENTINEL TEAM SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR IN CONNECTION WITH THE USE OF THE PROTOCOL.</p>
            </Section>

            <Section title="8. Modifications">
              <p>The Team reserves the right to modify these Terms at any time. Users will be notified of material changes through the Protocol interface. Continued use after changes constitutes acceptance of the modified Terms.</p>
            </Section>

            <Section title="9. Governing Law">
              <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where the Team is established. Any disputes shall be resolved through binding arbitration.</p>
            </Section>

            <Section title="10. Contact">
              <p>For questions about these Terms, please contact the team through the official Discord server or support channels listed on the Flow Sentinel website.</p>
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
      <h2 style={{ fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif', fontSize: '1.125rem', fontWeight: 500, letterSpacing: '-0.02em', color: '#00EF8B', margin: '0 0 16px', textTransform: 'uppercase' }}>
        {title}
      </h2>
      <div style={{ fontSize: '0.8125rem', lineHeight: 1.8, color: 'rgba(250,248,245,0.7)' }}>
        {children}
      </div>
    </div>
  )
}
