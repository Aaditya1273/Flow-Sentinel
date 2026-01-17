import { useState, useEffect } from 'react'
import { useFlow } from 'lib/flow'
import { useBalance } from 'wagmi'
import { FlowService } from 'lib/flow-service'

export interface VaultData {
  id: string
  name: string
  balance: number
  strategy: string
  isActive: boolean
  lastExecution: number
  totalDeposits: number
  totalWithdrawals: number
  createdAt: number
  pnl?: number
  pnlPercent?: number
}

export interface VaultPerformance {
  currentBalance: number
  totalDeposits: number
  pnl: number
  pnlPercent: number
}

export function useVaultData() {
  const { user, walletType } = useFlow()
  const [vaultData, setVaultData] = useState<VaultData | null>(null)
  const [performance, setPerformance] = useState<VaultPerformance | null>(null)
  const [flowBalance, setFlowBalance] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get EVM balance using wagmi
  const { data: evmBalance } = useBalance({
    address: user.addr as `0x${string}`,
    query: {
      enabled: walletType === 'evm' && !!user.addr,
    },
  })

  const fetchVaultData = async () => {
    if (!user.addr) return

    setLoading(true)
    setError(null)

    try {
      // Fetch vault info
      const vaultInfo = await FlowService.getVaultInfo(user.addr)
      
      if (vaultInfo) {
        const vault: VaultData = {
          id: '1', // Use a default ID since it's not available from the public interface
          name: 'My Vault', // Default name since it's not stored in the contract
          balance: parseFloat(vaultInfo.balance || '0'),
          strategy: 'Conservative Growth', // Default strategy since it's not stored in the contract
          isActive: vaultInfo.isActive || false,
          lastExecution: parseInt(vaultInfo.lastExecution || '0'),
          totalDeposits: parseFloat(vaultInfo.balance || '0'), // Use balance as total deposits for now
          totalWithdrawals: 0, // Not tracked in current contract
          createdAt: Date.now() // Use current time as default
        }
        setVaultData(vault)

        // Fetch performance data
        const performanceData = await FlowService.getVaultPerformance(user.addr)
        if (performanceData) {
          const perf: VaultPerformance = {
            currentBalance: parseFloat(performanceData.currentBalance || '0'),
            totalDeposits: parseFloat(performanceData.totalDeposits || '0'),
            pnl: parseFloat(performanceData.pnl || '0'),
            pnlPercent: parseFloat(performanceData.pnlPercent || '0')
          }
          setPerformance(perf)
          
          // Update vault data with performance
          vault.pnl = perf.pnl
          vault.pnlPercent = perf.pnlPercent
          setVaultData(vault)
        }
      }

      // Fetch Flow balance
      if (walletType === 'evm') {
        // For EVM wallets, use the real balance from wagmi
        if (evmBalance) {
          const balanceInFlow = parseFloat(evmBalance.value.toString()) / Math.pow(10, evmBalance.decimals)
          console.log('EVM balance fetched:', balanceInFlow)
          setFlowBalance(balanceInFlow)
        } else {
          setFlowBalance(0)
        }
      } else {
        console.log('Fetching Flow balance for Flow wallet:', user.addr)
        const balance = await FlowService.getUserFlowBalance(user.addr, walletType)
        const parsedBalance = parseFloat(balance?.toString() || '0')
        console.log('Flow balance result:', balance, 'parsed:', parsedBalance)
        setFlowBalance(parsedBalance)
      }

    } catch (err) {
      console.error('Error fetching vault data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch vault data')
    } finally {
      setLoading(false)
    }
  }

  const createVault = async (name: string, strategy: string, minDeposit: number) => {
    setLoading(true)
    setError(null)

    try {
      const transaction = await FlowService.createVault(name, strategy, minDeposit)
      
      // Refresh data after creation
      await fetchVaultData()
      
      return transaction
    } catch (err) {
      console.error('Error creating vault:', err)
      setError(err instanceof Error ? err.message : 'Failed to create vault')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deposit = async (amount: number) => {
    setLoading(true)
    setError(null)

    try {
      const transaction = await FlowService.deposit(amount)
      
      // Refresh data after deposit
      await fetchVaultData()
      
      return transaction
    } catch (err) {
      console.error('Error depositing:', err)
      setError(err instanceof Error ? err.message : 'Failed to deposit')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const withdraw = async (amount: number) => {
    setLoading(true)
    setError(null)

    try {
      const transaction = await FlowService.withdraw(amount)
      
      // Refresh data after withdrawal
      await fetchVaultData()
      
      return transaction
    } catch (err) {
      console.error('Error withdrawing:', err)
      setError(err instanceof Error ? err.message : 'Failed to withdraw')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when user connects or EVM balance changes
  useEffect(() => {
    if (user.loggedIn && user.addr) {
      fetchVaultData()
    } else {
      setVaultData(null)
      setPerformance(null)
      setFlowBalance(0)
    }
  }, [user.loggedIn, user.addr, walletType, evmBalance])

  return {
    vaultData,
    performance,
    flowBalance,
    loading,
    error,
    refetch: fetchVaultData,
    createVault,
    deposit,
    withdraw
  }
}