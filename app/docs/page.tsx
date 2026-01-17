'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Book, 
  Code, 
  Shield, 
  Zap, 
  DollarSign,
  Users,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Search,
  FileText,
  Video,
  MessageCircle
} from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
import { Card } from 'components/ui/card'

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
    title: 'Getting Started',
    description: 'Learn the basics of Flow Sentinel and start your DeFi journey',
    icon: <Book className="w-6 h-6" />,
    items: [
      {
        title: 'What is Flow Sentinel?',
        description: 'Introduction to autonomous DeFi wealth management',
        type: 'guide',
        difficulty: 'beginner',
        readTime: '5 min'
      },
      {
        title: 'Creating Your First Vault',
        description: 'Step-by-step guide to setting up your first autonomous vault',
        type: 'tutorial',
        difficulty: 'beginner',
        readTime: '10 min'
      },
      {
        title: 'Understanding Risk Levels',
        description: 'Learn about different risk profiles and how to choose',
        type: 'guide',
        difficulty: 'beginner',
        readTime: '8 min'
      },
      {
        title: 'Wallet Connection Guide',
        description: 'How to connect your Flow wallet and manage funds',
        type: 'tutorial',
        difficulty: 'beginner',
        readTime: '7 min'
      }
    ]
  },
  {
    id: 'strategies',
    title: 'Investment Strategies',
    description: 'Deep dive into our autonomous investment strategies',
    icon: <Zap className="w-6 h-6" />,
    items: [
      {
        title: 'Liquid Staking Strategies',
        description: 'How our liquid staking vaults maximize rewards',
        type: 'guide',
        difficulty: 'intermediate',
        readTime: '12 min'
      },
      {
        title: 'Yield Farming Optimization',
        description: 'Advanced yield farming with MEV protection',
        type: 'guide',
        difficulty: 'advanced',
        readTime: '15 min'
      },
      {
        title: 'Arbitrage Mechanisms',
        description: 'How we capture arbitrage opportunities safely',
        type: 'guide',
        difficulty: 'advanced',
        readTime: '18 min'
      },
      {
        title: 'Risk Management Systems',
        description: 'Our multi-layered approach to risk management',
        type: 'reference',
        difficulty: 'intermediate',
        readTime: '10 min'
      }
    ]
  },
  {
    id: 'smart-contracts',
    title: 'Smart Contracts',
    description: 'Technical documentation for developers',
    icon: <Code className="w-6 h-6" />,
    items: [
      {
        title: 'SentinelVault Contract',
        description: 'Core vault contract documentation and API',
        type: 'api',
        difficulty: 'advanced',
        readTime: '20 min'
      },
      {
        title: 'Integration Guide',
        description: 'How to integrate with Sentinel contracts',
        type: 'tutorial',
        difficulty: 'advanced',
        readTime: '25 min'
      },
      {
        title: 'Contract Addresses',
        description: 'Deployed contract addresses on Flow networks',
        type: 'reference',
        difficulty: 'beginner',
        readTime: '2 min'
      },
      {
        title: 'Security Audits',
        description: 'Security audit reports and findings',
        type: 'reference',
        difficulty: 'intermediate',
        readTime: '15 min'
      }
    ]
  },
  {
    id: 'security',
    title: 'Security & Safety',
    description: 'Learn about our security measures and best practices',
    icon: <Shield className="w-6 h-6" />,
    items: [
      {
        title: 'Security Architecture',
        description: 'Overview of our security design and measures',
        type: 'guide',
        difficulty: 'intermediate',
        readTime: '12 min'
      },
      {
        title: 'MEV Protection',
        description: 'How we protect against MEV attacks',
        type: 'guide',
        difficulty: 'advanced',
        readTime: '15 min'
      },
      {
        title: 'Emergency Procedures',
        description: 'What happens during emergency situations',
        type: 'reference',
        difficulty: 'beginner',
        readTime: '8 min'
      },
      {
        title: 'Best Practices',
        description: 'Security best practices for users',
        type: 'guide',
        difficulty: 'beginner',
        readTime: '10 min'
      }
    ]
  }
]

const quickLinks = [
  { title: 'API Reference', icon: <Code className="w-4 h-4" />, href: '#' },
  { title: 'Video Tutorials', icon: <Video className="w-4 h-4" />, href: '#' },
  { title: 'Community Discord', icon: <MessageCircle className="w-4 h-4" />, href: '#' },
  { title: 'GitHub Repository', icon: <ExternalLink className="w-4 h-4" />, href: '#' }
]

const codeExample = `// Create a new Sentinel Vault
import SentinelVault from 0x136b642d0aa31ca9

transaction(name: String, strategy: String, minDeposit: UFix64) {
    prepare(signer: AuthAccount) {
        let vault <- SentinelVault.createVault(
            name: name,
            strategy: strategy,
            minDeposit: minDeposit
        )
        
        signer.save(<-vault, to: /storage/SentinelVault)
        
        signer.link<&SentinelVault.Vault{SentinelVault.VaultPublic}>(
            /public/SentinelVault,
            target: /storage/SentinelVault
        )
    }
}`

export default function DocsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeExample)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/20'
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20'
      case 'advanced': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide': return <Book className="w-4 h-4" />
      case 'tutorial': return <Video className="w-4 h-4" />
      case 'api': return <Code className="w-4 h-4" />
      case 'reference': return <FileText className="w-4 h-4" />
      default: return <Book className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Documentation
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Everything you need to know about Flow Sentinel
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <Card className="glass p-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        {link.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{link.title}</h3>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Code Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <Card className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">
                  Quick Start Example
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="flex items-center space-x-2"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  <code>{codeExample}</code>
                </pre>
              </div>
            </Card>
          </motion.div>

          {/* Documentation Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {docSections.map((section, sectionIndex) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + sectionIndex * 0.1 }}
              >
                <Card className="glass p-6 h-full">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      {section.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + sectionIndex * 0.1 + itemIndex * 0.05 }}
                        className="p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(item.type)}
                            <h4 className="font-medium text-white">
                              {item.title}
                            </h4>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-3">
                          {item.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getDifficultyColor(item.difficulty)} size="sm">
                              {item.difficulty}
                            </Badge>
                            <Badge variant="outline" size="sm">
                              {item.type}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {item.readTime}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Support Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <Card className="glass p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Need More Help?
              </h3>
              <p className="text-gray-300 mb-6">
                Can't find what you're looking for? Our community and support team are here to help.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Join Discord</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>Contact Support</span>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}