'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ExternalLink,
  CheckCircle2,
  Loader2,
  XCircle,
  ChevronRight,
  X,
  RefreshCw,
  Wallet,
  Send,
  Clock,
} from 'lucide-react'

type TransactionStatus = 'idle' | 'executing' | 'submitting' | 'pending' | 'sealed' | 'error'

interface TransactionState {
  status: TransactionStatus
  txId: string | null
  error: string | null
  title: string
  onRetry?: () => Promise<void>
}

interface TransactionContextType {
  txState: TransactionState
  setTxState: (state: TransactionState) => void
  resetTx: () => void
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [txState, setTxState] = useState<TransactionState>({
    status: 'idle',
    txId: null,
    error: null,
    title: 'Transaction',
  })

  const resetTx = useCallback(() =>
    setTxState({ status: 'idle', txId: null, error: null, title: 'Transaction' }),
  [])

  // Auto-dismiss success toasts after 4 seconds
  useEffect(() => {
    if (txState.status === 'sealed') {
      const timer = setTimeout(() => {
        resetTx()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [txState.status, resetTx])

  return (
    <TransactionContext.Provider value={{ txState, setTxState, resetTx }}>
      {children}
      <TransactionModal />
      <TransactionToast />
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (!context) throw new Error('useTransactions must be used within TransactionProvider')
  return context
}

// ── Full-screen wallet signature modal (shown only during 'executing') ──
function TransactionModal() {
  const { txState, resetTx } = useTransactions()
  const showModal = txState.status === 'executing' || txState.status === 'submitting'

  if (!showModal) return null

  const stepLabel = {
    idle: '',
    executing: 'Awaiting Signature',
    submitting: 'Submitting',
    pending: 'Broadcasting',
    sealed: 'Complete',
    error: 'Failed',
  }[txState.status]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/70">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md"
        >
          <div className="w-card overflow-hidden">
            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-8">
                {txState.status === 'executing' ? (
                  <Wallet className="w-5 h-5 text-[var(--sen-green)] animate-pulse" />
                ) : (
                  <Loader2 className="w-5 h-5 text-[var(--sen-green)] animate-spin" />
                )}
                <span className="text-label-sm" style={{ color: 'rgba(250,248,245,0.5)' }}>
                  {stepLabel}
                </span>
              </div>

              <h2 className="text-display-md mb-3" style={{
                fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1,
              }}>
                {txState.status === 'executing'
                  ? 'Confirm in Wallet'
                  : 'Submitting to Network'}
              </h2>

              <p className="text-body-s mb-8" style={{ color: 'rgba(250,248,245,0.55)' }}>
                {txState.status === 'executing'
                  ? 'Please approve the request in your connected Flow wallet.'
                  : 'Your signed transaction is being broadcast to the Flow network.'}
              </p>

              {/* Progress steps */}
              <div className="mb-8" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Sign with Wallet', done: txState.status !== 'executing' },
                  { label: 'Submit to Network', done: txState.status === 'submitting' || txState.status === 'pending' },
                  { label: 'Await Confirmation', done: false },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: step.done ? 'rgba(0,239,139,0.2)' : 'rgba(250,248,245,0.06)',
                      border: `1px solid ${step.done ? 'rgba(0,239,139,0.4)' : 'rgba(250,248,245,0.1)'}`,
                    }}>
                      {step.done ? (
                        <CheckCircle2 className="w-3 h-3 text-[var(--sen-green)]" />
                      ) : (
                        <Loader2 className="w-3 h-3 text-[rgba(250,248,245,0.3)] animate-spin" />
                      )}
                    </div>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 500,
                      color: step.done ? 'rgba(250,248,245,0.7)' : 'rgba(250,248,245,0.4)',
                    }}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={resetTx}
                className="w-btn-outline w-full justify-center"
                style={{ fontSize: '0.8125rem', padding: '14px 30px', opacity: 0.6, cursor: 'not-allowed' }}
                disabled
              >
                Processing…
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// ── Compact corner toast for success/error states ──
function TransactionToast() {
  const { txState, resetTx } = useTransactions()
  const isToast = txState.status === 'sealed' || txState.status === 'error' || txState.status === 'pending'

  if (!isToast) return null

  const getExplorerUrl = (txId: string) =>
    `https://testnet.flowscan.io/tx/${txId}`

  const handleRetry = async () => {
    if (txState.onRetry) {
      await txState.onRetry()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 110,
          maxWidth: 420, width: 'calc(100% - 48px)',
          borderRadius: 20,
          border: `1px solid ${
            txState.status === 'sealed' ? 'rgba(0,239,139,0.2)' :
            txState.status === 'error' ? 'rgba(239,68,68,0.2)' :
            'rgba(250,248,245,0.1)'
          }`,
          background: txState.status === 'pending'
            ? 'rgba(17,17,17,0.98)'
            : 'rgba(17,17,17,0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 10px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Accent bar */}
        <div style={{
          height: 3,
          background: txState.status === 'sealed' ? '#00EF8B' :
                      txState.status === 'error' ? '#ef4444' :
                      'linear-gradient(90deg, #00EF8B, #37DDDF)',
          width: '100%',
        }} />

        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            {/* Icon */}
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              {txState.status === 'pending' ? (
                <Loader2 className="w-5 h-5 text-[var(--sen-green)] animate-spin" />
              ) : txState.status === 'sealed' ? (
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(0,239,139,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle2 className="w-4 h-4 text-[var(--sen-green)]" />
                </div>
              ) : (
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(239,68,68,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FAF8F5' }}>
                  {txState.title}
                </span>
                <button
                  onClick={resetTx}
                  style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: 'none', background: 'transparent',
                    color: 'rgba(250,248,245,0.3)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <p style={{
                fontSize: '0.6875rem', color: 'rgba(250,248,245,0.5)',
                margin: 0, lineHeight: 1.4,
              }}>
                {txState.status === 'sealed'
                  ? 'Transaction confirmed on Flow Testnet.'
                  : txState.status === 'pending'
                    ? 'Transaction is being confirmed…'
                    : txState.error || 'Transaction failed.'}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                {txState.txId && (
                  <a
                    href={getExplorerUrl(txState.txId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: '0.5625rem', fontWeight: 500, letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'rgba(250,248,245,0.4)',
                      textDecoration: 'none', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#00EF8B')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,248,245,0.4)')}
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on FlowScan
                  </a>
                )}
                {txState.status === 'error' && txState.onRetry && (
                  <button
                    onClick={handleRetry}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: '0.5625rem', fontWeight: 500, letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#00EF8B',
                      background: 'none', border: 'none', cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry
                  </button>
                )}
                {txState.status === 'sealed' && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: '0.5625rem', fontWeight: 500,
                    color: 'rgba(0,239,139,0.5)',
                  }}>
                    <CheckCircle2 className="w-3 h-3" />
                    Confirmed
                  </span>
                )}
                {txState.status === 'pending' && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: '0.5625rem', fontWeight: 500,
                    color: 'rgba(250,248,245,0.3)',
                    animation: 'pulse 2s infinite',
                  }}>
                    <Clock className="w-3 h-3" />
                    Waiting… ({txState.txId?.slice(0, 8)}...)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
