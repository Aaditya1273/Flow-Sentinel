'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  Plus,
  Settings,
  Activity
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { VaultCard } from '@/components/dashboard/VaultCard'
import { PortfolioChart } from '@/components/dashboard/PortfolioChart'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { CreateVaultModal } from '@/components/dashboard/CreateVaultModal'
import { useFlow } from '@/lib/flow'
import { formatCurrency, formatPercentage } from '@/lib/utils'

// Mock data - in real app, this would come from blockchain
const mockVaults = [
  {
    id: '1',
    name: 'Conservative Growth',
    balance: 1250.75,
    apy: 8.5,
    status: 'active',
    lastExecution: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    strategy: 'Balanced allocation across stable protocols',
    risk: 'low' as const
  },
  {
    id: '2', 
    name: 'Aggressive Yield',
    balance: 2840.32,
    apy: 15.2,
    status: 'active',
    lastExecution: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    strategy: 'High-yield farming with MEV protection',
    risk: 'high' as const
  },
  {
    id: '3',
    name: 'Emergency Fund',
    balance: 500.00,
    apy: 4.2,
    status: 'paused',
    lastExecution: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    strategy: 'Ultra-safe liquid staking',
    risk: 'low' as const
  }
]

export default function DashboardPage() {
  const { user, logIn } = useFlow()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [totalBalance, setTotalBalance] = useState(0)
  const [totalYield, setTotalYield] = useState(0)

  useEffect(() => {
    const total = mockVaults.reduce((sum, vault) => sum + vault.balance, 0)
    const avgAPY = mockVaults.reduce((sum, vault) => sum + vault.apy, 0) / mockVaults.length
    setTotalBalance(total)
    setTotalYield(avgAPY)
  }, [])

  if (!user.loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-gray-300 mb-8">
              Connect your Flow wallet to access your Sentinel dashboard
            </p>
            <button
              onClick={logIn}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Connect Flow Wallet
            </button>
          </div>
        </div>
      </div>
    )
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
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Dashboard
                </h1>
                <p className="text-gray-300">
                  Welcome back! Your autonomous vaults are working for you.
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Vault
                </button>
                
                <button className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="glass p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-green-400" />
                <span className="text-green-400 text-sm font-medium">
                  {formatPercentage(12.3)}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(totalBalance)}
              </div>
              <div className="text-gray-400 text-sm">Total Portfolio Value</div>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">
                  {formatPercentage(totalYield)}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {totalYield.toFixed(1)}%
              </div>
              <div className="text-gray-400 text-sm">Average APY</div>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
                <span className="text-purple-400 text-sm font-medium">
                  Active
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {mockVaults.filter(v => v.status === 'active').length}
              </div>
              <div className="text-gray-400 text-sm">Active Vaults</div>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-8 h-8 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">
                  24h
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                12
              </div>
              <div className="text-gray-400 text-sm">Auto Executions</div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Vaults Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">
                  Your Vaults
                </h2>
                
                <div className="space-y-4">
                  {mockVaults.map((vault, index) => (
                    <motion.div
                      key={vault.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <VaultCard vault={vault} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Portfolio Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass p-6 rounded-xl"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Portfolio Performance
                </h3>
                <PortfolioChart />
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Activity Feed */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ActivityFeed />
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="glass p-6 rounded-xl"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <button className="w-full flex items-center px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors">
                    <Plus className="w-4 h-4 mr-3" />
                    Create New Vault
                  </button>
                  
                  <button className="w-full flex items-center px-4 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors">
                    <DollarSign className="w-4 h-4 mr-3" />
                    Deposit Funds
                  </button>
                  
                  <button className="w-full flex items-center px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors">
                    <Activity className="w-4 h-4 mr-3" />
                    View Analytics
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Vault Modal */}
      {showCreateModal && (
        <CreateVaultModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}