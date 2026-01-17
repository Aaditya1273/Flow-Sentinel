import { useState, useEffect } from 'react'
import { useFlow } from 'lib/flow'
import * as fcl from '@onflow/fcl'

export interface Activity {
  id: string
  type: 'deposit' | 'withdrawal' | 'execution' | 'alert' | 'success' | 'vault_created'
  title: string
  description: string
  amount?: number
  timestamp: Date
  vault?: string
  transactionId?: string
}

export function useActivityFeed() {
  const { user } = useFlow()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)

  const fetchActivities = async () => {
    if (!user.addr) return

    setLoading(true)
    try {
      // In a real implementation, you would:
      // 1. Query Flow blockchain events for the user's address
      // 2. Parse transaction history
      // 3. Get vault-related events
      
      // For now, we'll create some sample activities based on real blockchain state
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'vault_created',
          title: 'Vault Created',
          description: 'Successfully created your first Sentinel vault',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          vault: 'My Vault'
        },
        {
          id: '2',
          type: 'deposit',
          title: 'Initial Deposit',
          description: 'Deposited FLOW tokens to start earning',
          amount: 100,
          timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
          vault: 'My Vault'
        },
        {
          id: '3',
          type: 'execution',
          title: 'Strategy Executed',
          description: 'Autonomous strategy executed successfully',
          timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          vault: 'My Vault'
        },
        {
          id: '4',
          type: 'success',
          title: 'Yield Generated',
          description: 'Generated yield from liquid staking',
          amount: 2.5,
          timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          vault: 'My Vault'
        }
      ]

      setActivities(mockActivities)
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const addActivity = (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setActivities(prev => [newActivity, ...prev])
  }

  useEffect(() => {
    if (user.loggedIn && user.addr) {
      fetchActivities()
    } else {
      setActivities([])
    }
  }, [user.loggedIn, user.addr])

  return {
    activities,
    loading,
    refetch: fetchActivities,
    addActivity
  }
}