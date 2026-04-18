'use client'

import Link from 'next/link'
import { Shield, Twitter, Github, MessageCircle, ArrowRight, Activity, Globe, Database, Cpu } from 'lucide-react'
import { motion } from 'framer-motion'

export function Footer() {
  const footerLinks = {
    PROTOCOL: [
      { name: 'SENTINEL VAULTS', href: '/vaults' },
      { name: 'ANALYTICS ENGINE', href: '/analytics' },
      { name: 'REBALANCING LOGIC', href: '/logic' },
      { name: 'STRATEGY MATRIX', href: '/strategies' },
    ],
    DEVELOPERS: [
      { name: 'DOCUMENTATION', href: '/docs' },
      { name: 'API REFERENCE', href: '/api' },
      { name: 'SENTINEL SDK', href: '/sdk' },
      { name: 'CORE CONTRACTS', href: '/contracts' },
    ],
    SECURITY: [
      { name: 'CIRCUIT BREAKERS', href: '/security' },
      { name: 'PASSKEY HANDSHAKE', href: '/auth' },
      { name: 'MULTI-SIG GUARDIAN', href: '/guardians' },
      { name: 'AUDIT LOGS', href: '/audit' },
    ],
    GOVERNANCE: [
      { name: 'SENTINEL DAO', href: '/dao' },
      { name: 'WHITEPAPER', href: '/whitepaper' },
      { name: 'SYSTEM STATUS', href: '/status' },
      { name: 'DISCLOSURE', href: '/disclosure' },
    ],
  }

  return (
    <footer className="relative bg-[#050505] pt-40 pb-12 border-t border-white/5 overflow-hidden">
      {/* Institutional Backdrop Watermark */}
      <div className="absolute inset-x-0 bottom-1/4 flex justify-center pointer-events-none select-none opacity-[0.02]">
        <span className="text-[25vw] font-display font-black tracking-tighter uppercase whitespace-nowrap">
          SENTINEL
        </span>
      </div>

      <div className="container mx-auto px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-20 mb-32">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-4 mb-10 group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-display font-black text-white uppercase tracking-tighter">
                Flow Sentinel
              </span>
            </Link>
            <p className="text-sm text-white/40 font-medium leading-relaxed uppercase tracking-tight mb-12 max-w-sm">
              The world's first autonomous wealth infrastructure. Engineered for institutional precision and powered by the Flow network.
            </p>
            <div className="flex gap-4">
              {[Twitter, Github, MessageCircle].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Institutional Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="lg:col-span-1">
              <h3 className="text-[10px] font-display font-black text-white uppercase tracking-[0.4em] mb-10">{category}</h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="group flex items-center gap-2 text-[11px] font-sans font-bold text-white/30 hover:text-white transition-all duration-200"
                    >
                      <span className="uppercase tracking-widest">{link.name}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Global Infrastructure Status Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.3em]">
              © 2026 SENTINEL PROTOCOL / GLOBAL AUTONOMOUS LAYER
            </p>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-white/20" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono font-black text-white/20 uppercase tracking-widest">Global Reach</span>
                  <span className="text-[10px] font-mono font-black text-white uppercase tracking-tighter">142 NODES</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="absolute inset-0 bg-primary/40 rounded-full animate-ping scale-150 opacity-20" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono font-black text-white/20 uppercase tracking-widest">Network Sync</span>
                  <span className="text-[10px] font-mono font-black text-primary uppercase tracking-tighter">100% OPERATIONAL</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[8px] font-mono font-black text-white/20 uppercase tracking-[0.5em]">POWERED BY</span>
            <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-primary/20 transition-all duration-500">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_15px_rgba(0,245,212,0.8)]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-display font-black text-white uppercase tracking-tighter group-hover:text-primary transition-colors">FLOW MAINNET</span>
                <span className="text-[8px] font-mono font-black text-white/20 uppercase tracking-widest leading-none">SECURE_LAYER_V3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

