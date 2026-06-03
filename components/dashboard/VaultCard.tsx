'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Clock,
  ChevronDown,
  Plus,
  Pause,
  Play,
  Settings,
  ArrowDownLeft,
  Zap,
  Shield,
  Lock,
  ExternalLink,
  ChevronUp,
  Activity,
  Sparkles
} from 'lucide-react'
import { Badge } from 'components/ui/badge'
import { Progress } from 'components/ui/progress'
import { formatCurrency, formatPercentage } from 'lib/utils'
import { FlowService } from 'lib/flow-service'
import { errorReporter } from '@/lib/sentry-wrapper'
import { VaultActionModal } from './VaultActionModal'
import { useVaultData } from 'hooks/useVaultData'
import { useTransactions } from 'lib/transactions'

interface Vault {
  id: string
  name: string
  balance: number
  apy: number
  status: 'active' | 'paused' | 'creating'
  lastExecution: Date
  strategy: string
  risk: 'low' | 'medium' | 'high'
  pnl?: number
  pnlPercent?: number
  totalYieldAccrued?: number
  // MEV Shield fields
  protectionLevel?: number
  slippageBps?: number
  commitRevealEnabled?: boolean
  blockDelayEnabled?: boolean
  mevProtectionsTriggered?: number
  mevShieldStatus?: string
}

interface VaultCardProps {
  vault: Vault
}

export function VaultCard({ vault }: VaultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: 'deposit' | 'withdraw' }>({
    isOpen: false,
    type: 'deposit'
  })
  const [biometricChallenge, setBiometricChallenge] = useState<'idle' | 'challenging' | 'success' | 'failed'>('idle')

  const { flowBalance, refetch } = useVaultData()
  const { setTxState } = useTransactions()

  useEffect(() => { setMounted(true) }, [])

  const isEpoch = vault.lastExecution.getTime() <= 0 || vault.lastExecution.getFullYear() <= 1970

  const handlePause = async () => {
    try {
      setLoading(true)
      if (vault.status === 'active') {
        setBiometricChallenge('challenging')
        await new Promise(resolve => setTimeout(resolve, 2000))
        setBiometricChallenge('success')
        await new Promise(resolve => setTimeout(resolve, 500))

        setTxState({ status: 'executing', txId: null, error: null, title: 'Pausing Vault' })
        const { transactionId, sealed } = await FlowService.pauseVault(vault.id)
        setTxState({ status: 'pending', txId: transactionId, error: null, title: 'Pausing Vault' })
        await sealed
        setTxState({ status: 'sealed', txId: transactionId, error: null, title: 'Vault Paused' })
      } else {
        setTxState({ status: 'executing', txId: null, error: null, title: 'Resuming Vault' })
        const { transactionId, sealed } = await FlowService.resumeVault(vault.id)
        setTxState({ status: 'pending', txId: transactionId, error: null, title: 'Resuming Vault' })
        await sealed
        setTxState({ status: 'sealed', txId: transactionId, error: null, title: 'Vault Resumed' })
      }
      refetch()
      setBiometricChallenge('idle')
    } catch (error: unknown) {
      errorReporter.captureException(error, { component: 'VaultCard', action: 'toggleStatus' })
      setBiometricChallenge('failed')
      const errMsg = error instanceof Error ? error.message : 'Transaction failed'
      setTxState({ status: 'error', txId: null, error: errMsg, title: 'Error' })
    } finally { setLoading(false) }
  }

  const handleClaimYield = async () => {
    try {
      setLoading(true)
      setTxState({ status: 'executing', txId: null, error: null, title: 'Claiming Yield' })
      const { transactionId, sealed } = await FlowService.claimYield(vault.id)
      setTxState({ status: 'pending', txId: transactionId, error: null, title: 'Claiming Yield' })
      await sealed
      setTxState({ status: 'sealed', txId: transactionId, error: null, title: 'Yield Claimed' })
      refetch()
    } catch (error: unknown) {
      errorReporter.captureException(error, { component: 'VaultCard', action: 'claimYield' })
      const errMsg = error instanceof Error ? error.message : 'Yield claim failed'
      setTxState({ status: 'error', txId: null, error: errMsg, title: 'Error' })
    } finally { setLoading(false) }
  }

  const handleManualStrategy = async () => {
    try {
      setLoading(true)
      setTxState({ status: 'executing', txId: null, error: null, title: 'Triggering Strategy' })
      const { transactionId, sealed } = await FlowService.triggerStrategy(vault.id)
      setTxState({ status: 'pending', txId: transactionId, error: null, title: 'Executing Strategy' })
      await sealed
      setTxState({ status: 'sealed', txId: transactionId, error: null, title: 'Strategy Executed' })
      refetch()
    } catch (error: unknown) {
      errorReporter.captureException(error, { component: 'VaultCard', action: 'triggerStrategy' })
      const errMsg = error instanceof Error ? error.message : 'Strategy execution failed'
      setTxState({ status: 'error', txId: null, error: errMsg, title: 'Error' })
    } finally { setLoading(false) }
  }

  return (
    <>
      <div className="dash-card">

        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="flex items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 style={{
                    fontSize: '1.5rem', fontWeight: 500, letterSpacing: '-0.02em',
                    color: '#FAF8F5', margin: 0,
                  }}>{vault.name}</h3>
                  <span className={`dash-badge ${vault.risk === 'low' ? 'dash-badge-green' : 'dash-badge-muted'}`}>
                    {vault.risk} RISK
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'rgba(250,248,245,0.55)', margin: 0 }}>
                  Strategic Protocol: <span style={{ color: '#FAF8F5' }}>{vault.strategy}</span>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="dash-badge dash-badge-green">
                <Zap style={{ width: 12, height: 12 }} /> FORTE AUTONOMY
              </span>
              <span className="dash-badge dash-badge-cyan" title={`Protection Level: ${vault.protectionLevel ?? 3}/3 | Slippage: ${(vault.slippageBps ?? 300) / 100}% | Protections Triggered: ${vault.mevProtectionsTriggered ?? 0}`}>
                <Shield style={{ width: 12, height: 12 }} /> 
                {vault.mevShieldStatus === 'FULL-MEV-SHIELD' ? 'MEV-SHIELD PRO' : 
                 vault.protectionLevel === 1 ? 'MEV-VRF' : 
                 vault.protectionLevel === 2 ? 'MEV-CR' : 'MEV-SHIELD'}
              </span>
              <span className="dash-badge dash-badge-muted">
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: vault.status === 'active' ? '#00EF8B' : '#f59e0b',
                  boxShadow: vault.status === 'active' ? '0 0 8px rgba(0,239,139,0.8)' : 'none',
                  animation: vault.status === 'active' ? 'pulse 2s infinite' : 'none',
                }} />
                {vault.status}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32, marginBottom: 32 }}>
            <div>
              <p className="dash-label">Available Balance</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <span className="dash-value" style={{ fontSize: '1.75rem' }}>
                  {formatCurrency(vault.balance)}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(250,248,245,0.3)', fontFamily: 'monospace' }}>FLOW</span>
              </div>
            </div>
            <div>
              <p className="dash-label">Projected APY</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 500, color: '#00EF8B', fontVariantNumeric: 'tabular-nums' }}>
                  {formatPercentage(vault.apy)}
                </span>
                <span style={{ color: 'rgba(0,239,139,0.5)', animation: 'pulse 2s infinite' }}>▲</span>
              </div>
            </div>
            <div>
              <p className="dash-label">Last Execution</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#37DDDF', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#FAF8F5' }}>
                  {mounted ? (isEpoch ? 'NEVER' : vault.lastExecution.toLocaleDateString()) : '---'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingTop: 24, borderTop: '1px solid rgba(250,248,245,0.08)' }}>
            <button className="dash-cta" onClick={() => setActionModal({ isOpen: true, type: 'deposit' })} disabled={loading}>
              <Plus style={{ width: 16, height: 16 }} /> Deposit
            </button>
            <button
              onClick={() => setActionModal({ isOpen: true, type: 'withdraw' })}
              disabled={loading}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '16px 32px', borderRadius: 26, border: '2px solid rgba(250,248,245,0.15)',
                background: 'transparent', color: '#FAF8F5',
                fontSize: '0.8125rem', fontWeight: 500, letterSpacing: '0.045em',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(250,248,245,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(250,248,245,0.15)')}
            >
              <ArrowDownLeft style={{ width: 16, height: 16 }} /> Withdraw
            </button>
            <button
              onClick={handlePause}
              disabled={loading}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '16px 32px', borderRadius: 26, border: '2px solid rgba(250,248,245,0.15)',
                background: 'transparent', color: '#FAF8F5',
                fontSize: '0.8125rem', fontWeight: 500, letterSpacing: '0.045em',
                cursor: 'pointer', transition: 'all 0.2s', flex: 1, minWidth: 140,
              }}
              onMouseEnter={e => {
                if (!loading) e.currentTarget.style.borderColor = 'rgba(250,248,245,0.4)'
              }}
              onMouseLeave={e => {
                if (!loading) e.currentTarget.style.borderColor = 'rgba(250,248,245,0.15)'
              }}
            >
              {biometricChallenge === 'challenging' ? (
                <>
                  <Shield style={{ width: 16, height: 16, color: '#00EF8B', animation: 'pulse 1s infinite' }} />
                  <span style={{ animation: 'pulse 1s infinite' }}>SENSING ID...</span>
                </>
              ) : loading ? (
                <span style={{ width: 16, height: 16, border: '2px solid rgba(0,239,139,0.3)', borderTopColor: '#00EF8B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : vault.status === 'active' ? (
                <><Lock style={{ width: 16, height: 16 }} /> Pause (Passkey)</>
              ) : (
                <><Play style={{ width: 16, height: 16 }} /> Resume</>
              )}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                width: 48, height: 48, borderRadius: 26,
                border: '1px solid rgba(250,248,245,0.10)',
                background: 'transparent', color: '#FAF8F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(250,248,245,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {isExpanded ? <ChevronUp style={{ width: 16, height: 16 }} /> : <ChevronDown style={{ width: 16, height: 16 }} />}
            </button>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ paddingTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
                  <div style={{
                    borderRadius: 24, padding: 24,
                    border: '1px solid rgba(250,248,245,0.06)',
                    background: 'rgba(250,248,245,0.02)',
                  }}>
                    <h4 className="dash-label" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Activity style={{ width: 12, height: 12 }} /> Real-time Performance
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)', fontWeight: 500 }}>Total Accrued P&L</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#00EF8B' }}>+{formatCurrency(vault.pnl || 0)}</span>
                    </div>
                    <div className="dash-progress" style={{ marginBottom: 8 }}>
                      <div className="dash-progress-bar" style={{ width: `${Math.min(100, (vault.pnlPercent || 0) * 10)}%` }} />
                    </div>
                    <div className="dash-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Forte Growth Score</span>
                      <span>{formatPercentage(vault.pnlPercent || 0)}</span>
                    </div>
                    <button
                      onClick={handleManualStrategy}
                      disabled={loading || vault.status !== 'active'}
                      style={{
                        width: '100%', marginTop: 24, padding: '12px 0', borderRadius: 16,
                        border: '1px solid rgba(250,248,245,0.08)',
                        background: 'transparent', color: '#FAF8F5',
                        fontSize: '0.625rem', fontWeight: 500, letterSpacing: '0.12em',
                        textTransform: 'uppercase', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { if (!loading && vault.status === 'active') e.currentTarget.style.background = 'rgba(250,248,245,0.04)' }}
                      onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'transparent' }}
                    >
                      <Zap style={{ width: 12, height: 12, color: '#00EF8B' }} />
                      Trigger Forte Task
                    </button>

                    {(vault.totalYieldAccrued || 0) > 0 && (
                      <button
                        onClick={handleClaimYield}
                        disabled={loading}
                        style={{
                          width: '100%', marginTop: 8, padding: '12px 0', fontSize: '0.625rem',
                          fontWeight: 500, letterSpacing: '0.045em',
                          borderRadius: 26,
                          background: 'rgba(0,239,139,0.1)', color: '#00EF8B',
                          border: '1px solid rgba(0,239,139,0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,239,139,0.18)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,239,139,0.1)' }}
                      >
                        Claim Yield ({formatCurrency(vault.totalYieldAccrued || 0)})
                      </button>
                    )}
                  </div>

                  <div style={{
                    borderRadius: 24, padding: 24,
                    border: '1px solid rgba(250,248,245,0.06)',
                    background: 'rgba(250,248,245,0.02)',
                  }}>
                    <h4 className="dash-label" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Shield style={{ width: 12, height: 12 }} /> MEV-Shield Pro — Security Report
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: (vault.protectionLevel ?? 3) >= 1 ? '#00EF8B' : '#666' }} />
                        <span style={{ fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)', fontWeight: 500 }}>Layer 1 — Commit-Reveal: </span>
                        <span className={`dash-badge ${vault.commitRevealEnabled !== false ? 'dash-badge-green' : 'dash-badge-muted'}`}>
                          {vault.commitRevealEnabled !== false ? 'ACTIVE' : 'OFF'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: (vault.protectionLevel ?? 3) >= 2 ? '#00EF8B' : '#666' }} />
                        <span style={{ fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)', fontWeight: 500 }}>Layer 2 — VRF Block-Delay Jitter: </span>
                        <span className={`dash-badge ${vault.blockDelayEnabled !== false ? 'dash-badge-green' : 'dash-badge-muted'}`}>
                          {vault.blockDelayEnabled !== false ? 'ACTIVE' : 'OFF'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: (vault.protectionLevel ?? 3) >= 3 ? '#00EF8B' : '#666' }} />
                        <span style={{ fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)', fontWeight: 500 }}>Layer 3 — Price Deviation Guard: </span>
                        <span className={`dash-badge ${(vault.protectionLevel ?? 3) >= 3 ? 'dash-badge-green' : 'dash-badge-muted'}`}>
                          {(vault.protectionLevel ?? 3) >= 3 ? 'ACTIVE' : 'OFF'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: (vault.protectionLevel ?? 3) >= 3 ? '#00EF8B' : '#666' }} />
                        <span style={{ fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)', fontWeight: 500 }}>Layer 4 — Execution Queue: </span>
                        <span className={`dash-badge ${(vault.protectionLevel ?? 3) >= 3 ? 'dash-badge-green' : 'dash-badge-muted'}`}>
                          {(vault.protectionLevel ?? 3) >= 3 ? 'ACTIVE' : 'OFF'}
                        </span>
                      </div>
                      <div style={{ borderTop: '1px solid rgba(250,248,245,0.06)', paddingTop: 12, marginTop: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)', fontWeight: 500 }}>Slippage Tolerance</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#FAF8F5' }}>{(vault.slippageBps ?? 300) / 100}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)', fontWeight: 500 }}>Protections Triggered</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#00EF8B' }}>{vault.mevProtectionsTriggered ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{
          padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid rgba(250,248,245,0.06)',
          background: 'rgba(250,248,245,0.01)',
        }}>
          <div className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings style={{ width: 12, height: 12 }} /> Protocol Configurations
          </div>
          <div className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.5 }}>
            <Shield style={{ width: 12, height: 12 }} /> E2E Encrypted
          </div>
        </div>
      </div>

      <VaultActionModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ ...actionModal, isOpen: false })}
        type={actionModal.type}
        vaultName={vault.name}
        vaultId={vault.id}
        balance={vault.balance}
        availableFlow={flowBalance}
      />
    </>
  )
}
