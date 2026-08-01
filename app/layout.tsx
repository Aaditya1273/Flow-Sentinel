import type { Metadata } from 'next'
import { Inter, Host_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { ProvidersWrapper } from 'components/ProvidersWrapper'

const usability = Inter({
  subsets: ['latin'],
  variable: '--font-usability',
  display: 'swap',
})

const authority = Host_Grotesk({
  subsets: ['latin'],
  variable: '--font-authority',
  display: 'swap',
})

const trust = IBM_Plex_Mono({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-trust',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Flow Sentinel - Protected Yield Vaults on Flow Blockchain',
  description: "FLOW custody infrastructure on the Flow blockchain. Yield integrations and autonomous execution are disabled until audited production adapters are deployed.",
  keywords: ['DeFi', 'Flow', 'Blockchain', 'Yield Vaults', 'Protected DeFi', 'Wealth Management'],
  authors: [{ name: 'Flow Sentinel Team' }],
  openGraph: {
    title: 'Flow Sentinel - Protected Yield Vaults on Flow Blockchain',
    description: "Protected yield vaults on the Flow blockchain. Higher net yield, safer execution, simpler DeFi.",
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flow Sentinel - Protected Yield Vaults on Flow Blockchain',
    description: "Protected yield vaults on the Flow blockchain. Higher net yield, safer execution, simpler DeFi.",
    images: ['/og-image.svg'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://flowsentinel.io'),
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${usability.variable} ${authority.variable} ${trust.variable} font-sans antialiased`} suppressHydrationWarning>
        <div className="noise-overlay" />
        <ProvidersWrapper>
          <div className="flex flex-col min-h-screen relative z-10">
            {children}
          </div>
        </ProvidersWrapper>
      </body>
    </html>
  )
}
