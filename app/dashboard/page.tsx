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
import { Navbar } from 'components/layout/Navbar'
import { VaultCard } from 'components/dashboard/VaultCard'
import { PortfolioChart } from 'components/dashboard/PortfolioChart'
import { ActivityFeed } from 'components/dashboard/ActivityFeed'
import { CreateVaultModal } from 'components/dashboard/CreateVaultModal'
import { useFlow } from 'lib/flow'
import { useVaultData } from 'hooks/useVaultData'
import { formatCurrency, formatPercentage } from 'lib/utils'

export default function DashboardPage() {
  const { user, logIn, isConnected } = useFlow()
  const { vaultData, performance, flowBalance, loading, error } = useVaultData()
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Redirect to home if wallet is disconnected
  useEffect(() => {
    if (!isConnected && !loading) {
      window.location.href = '/'
    }
  }, [isConnected, loading])

  if (!isConnected) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading your vault data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show create vault interface if no vault exists
  if (!vaultData && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">
              Create Your First Vault
            </h1>
            <p className="text-gray-300 mb-8">
              Start your DeFi journey by creating an autonomous vault. Choose from our proven strategies to maximize your yields.
            </p>
            <div className="glass p-6 rounded-xl mb-6">
              <div className="text-lg font-semibold text-white mb-2">
                Your Flow Balance
              </div>
              <div className="text-3xl font-bold text-green-400">
                {formatCurrency(flowBalance)} FLOW
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Create Your First Vault
            </button>
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
        
        {showCreateModal && (
          <CreateVaultModal onClose={() => setShowCreateModal(false)} />
        )}
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
                  Welcome back! Your autonomous vault is working for you.
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
                  {performance?.pnlPercent ? formatPercentage(performance.pnlPercent) : '+0%'}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(vaultData?.balance || 0)}
              </div>
              <div className="text-gray-400 text-sm">Vault Balance</div>
              <div className="text-sm text-green-400 mt-1">
                {performance?.pnl ? `+${formatCurrency(performance.pnl)} P&L` : 'No P&L data'}
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">
                  Flow
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(flowBalance)}
              </div>
              <div className="text-gray-400 text-sm">Available Balance</div>
              <div className="text-sm text-blue-400 mt-1">
                Ready to invest
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
                <span className={`text-sm font-medium ${
                  vaultData?.isActive ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {vaultData?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {vaultData?.name || 'My Vault'}
              </div>
              <div className="text-gray-400 text-sm">Vault Status</div>
              <div className="text-sm text-purple-400 mt-1">
                {vaultData?.strategy || 'Strategy'}
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-8 h-8 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">
                  Total
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(vaultData?.totalDeposits || 0)}
              </div>
              <div className="text-gray-400 text-sm">Total Deposited</div>
              <div className="text-sm text-yellow-400 mt-1">
                Since {vaultData?.createdAt ? new Date(vaultData.createdAt).toLocaleDateString() : 'creation'}
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Vault Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">
                  Your Vault
                </h2>
                
                {vaultData && (
                  <VaultCard 
                    vault={{
                      id: vaultData.id,
                      name: vaultData.name,
                      balance: vaultData.balance,
                      apy: 8.5, // This would come from strategy calculation
                      status: vaultData.isActive ? 'active' : 'paused',
                      lastExecution: new Date(vaultData.lastExecution * 1000),
                      strategy: vaultData.strategy,
                      risk: 'low' as const // This would be determined by strategy
                    }} 
                  />
                )}
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

              {/* Vault Info */}
              {vaultData && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass p-6 rounded-xl"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Vault Details
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vault ID</span>
                      <span className="text-white">{vaultData.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Strategy</span>
                      <span className="text-white">{vaultData.strategy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className={vaultData.isActive ? 'text-green-400' : 'text-yellow-400'}>
                        {vaultData.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Deposits</span>
                      <span className="text-white">{formatCurrency(vaultData.totalDeposits)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Withdrawals</span>
                      <span className="text-white">{formatCurrency(vaultData.totalWithdrawals)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created</span>
                      <span className="text-white">
                        {new Date(vaultData.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Vault Modal */}
      {showCreateModal && (
        <CreateVaultModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}