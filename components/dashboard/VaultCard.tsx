'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Play, 
  Pause, 
  Settings,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
import { formatCurrency, formatPercentage } from 'lib/utils'
import { useVaultData } from 'hooks/useVaultData'

interface Vault {
  id: string
  name: string
  balance: number
  apy: number
  status: 'active' | 'paused' | 'error'
  lastExecution: Date
  strategy: string
  risk: 'low' | 'medium' | 'high'
}

interface VaultCardProps {
  vault: Vault
}

export function VaultCard({ vault }: VaultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const { deposit, withdraw, loading, flowBalance } = useVaultData()

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'high': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'paused': return 'text-yellow-400 bg-yellow-400/20'
      case 'error': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`
    }
    return `${minutes}m ago`
  }

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount))) return
    
    try {
      await deposit(Number(depositAmount))
      setDepositAmount('')
      setShowDepositModal(false)
    } catch (error) {
      console.error('Deposit failed:', error)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount))) return
    
    try {
      await withdraw(Number(withdrawAmount))
      setWithdrawAmount('')
      setShowWithdrawModal(false)
    } catch (error) {
      console.error('Withdraw failed:', error)
    }
  }

  return (
    <>
      <motion.div
        layout
        className="glass p-6 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Shield className="w-8 h-8 text-blue-400" />
              <div className="absolute inset-0 bg-blue-400/20 blur-lg rounded-full" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{vault.name}</h3>
              <p className="text-sm text-gray-400">{vault.strategy}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={getRiskColor(vault.risk)}>
              {vault.risk.toUpperCase()}
            </Badge>
            <Badge className={getStatusColor(vault.status)}>
              {vault.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(vault.balance)}
            </div>
            <div className="text-sm text-gray-400">Balance</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-green-400">
              {vault.apy.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">APY</div>
          </div>
          
          <div>
            <div className="text-sm text-white flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatTimeAgo(vault.lastExecution)}
            </div>
            <div className="text-sm text-gray-400">Last Execution</div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-700 pt-4 mt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Performance (24h)</div>
                <div className="flex items-center text-green-400">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +2.3%
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Next Execution</div>
                <div className="text-sm text-white">In 2h 15m</div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant={vault.status === 'active' ? 'outline' : 'default'}
                className="flex-1"
                disabled={loading}
              >
                {vault.status === 'active' ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </>
                )}
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDepositModal(true)
                }}
                disabled={loading}
              >
                <ArrowDownLeft className="w-4 h-4 mr-2" />
                Deposit
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowWithdrawModal(true)
                }}
                disabled={loading || vault.balance === 0}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
              
              <Button size="sm" variant="ghost">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass p-6 rounded-xl max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Deposit to {vault.name}</h3>
            
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Available Balance</div>
              <div className="text-lg font-semibold text-green-400">
                {formatCurrency(flowBalance)} FLOW
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Deposit Amount (FLOW)
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                max={flowBalance}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => setDepositAmount((flowBalance * 0.25).toString())}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  25%
                </button>
                <button
                  onClick={() => setDepositAmount((flowBalance * 0.5).toString())}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  50%
                </button>
                <button
                  onClick={() => setDepositAmount((flowBalance * 0.75).toString())}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  75%
                </button>
                <button
                  onClick={() => setDepositAmount(flowBalance.toString())}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Max
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDepositModal(false)}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeposit}
                className="flex-1"
                disabled={loading || !depositAmount || Number(depositAmount) <= 0 || Number(depositAmount) > flowBalance}
              >
                {loading ? 'Depositing...' : 'Deposit'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass p-6 rounded-xl max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Withdraw from {vault.name}</h3>
            
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Vault Balance</div>
              <div className="text-lg font-semibold text-blue-400">
                {formatCurrency(vault.balance)} FLOW
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Withdraw Amount (FLOW)
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                max={vault.balance}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => setWithdrawAmount((vault.balance * 0.25).toString())}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  25%
                </button>
                <button
                  onClick={() => setWithdrawAmount((vault.balance * 0.5).toString())}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  50%
                </button>
                <button
                  onClick={() => setWithdrawAmount((vault.balance * 0.75).toString())}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  75%
                </button>
                <button
                  onClick={() => setWithdrawAmount(vault.balance.toString())}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Max
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                className="flex-1"
                disabled={loading || !withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > vault.balance}
              >
                {loading ? 'Withdrawing...' : 'Withdraw'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}