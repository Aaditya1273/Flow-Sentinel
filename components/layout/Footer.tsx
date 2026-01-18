'use client'

import Link from 'next/link'
import { Shield, Twitter, Github, MessageCircle, ExternalLink, Activity } from 'lucide-react'

export function Footer() {
  const footerLinks = {
    PROTOCOL: [
      { name: 'SENTINEL VAULTS', href: '/vaults' },
      { name: 'ANALYTICS ENGINE', href: '/analytics' },
      { name: 'YIELD PROJECTION', href: '/dashboard' },
      { name: 'RISK PARAMETERS', href: '/settings' },
    ],
    DEVELOPERS: [
      { name: 'DOCUMENTATION', href: '/docs' },
      { name: 'API REFERENCE', href: '/api' },
      { name: 'CORE CONTRACTS', href: '/contracts' },
      { name: 'GITHUB REPO', href: 'https://github.com/flow-sentinel' },
    ],
    GOVERNANCE: [
      { name: 'PROTOCOL DAO', href: '/about' },
      { name: 'SENTINEL BLOG', href: '/blog' },
      { name: 'SYSTEM STATUS', href: '/status' },
      { name: 'VULNERABILITY DISCLOSURE', href: '/security' },
    ],
  }

  return (
    <footer className="bg-background relative overflow-hidden pt-24 pb-12 border-t border-white/15">
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center bg-primary/5 border-primary/40 group-hover:bg-primary/10 transition-all">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-black text-white italic tracking-tighter uppercase">
                Flow Sentinel
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-10 max-w-sm italic font-medium leading-relaxed">
              The world's first autonomous wealth manager. Engineered for precision, secured by Flow Native Passkeys, and optimized by the Forte Engine.
            </p>
            <div className="flex gap-4">
              {[Twitter, Github, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 glass rounded-xl flex items-center justify-center border-white/15 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all hover:bg-primary/5">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8">{category}</h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors italic tracking-widest flex items-center gap-2 group">
                      {link.name}
                      <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-white/15 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
              © 2026 FLOW SENTINEL PROTOCOL / ALL RIGHTS RESERVED
            </p>
            <div className="flex items-center gap-2 px-3 py-1 glass rounded-full border-white/15 bg-white/[0.02]">
              <Activity className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Global Network Sync: 100%</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Engineered on</span>
            <div className="flex items-center gap-3 glass px-4 py-2 rounded-xl border-white/15">
              <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(0,239,139,0.5)]" />
              <span className="text-xs font-black text-white uppercase tracking-tighter italic">Flow Mainnet</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
