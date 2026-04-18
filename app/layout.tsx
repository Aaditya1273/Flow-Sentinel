import type { Metadata } from 'next'
import { Inter, Host_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

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
  title: 'Flow Sentinel - Autonomous DeFi Wealth Manager',
  description: 'The world\'s first autonomous, MEV-resistant wealth manager built on Flow blockchain',
  keywords: ['DeFi', 'Flow', 'Blockchain', 'Autonomous', 'MEV Protection', 'Wealth Management'],
  authors: [{ name: 'Flow Sentinel Team' }],
  openGraph: {
    title: 'Flow Sentinel - Autonomous DeFi Wealth Manager',
    description: 'The world\'s first autonomous, MEV-resistant wealth manager built on Flow blockchain',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flow Sentinel - Autonomous DeFi Wealth Manager',
    description: 'The world\'s first autonomous, MEV-resistant wealth manager built on Flow blockchain',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
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
        <Providers>
          <div className="flex flex-col min-h-screen relative z-10">
            {children}
          </div>
        </Providers>
        <div className="fixed inset-0 bg-grid pointer-events-none opacity-30 z-0" />
      </body>
    </html>
  )
}