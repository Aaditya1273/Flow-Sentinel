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
  pnl?: number
  pnlPercent?: number
}

export function useVaultData() {
  const { user, walletType } = useFlow()
  const [vaults, setVaults] = useState<VaultData[]>([])
  const [performance, setPerformance] = useState<{ totalBalance: number; totalPnl: number; totalPnlPercent: number } | null>(null)
  const [flowBalance, setFlowBalance] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      const vaultList = await FlowService.getVaultList(user.addr)

      if (vaultList && Array.isArray(vaultList)) {
        const transformedVaults: VaultData[] = vaultList.map((v: any) => ({
          id: v.id,
          name: v.name || 'Unnamed Vault',
          balance: parseFloat(v.balance || '0'),
          strategy: v.strategy || 'Unknown Strategy',
          isActive: v.isActive,
          lastExecution: parseInt(v.lastExecution || '0'),
          totalDeposits: parseFloat(v.balance || '0') - parseFloat(v.totalYieldAccrued || '0'),
          pnl: parseFloat(v.totalYieldAccrued || '0'),
          pnlPercent: parseFloat(v.balance || '0') > 0
            ? (parseFloat(v.totalYieldAccrued || '0') / (parseFloat(v.balance || '0') - parseFloat(v.totalYieldAccrued || '0'))) * 100
            : 0
        }))
        setVaults(transformedVaults)

        // Calculate performance from real data
        const totalBalance = transformedVaults.reduce((sum, v) => sum + v.balance, 0)
        const totalPnl = transformedVaults.reduce((sum, v) => sum + (v.pnl || 0), 0)
        const totalInitial = totalBalance - totalPnl
        setPerformance({
          totalBalance,
          totalPnl,
          totalPnlPercent: totalInitial > 0 ? (totalPnl / totalInitial) * 100 : 0
        })
      }

      if (walletType === 'evm') {
        if (evmBalance) {
          const balanceInFlow = parseFloat(evmBalance.value.toString()) / Math.pow(10, evmBalance.decimals)
          setFlowBalance(balanceInFlow)
        }
      } else {
        const balance = await FlowService.getUserFlowBalance(user.addr)
        setFlowBalance(parseFloat(balance?.toString() || '0'))
      }

    } catch (err) {
      console.error('Error fetching vault data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch vault data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user.loggedIn && user.addr) {
      fetchVaultData()
    } else {
      setVaults([])
      setPerformance(null)
      setFlowBalance(0)
    }
  }, [user.loggedIn, user.addr, walletType, evmBalance])

  return {
    vaults,
    performance,
    flowBalance,
    loading,
    error,
    refetch: fetchVaultData
  }
}