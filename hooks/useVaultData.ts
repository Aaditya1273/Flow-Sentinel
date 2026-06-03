import { useState, useEffect } from 'react'
import { useFlow } from 'lib/flow'
import { useBalance } from 'wagmi'
import { FlowService } from 'lib/flow-service'
import { errorReporter } from '@/lib/sentry-wrapper'

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
  // MEV Shield fields
  protectionLevel?: number
  slippageBps?: number
  commitRevealEnabled?: boolean
  blockDelayEnabled?: boolean
  mevProtectionsTriggered?: number
  mevShieldStatus?: string
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
        const transformedVaults: VaultData[] = vaultList.map((v: Record<string, unknown>) => ({
          id: String(v.id ?? ''),
          name: String(v.name ?? 'Unnamed Vault'),
          balance: parseFloat(String(v.balance ?? '0')),
          strategy: String(v.strategy ?? 'Unknown Strategy'),
          isActive: Boolean(v.isActive),
          lastExecution: parseInt(String(v.lastExecution ?? '0')),
          totalDeposits: parseFloat(String(v.balance ?? '0')) - parseFloat(String(v.totalYieldAccrued ?? '0')),
          pnl: parseFloat(String(v.totalYieldAccrued ?? '0')),
          pnlPercent: parseFloat(String(v.balance ?? '0')) > 0
            ? (parseFloat(String(v.totalYieldAccrued ?? '0')) / (parseFloat(String(v.balance ?? '0')) - parseFloat(String(v.totalYieldAccrued ?? '0')))) * 100
            : 0,
          // MEV Shield data
          protectionLevel: typeof v.protectionLevel !== 'undefined' ? parseInt(String(v.protectionLevel)) : undefined,
          slippageBps: typeof v.slippageBps !== 'undefined' ? parseFloat(String(v.slippageBps)) : undefined,
          commitRevealEnabled: Boolean(v.commitRevealEnabled),
          blockDelayEnabled: Boolean(v.blockDelayEnabled),
          mevProtectionsTriggered: typeof v.mevProtectionsTriggered !== 'undefined' ? parseInt(String(v.mevProtectionsTriggered)) : undefined,
          mevShieldStatus: String(v.mevShieldStatus ?? '')
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
      errorReporter.captureException(err, { component: 'useVaultData', action: 'fetchVaultData' })
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