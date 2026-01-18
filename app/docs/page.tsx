'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Book,
  Code,
  Shield,
  Zap,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Search,
  FileText,
  Video,
  MessageCircle,
  Terminal,
  Cpu,
  Lock,
  ArrowUpRight
} from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
import { formatCurrency } from 'lib/utils'

interface DocSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  items: DocItem[]
}

interface DocItem {
  title: string
  description: string
  type: 'guide' | 'api' | 'tutorial' | 'reference'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  readTime: string
}

const docSections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Deployment sequence',
    description: 'Establish your secure connection and initialize autonomous sentinel protocols.',
    icon: <Terminal className="w-5 h-5" />,
    items: [
      {
        title: 'Core Architecture',
        description: 'Deep dive into the world\'s first autonomous sentinel engine.',
        type: 'guide',
        difficulty: 'beginner',
        readTime: '5 min'
      },
      {
        title: 'Vault Initialization',
        description: 'Complete technical walkthrough of the multisig deployment process.',
        type: 'tutorial',
        difficulty: 'beginner',
        readTime: '10 min'
      },
      {
        title: 'Security Tier Analysis',
        description: 'Evaluate risk vectors across conservative and aggressive protocols.',
        type: 'guide',
        difficulty: 'beginner',
        readTime: '8 min'
      }
    ]
  },
  {
    id: 'strategies',
    title: 'Forte Protocols',
    description: 'Strategic execution specs for automated on-chain wealth management.',
    icon: <Cpu className="w-5 h-5" />,
    items: [
      {
        title: 'MEV-Shield Calculus',
        description: 'Understanding Native VRF jitter for front-running resistance.',
        type: 'guide',
        difficulty: 'advanced',
        readTime: '15 min'
      },
      {
        title: 'Yield Maximization',
        description: 'Automated compounding logic across Flow native pools.',
        type: 'guide',
        difficulty: 'intermediate',
        readTime: '12 min'
      },
      {
        title: 'Strategy Registry SDK',
        description: 'Building custom automated management modules with Cadence.',
        type: 'api',
        difficulty: 'advanced',
        readTime: '20 min'
      }
    ]
  }
]

const codeExample = `// Initialize Private Sentinel Vault
import SentinelVaultFinal from 0x136b642d0aa31ca9

transaction(vaultName: String, strategy: String) {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Deploying the most powerful DeFi manager...
        let vault <- SentinelVaultFinal.createVault(
            owner: signer.address,
            name: vaultName,
            strategy: strategy
        )
        
        // Permanent storage security...
        signer.storage.save(<-vault, to: /storage/Sentinel)
    }
}`

export default function DocsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeExample)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary selection:text-black">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />

      <Navbar />

      <div className="pt-32 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 h-full lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

            {/* Left Sidebar - High Level Stats & Navigation */}
            <div className="lg:col-span-4 space-y-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="mb-6">
                  <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 mb-6">
                    Documentation Core
                  </Badge>
                  <h1 className="text-6xl font-black text-white leading-tight uppercase italic tracking-tighter mb-4">
                    The Library <br /><span className="text-primary">of Power</span>
                  </h1>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    Access technical specifications, deployment strategies, and security protocols for the world's most advanced wealth manager.
                  </p>
                </div>

                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="QUERY PROTOCOL..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black tracking-widest text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-all uppercase"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="tool-card p-8 border-0 glass relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Shield className="w-20 h-20 text-white" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Lock className="w-3 h-3 text-secondary" /> System Integrity
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>Audit Status</span>
                    <span className="text-primary">Verified</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[98%] shadow-[0_0_8px_rgba(0,239,139,0.8)]" />
                  </div>
                  <p className="text-[10px] font-medium text-muted-foreground leading-tight italic">
                    All core Sentinel contracts have undergone rigorous formal verification and third-party security audits.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Content */}
            <div className="lg:col-span-8 space-y-16">

              {/* Code Example Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="tool-card p-0 border-0 glass overflow-hidden group/code"
              >
                <div className="bg-white/[0.03] border-b border-white/10 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4">SentinelVault.cdc</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors group/copy"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground group-hover/copy:text-white transition-colors" />}
                  </button>
                </div>
                <div className="p-8 bg-black/40 font-mono text-sm leading-relaxed overflow-x-auto selection:bg-primary/20">
                  <code className="text-white/90">
                    {codeExample.split('\n').map((line, i) => (
                      <div key={i} className="flex gap-6 group/line">
                        <span className="w-4 text-white/20 select-none text-right group-hover/line:text-primary transition-colors">{i + 1}</span>
                        <span className={line.startsWith('//') ? 'text-muted-foreground/50 italic' : line.includes('import') || line.includes('transaction') ? 'text-primary font-bold' : ''}>
                          {line}
                        </span>
                      </div>
                    ))}
                  </code>
                </div>
              </motion.div>

              {/* Documentation Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {docSections.map((section, idx) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (idx * 0.1) }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 glass rounded-xl flex items-center justify-center bg-primary/5 text-primary border-primary/20">
                        {section.icon}
                      </div>
                      <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                        {section.title}
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {section.items.map((item, i) => (
                        <div
                          key={item.title}
                          className="p-6 glass border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 rounded-2xl transition-all group cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-xs text-muted-foreground font-medium mt-1">
                                {item.description}
                              </p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>

                          <div className="flex items-center gap-4">
                            <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${item.difficulty === 'beginner' ? 'text-primary border-primary/20 bg-primary/5' :
                                item.difficulty === 'intermediate' ? 'text-warning border-warning/20 bg-warning/5' :
                                  'text-destructive border-destructive/20 bg-destructive/5'
                              }`}>
                              {item.difficulty}
                            </div>
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                              {item.readTime} READ
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Support/Footer Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="tool-card p-12 border-0 glass text-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
                  Still stuck in the <span className="text-primary">matrix?</span>
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto font-medium leading-relaxed">
                  Connect with our lead architects and the sentinel community for direct technical support.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button className="btn-primary rounded-xl h-12 uppercase font-black px-8">
                    Join Secure Comms
                  </Button>
                  <Button variant="outline" className="glass border-white/10 rounded-xl h-12 uppercase font-black px-8 hover:bg-white/5">
                    Lead Arch Support
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
