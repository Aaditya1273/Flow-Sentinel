'use client'

import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Shield, 
  AlertTriangle, 
  Play, 
  Pause,
  Settings,
  Eye
} from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils'

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
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  const getStatusIcon = () => {
    switch (vault.status) {
      case 'active':
        return <Play className="w-4 h-4 text-green-400" />
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-400" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
    }
  }

  const getStatusColor = () => {
    switch (vault.status) {
      case 'active': return 'text-green-400'
      case 'paused': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const timeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`
    }
    return `${minutes}m ago`
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-white">{vault.name}</h3>
            <div className={`px-2 py-1 rounded-full text-xs border ${getRiskColor(vault.risk)}`}>
              {vault.risk.toUpperCase()}
            </div>
          </div>
          <p className="text-gray-400 text-sm">{vault.strategy}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {vault.status.charAt(0).toUpperCase() + vault.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatCurrency(vault.balance)}
          </div>
          <div className="text-gray-400 text-sm">Balance</div>
        </div>
        
        <div>
          <div className="flex items-center space-x-1 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xl font-bold text-green-400">
              {vault.apy.toFixed(1)}%
            </span>
          </div>
          <div className="text-gray-400 text-sm">APY</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Last execution: {timeAgo(vault.lastExecution)}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-blue-400">
          <Shield className="w-4 h-4" />
          <span>MEV Protected</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Eye className="w-4 h-4 inline mr-2" />
          View Details
        </button>
        
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
          <Settings className="w-4 h-4" />
        </button>
        
        {vault.status === 'active' ? (
          <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors">
            <Pause className="w-4 h-4" />
          </button>
        ) : (
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
            <Play className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}