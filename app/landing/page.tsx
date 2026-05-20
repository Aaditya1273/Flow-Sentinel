import type { Metadata } from 'next'
import { LandingNavbar } from './navbar'
import { LandingHero } from './hero'
import { NoDowntimeSection } from './sections/no-downtime'
import { PowerTabsSection } from './sections/power-tabs'
import { PartnersSection } from './sections/partners'
import { UseCasesSection } from './sections/use-cases'
import { TokenSection } from './sections/token'
import { StackSection } from './sections/stack'
import { GuidesSection } from './sections/guides'
import { MarqueeStrip } from './sections/marquee'
import { LandingFooter } from './footer'

export const metadata: Metadata = {
  title: 'Flow Sentinel: Autonomous DeFi Security Platform',
  description: 'Flow Sentinel is the Autonomous DeFi Security Platform. Protect, optimize, and grow your assets with cryptographic proofs, programmable sentinels, and always-on yield.',
}

export default function LandingPage() {
  return (
    <div style={{ background: '#000', color: '#FAF8F5', overflowX: 'hidden' }}>
      <LandingNavbar />
      <LandingHero />
      {/* Section 3: No downtime — pure text, walrus-exact */}
      <NoDowntimeSection />
      {/* Section 3b: Power tabs slider */}
      <PowerTabsSection />
      {/* Section 4: Partners — aurora bg + salute mascot + marquee logos */}
      <PartnersSection />
      {/* Section 5: Use cases swiper */}
      <UseCasesSection />
      {/* Section 6: WAL/SEN Token — cream bg */}
      <TokenSection />
      {/* Section 7: Stack diagram — overlaps token section */}
      <StackSection />
      {/* Section 8: Guides — 3 cards */}
      <GuidesSection />
      {/* Section 9: Aurora marquee strip */}
      <MarqueeStrip />
      {/* Section 10: Footer — watermark + mascot */}
      <LandingFooter />
    </div>
  )
}
