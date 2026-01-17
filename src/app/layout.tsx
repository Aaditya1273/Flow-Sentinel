import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}