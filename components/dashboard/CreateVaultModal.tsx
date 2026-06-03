'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Shield,
  AlertTriangle,
  Zap,
  ChevronRight,
  ChevronLeft,
  Lock,
  Sparkles
} from 'lucide-react'
import { useVaultData } from 'hooks/useVaultData'
import { FlowService } from 'lib/flow-service'
import { errorReporter } from '@/lib/sentry-wrapper'
import { useTransactions } from 'lib/transactions'
import { formatCurrency } from 'lib/utils'

interface CreateVaultModalProps {
  onClose: () => void
  onSuccess?: () => void
  preselectedStrategy?: string
}

interface Strategy {
  id: string
  name: string
  description: string
  riskLevel: number
  category: string
  expectedAPY: number
  minDeposit: number
  features: string[]
  creator: string
  verified: boolean
}

export function CreateVaultModal({ onClose, onSuccess, preselectedStrategy }: CreateVaultModalProps) {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(preselectedStrategy || null)
  const [depositAmount, setDepositAmount] = useState('')
  const [vaultName, setVaultName] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { flowBalance, loading: vaultLoading } = useVaultData()
  const selectedStrategyData = strategies.find(s => s.id === selectedStrategy)

  useEffect(() => {
    const loadStrategies = async () => {
      try {
        setLoading(true)
        setError(null)
        const blockchainStrategies = (await FlowService.getAllStrategies()) as Array<Record<string, unknown>>
        if (blockchainStrategies.length > 0) {
          const transformedStrategies: Strategy[] = blockchainStrategies.map((strategy: Record<string, unknown>) => ({
            id: String(strategy.id ?? ''),
            name: String(strategy.name ?? ''),
            description: String(strategy.description ?? ''),
            riskLevel: parseInt(String(strategy.riskLevel ?? '1')),
            category: String(strategy.category ?? ''),
            expectedAPY: parseFloat(String(strategy.expectedAPY ?? '0')),
            minDeposit: parseFloat(String(strategy.minDeposit ?? '0')),
            features: (Array.isArray(strategy.features) ? strategy.features : []) as string[],
            creator: String(strategy.creator ?? 'Unknown'),
            verified: strategy.verified === true
          }))
          setStrategies(transformedStrategies)
        } else {
          setError('No strategies available. Please ensure contracts are deployed.')
        }
      } catch (err) {
        errorReporter.captureException(err, { component: 'CreateVaultModal', action: 'loadStrategies' })
        setError('Failed to load strategies from blockchain.')
      } finally { setLoading(false) }
    }
    loadStrategies()
  }, [])

  useEffect(() => {
    if (preselectedStrategy && strategies.length > 0) {
      setStep(2)
      const strategy = strategies.find(s => s.id === preselectedStrategy)
      if (strategy && !vaultName) {
        setVaultName(`${strategy.name.split(' ')[0]}-Vault-01`)
      }
    }
  }, [preselectedStrategy, strategies])

  const { setTxState } = useTransactions()

  const handleCreateVault = async () => {
    if (!selectedStrategyData || !vaultName || !depositAmount) return
    try {
      setStep(4)
      setTxState({ status: 'executing', txId: null, error: null, title: 'Launching Sentinel' })
      const { transactionId, sealed } = await FlowService.createVaultWithStrategy(
        selectedStrategyData.id, vaultName, Number(depositAmount)
      )
      setTxState({ status: 'pending', txId: transactionId, error: null, title: 'Deploying Protocol' })
      onClose()
      await sealed
      setTxState({ status: 'sealed', txId: transactionId, error: null, title: 'Sentinel Deployed' })
      if (onSuccess) onSuccess()
    } catch (err: unknown) {
      errorReporter.captureException(err, { component: 'CreateVaultModal', action: 'createVault' })
      const errorMessage = err instanceof Error ? err.message : 'Failed to create vault on blockchain.'
      setError(errorMessage)
      setStep(3)
      setTxState({ status: 'error', txId: null, error: errorMessage, title: 'Deployment Failed' })
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        style={{
          position: 'relative', width: '100%', maxWidth: 1000, height: '85vh',
          borderRadius: 40, border: '1px solid rgba(250,248,245,0.10)',
          background: '#111',
          backdropFilter: 'blur(30px)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 0 100px rgba(0,0,0,0.5)',
        }}
      >
        {/* Decorative glows */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '40%', background: 'rgba(0,239,139,0.04)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30%', height: '30%', background: 'rgba(55,221,223,0.04)', filter: 'blur(100px)', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ padding: '40px 40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="dash-label" style={{ color: '#00EF8B', letterSpacing: '0.3em' }}>Step {step} of 4</span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
              fontSize: '1.75rem', fontWeight: 500, letterSpacing: '-0.02em',
              color: '#FAF8F5', margin: 0, textTransform: 'uppercase',
            }}>
              {step === 1 && 'Select Strategy'}
              {step === 2 && 'Configuration'}
              {step === 3 && 'Final Verification'}
              {step === 4 && 'Deploying Sentinel'}
            </h2>
          </div>
          <button onClick={onClose} style={{
            width: 48, height: 48, borderRadius: 20,
            border: '1px solid rgba(250,248,245,0.10)',
            background: 'transparent', color: 'rgba(250,248,245,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(250,248,245,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ padding: '0 40px', marginBottom: 32, position: 'relative', zIndex: 10 }}>
          <div className="dash-progress" style={{ height: 4 }}>
            <div className="dash-progress-bar" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 40px 40px', position: 'relative', zIndex: 10 }}>
          <AnimatePresence mode="wait">
            {/* Step 1: Select Strategy */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}
              >
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{
                      borderRadius: 32, border: '1px solid rgba(250,248,245,0.06)',
                      background: 'rgba(250,248,245,0.02)', height: 280,
                      animation: 'pulse 2s infinite',
                    }} />
                  ))
                ) : (
                  strategies.map((strategy) => (
                    <div
                      key={strategy.id}
                      onClick={() => setSelectedStrategy(strategy.id)}
                      style={{
                        borderRadius: 32, padding: 32,
                        border: `2px solid ${selectedStrategy === strategy.id ? 'rgba(0,239,139,0.3)' : 'rgba(250,248,245,0.08)'}`,
                        background: selectedStrategy === strategy.id
                          ? 'linear-gradient(135deg, rgba(0,239,139,0.06) 0%, rgba(17,17,17,0.9) 100%)'
                          : 'linear-gradient(135deg, rgba(17,17,17,0.9) 0%, rgba(10,10,10,0.95) 100%)',
                        cursor: 'pointer', transition: 'all 0.3s',
                      }}
                      onMouseEnter={e => {
                        if (selectedStrategy !== strategy.id)
                          e.currentTarget.style.borderColor = 'rgba(250,248,245,0.18)'
                      }}
                      onMouseLeave={e => {
                        if (selectedStrategy !== strategy.id)
                          e.currentTarget.style.borderColor = 'rgba(250,248,245,0.08)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                        <span className={`dash-badge ${strategy.riskLevel === 1 ? 'dash-badge-green' : strategy.riskLevel === 2 ? 'dash-badge-cyan' : 'dash-badge-muted'}`}>
                          {strategy.riskLevel === 1 ? 'Low' : strategy.riskLevel === 2 ? 'Medium' : 'High'} Risk
                        </span>
                      </div>

                      <h4 style={{
                        fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                        fontSize: '1.25rem', fontWeight: 500, letterSpacing: '-0.01em',
                        color: '#FAF8F5', margin: '0 0 8px', textTransform: 'uppercase',
                      }}>
                        {strategy.name}
                      </h4>
                      <p style={{ fontSize: '0.8125rem', color: 'rgba(250,248,245,0.4)', marginBottom: 24, lineHeight: 1.6 }}>
                        {strategy.description}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                        <div>
                          <span className="dash-label">Expected APY</span>
                          <div style={{ fontSize: '1.5rem', fontWeight: 500, color: '#00EF8B', fontVariantNumeric: 'tabular-nums' }}>{strategy.expectedAPY}%</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="dash-label">Min. Deposit</span>
                          <div style={{ fontSize: '1rem', fontWeight: 500, color: '#FAF8F5', fontVariantNumeric: 'tabular-nums' }}>{strategy.minDeposit} FLOW</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {strategy.features.slice(0, 3).map(f => (
                          <span key={f} className="dash-badge dash-badge-muted" style={{ fontSize: '0.5rem' }}>{f}</span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* Step 2: Configure */}
            {step === 2 && selectedStrategyData && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ maxWidth: 560, margin: '0 auto' }}
              >
                <div style={{ marginBottom: 40 }}>
                  <label className="dash-label" style={{ marginBottom: 12, display: 'block' }}>Vault Identifier</label>
                  <input
                    type="text"
                    value={vaultName}
                    onChange={(e) => setVaultName(e.target.value)}
                    placeholder="Sentinel-Alpha-01"
                    className="dash-input"
                    style={{ fontSize: '1.25rem', fontWeight: 500, letterSpacing: '-0.01em', textTransform: 'uppercase' }}
                  />
                </div>

                <div style={{ marginBottom: 40 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <label className="dash-label">Capital Deployment (FLOW)</label>
                    <span className="dash-label">Available: {formatCurrency(flowBalance)}</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder={selectedStrategyData.minDeposit.toString()}
                      className="dash-input"
                      style={{ fontSize: '2rem', fontWeight: 500, padding: '32px 40px', fontVariantNumeric: 'tabular-nums' }}
                    />
                    <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => setDepositAmount((flowBalance * 0.5).toFixed(1))}
                        className="dash-badge dash-badge-muted"
                        style={{ cursor: 'pointer', padding: '8px 16px' }}
                      >
                        50%
                      </button>
                      <button
                        onClick={() => setDepositAmount(flowBalance.toFixed(1))}
                        className="dash-badge dash-badge-green"
                        style={{ cursor: 'pointer', padding: '8px 16px' }}
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: '12px 16px 0', fontSize: '0.625rem', fontWeight: 500, color: 'rgba(250,248,245,0.35)' }}>
                    Minimum Required: {selectedStrategyData.minDeposit} FLOW
                  </p>
                </div>

                <div style={{
                  borderRadius: 24, padding: 32, display: 'flex', alignItems: 'center', gap: 24,
                  border: '1px solid rgba(250,248,245,0.06)',
                  background: 'rgba(250,248,245,0.02)',
                }}>
                  <Sparkles style={{ width: 32, height: 32, color: '#00EF8B' }} />
                  <div>
                    <h5 style={{
                      fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                      fontSize: '0.875rem', fontWeight: 500, color: '#FAF8F5',
                      margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '-0.01em',
                    }}>
                      Optimization Enabled
                    </h5>
                    <p style={{ fontSize: '0.8125rem', color: 'rgba(250,248,245,0.4)', margin: 0, lineHeight: 1.5 }}>
                      Your capital will be routed through the {selectedStrategyData.name} engine with real-time MEV protection active.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && selectedStrategyData && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ maxWidth: 720, margin: '0 auto' }}
              >
                <div className="dash-card" style={{ padding: 40 }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, padding: 40, opacity: 0.04 }}>
                    <Shield style={{ width: 128, height: 128 }} />
                  </div>

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00EF8B', animation: 'pulse 2s infinite' }} />
                      <span className="dash-label" style={{ color: '#00EF8B', letterSpacing: '0.4em' }}>Final Verification Required</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 48 }}>
                      <div>
                        <span className="dash-label">Target Name</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 500, color: '#FAF8F5', textTransform: 'uppercase', letterSpacing: '-0.02em', marginTop: 8 }}>{vaultName}</div>
                      </div>
                      <div>
                        <span className="dash-label">Strategy Engine</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 500, color: '#00EF8B', textTransform: 'uppercase', letterSpacing: '-0.02em', marginTop: 8 }}>{selectedStrategyData.name}</div>
                      </div>
                      <div>
                        <span className="dash-label">Capital Allocation</span>
                        <div className="dash-value" style={{ fontSize: '2rem', marginTop: 8 }}>{depositAmount} FLOW</div>
                      </div>
                      <div>
                        <span className="dash-label">Security Fee (Est.)</span>
                        <div style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(250,248,245,0.4)', marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>~0.001 FLOW</div>
                      </div>
                    </div>

                    <div style={{
                      padding: 24, borderRadius: 20,
                      background: 'rgba(239,68,68,0.04)',
                      border: '1px solid rgba(239,68,68,0.10)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <AlertTriangle style={{ width: 16, height: 16, color: '#ef4444' }} />
                        <span className="dash-label" style={{ color: '#ef4444' }}>Protocol Confirmation</span>
                      </div>
                      <p style={{ fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)', lineHeight: 1.6, margin: 0 }}>
                        Deployment to the blockchain is irreversible. Your capital will be managed autonomously by the Flow Sentinel protocol. By proceeding, you authorize the smart contract to execute transactions on your behalf.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Creating */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}
              >
                <div style={{ position: 'relative', width: 160, height: 160, marginBottom: 48 }}>
                  <div style={{ position: 'absolute', inset: 0, border: '6px solid rgba(0,239,139,0.08)', borderRadius: '50%' }} />
                  <motion.div
                    style={{ position: 'absolute', inset: 0, border: '6px solid transparent', borderTopColor: '#00EF8B', borderRadius: '50%' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                  <div style={{ position: 'absolute', inset: 12, border: '2px dashed rgba(55,221,223,0.3)', borderRadius: '50%', animation: 'spin 8s linear infinite' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap style={{ width: 64, height: 64, color: '#00EF8B', animation: 'pulse 1.5s infinite' }} />
                  </div>
                </div>

                <h3 style={{
                  fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                  fontSize: '1.75rem', fontWeight: 500, letterSpacing: '-0.02em',
                  color: '#FAF8F5', margin: '0 0 16px', textTransform: 'uppercase',
                }}>
                  Deploying Intelligence
                </h3>
                <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00EF8B', animation: 'bounce 1s infinite' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00EF8B', animation: 'bounce 1s infinite 0.15s' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00EF8B', animation: 'bounce 1s infinite 0.3s' }} />
                </div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(250,248,245,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Initializing Vault Registry...
                </p>
                <p style={{ fontSize: '0.625rem', fontWeight: 500, color: 'rgba(0,239,139,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 8, animation: 'pulse 2s infinite' }}>
                  Finalizing on Flow Testnet. Do not close the link.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        {step < 4 && (
          <div style={{
            padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderTop: '1px solid rgba(250,248,245,0.06)',
            background: 'rgba(0,0,0,0.3)', position: 'relative', zIndex: 10,
          }}>
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: '0.625rem', fontWeight: 500, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'rgba(250,248,245,0.4)',
                background: 'none', border: 'none', cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FAF8F5')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,248,245,0.4)')}
            >
              <ChevronLeft style={{ width: 16, height: 16 }} />
              {step === 1 ? 'Cancel' : 'Back'}
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !selectedStrategy : (!vaultName || !depositAmount || Number(depositAmount) < (selectedStrategyData?.minDeposit || 0))}
                className="dash-cta"
              >
                Continue <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            ) : (
              <button
                onClick={handleCreateVault}
                disabled={vaultLoading}
                className="dash-cta"
                style={{ boxShadow: '0 10px 40px rgba(0,239,139,0.25)' }}
              >
                <Lock style={{ width: 20, height: 20 }} />
                Finalize Deployment
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
