'use client'

import { motion } from 'framer-motion'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Shield, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react'
import { Badge } from 'components/ui/badge'
import { useActivityFeed } from 'hooks/useActivityFeed'
import { formatCurrency } from 'lib/utils'

export function ActivityFeed() {
  const { activities, loading } = useActivityFeed()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-400" />
      case 'execution':
        return <Zap className="w-4 h-4 text-blue-400" />
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'vault_created':
        return <Plus className="w-4 h-4 text-purple-400" />
      default:
        return <Shield className="w-4 h-4 text-gray-400" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-400/20 border-green-400/30'
      case 'withdrawal':
        return 'bg-red-400/20 border-red-400/30'
      case 'execution':
        return 'bg-blue-400/20 border-blue-400/30'
      case 'alert':
        return 'bg-yellow-400/20 border-yellow-400/30'
      case 'success':
        return 'bg-green-400/20 border-green-400/30'
      case 'vault_created':
        return 'bg-purple-400/20 border-purple-400/30'
      default:
        return 'bg-gray-400/20 border-gray-400/30'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ago`
    }
    return `${minutes}m ago`
  }

  if (loading) {
    return (
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <Badge variant="outline" className="text-xs">
            Loading...
          </Badge>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="glass p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <Badge variant="outline" className="text-xs">
          {activities.length > 0 ? 'Live' : 'No Activity'}
        </Badge>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No recent activity</p>
          <p className="text-sm text-gray-500">
            Create a vault and start investing to see your activity here
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-white truncate">
                    {activity.title}
                  </p>
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
                
                <p className="text-xs text-gray-300 mb-1">
                  {activity.description}
                </p>
                
                <div className="flex items-center justify-between">
                  {activity.vault && (
                    <Badge variant="outline" className="text-xs">
                      {activity.vault}
                    </Badge>
                  )}
                  
                  {activity.amount && (
                    <span className={`text-xs font-medium ${
                      activity.type === 'deposit' || activity.type === 'success' 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {activity.type === 'deposit' || activity.type === 'success' ? '+' : '-'}
                      {formatCurrency(activity.amount)} FLOW
                    </span>
                  )}
                </div>

                {activity.transactionId && (
                  <div className="mt-2">
                    <a
                      href={`https://testnet.flowscan.org/transaction/${activity.transactionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      View Transaction
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <button className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors">
          View All Activity →
        </button>
      </div>
    </div>
  )
}