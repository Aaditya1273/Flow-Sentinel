import type { Metadata } from 'next'
import { Inter, Outfit, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
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
      <body className={`${inter.variable} ${outfit.variable} ${spaceGrotesk.variable} font-sans antialiased`} suppressHydrationWarning>
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