'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Clock, 
  Play, 
  Pause, 
  Settings,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
import { formatCurrency } from 'lib/utils'
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
  pnl?: number
  pnlPercent?: number
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
      case 'low': return 'text-success bg-success/10 border-success/20'
      case 'medium': return 'text-warning bg-warning/10 border-warning/20'
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/20'
      default: return 'text-muted-foreground bg-muted border-border'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success bg-success/10 border-success/20'
      case 'paused': return 'text-warning bg-warning/10 border-warning/20'
      case 'error': return 'text-destructive bg-destructive/10 border-destructive/20'
      default: return 'text-muted-foreground bg-muted border-border'
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
        className="tool-card p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Vault" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{vault.name}</h3>
              <p className="text-sm text-muted-foreground">{vault.strategy}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={`${getRiskColor(vault.risk)} text-xs font-medium px-3 py-1`}>
              {vault.risk.toUpperCase()}
            </Badge>
            <Badge className={`${getStatusColor(vault.status)} text-xs font-medium px-3 py-1`}>
              {vault.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold financial-number mb-1">
              {formatCurrency(vault.balance)}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Vault Balance</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold status-active financial-number mb-1">
              {vault.apy.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground font-medium">Annual Yield</div>
          </div>
          
          <div className="text-center">
            <div className="text-xs flex items-center justify-center mb-1">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimeAgo(vault.lastExecution)}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Last Execution</div>
          </div>
        </div>

        {/* Enhanced Expanded Content */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border pt-6 mt-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center p-3 bg-accent rounded-lg">
                <div className="text-xs text-muted-foreground mb-1 font-medium">Performance (24h)</div>
                <div className={`flex items-center justify-center ${vault.pnl && vault.pnl >= 0 ? 'status-active' : 'status-error'}`}>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="financial-number text-base font-semibold">
                    {vault.pnlPercent ? `${vault.pnlPercent >= 0 ? '+' : ''}${vault.pnlPercent.toFixed(2)}%` : '+0.00%'}
                  </span>
                </div>
              </div>
              
              <div className="text-center p-3 bg-accent rounded-lg">
                <div className="text-xs text-muted-foreground mb-1 font-medium">Last Execution</div>
                <div className="text-base font-semibold">
                  {vault.lastExecution ? formatTimeAgo(vault.lastExecution) : 'Never'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button 
                size="sm" 
                variant={vault.status === 'active' ? 'outline' : 'default'}
                className="flex-1 text-xs"
                disabled={loading}
              >
                {vault.status === 'active' ? (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Resume
                  </>
                )}
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDepositModal(true)
                }}
                disabled={loading}
              >
                <ArrowDownLeft className="w-3 h-3 mr-1" />
                Deposit
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowWithdrawModal(true)
                }}
                disabled={loading || vault.balance === 0}
              >
                <ArrowUpRight className="w-3 h-3 mr-1" />
                Withdraw
              </Button>
              
              <Button size="sm" variant="ghost" className="text-xs">
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Enhanced Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="tool-card p-6 max-w-sm w-full"
          >
            <div className="flex items-center mb-6">
              <img 
                src="/logo.png" 
                alt="Flow Sentinel" 
                className="w-6 h-6 mr-2"
              />
              <h3 className="text-xl font-semibold">Deposit to {vault.name}</h3>
            </div>
            
            <div className="mb-6 p-4 bg-accent rounded-lg">
              <div className="text-xs text-muted-foreground mb-1 font-medium">Available Balance</div>
              <div className="text-2xl font-bold status-active financial-number">
                {formatCurrency(flowBalance)} FLOW
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Deposit Amount (FLOW)
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                max={flowBalance}
                className="w-full px-3 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring financial-number text-base"
              />
              <div className="flex justify-between mt-3">
                {[0.25, 0.5, 0.75, 1].map((percentage) => (
                  <button
                    key={percentage}
                    onClick={() => setDepositAmount((flowBalance * percentage).toString())}
                    className="px-2 py-1 text-xs bg-accent hover:bg-accent/80 rounded-md transition-colors font-medium"
                  >
                    {percentage === 1 ? 'Max' : `${percentage * 100}%`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDepositModal(false)}
                className="flex-1 py-2 text-sm"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeposit}
                className="flex-1 py-2 text-sm btn-primary"
                disabled={loading || !depositAmount || Number(depositAmount) <= 0 || Number(depositAmount) > flowBalance}
              >
                {loading ? 'Processing...' : 'Deposit Funds'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Enhanced Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="tool-card p-6 max-w-sm w-full"
          >
            <div className="flex items-center mb-6">
              <img 
                src="/logo.png" 
                alt="Flow Sentinel" 
                className="w-6 h-6 mr-2"
              />
              <h3 className="text-xl font-semibold">Withdraw from {vault.name}</h3>
            </div>
            
            <div className="mb-6 p-4 bg-accent rounded-lg">
              <div className="text-xs text-muted-foreground mb-1 font-medium">Vault Balance</div>
              <div className="text-2xl font-bold financial-number">
                {formatCurrency(vault.balance)} FLOW
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Withdraw Amount (FLOW)
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                max={vault.balance}
                className="w-full px-3 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring financial-number text-base"
              />
              <div className="flex justify-between mt-3">
                {[0.25, 0.5, 0.75, 1].map((percentage) => (
                  <button
                    key={percentage}
                    onClick={() => setWithdrawAmount((vault.balance * percentage).toString())}
                    className="px-2 py-1 text-xs bg-accent hover:bg-accent/80 rounded-md transition-colors font-medium"
                  >
                    {percentage === 1 ? 'Max' : `${percentage * 100}%`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-2 text-sm"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                className="flex-1 py-2 text-sm btn-primary"
                disabled={loading || !withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > vault.balance}
              >
                {loading ? 'Processing...' : 'Withdraw Funds'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}