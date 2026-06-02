'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ExternalLink,
  CheckCircle2,
  Loader2,
  XCircle,
  ChevronRight,
} from 'lucide-react'

type TransactionStatus = 'idle' | 'executing' | 'pending' | 'sealed' | 'error'

interface TransactionState {
  status: TransactionStatus
  txId: string | null
  error: string | null
  title: string
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

  const resetTx = () =>
    setTxState({ status: 'idle', txId: null, error: null, title: 'Transaction' })

  return (
    <TransactionContext.Provider value={{ txState, setTxState, resetTx }}>
      {children}
      <TransactionModal />
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (!context) throw new Error('useTransactions must be used within TransactionProvider')
  return context
}

function TransactionModal() {
  const { txState, resetTx } = useTransactions()
  const isOpen = txState.status !== 'idle'

  if (!isOpen) return null

  const getExplorerUrl = (txId: string) =>
    `https://testnet.flowscan.io/tx/${txId}`

  const stepLabel = {
    idle: '',
    executing: 'Authorizing',
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
          {/* Card — exact w-card styling */}
          <div className="w-card overflow-hidden">
            <div className="p-8 sm:p-10">
              {/* Status indicator */}
              <div className="flex items-center gap-3 mb-8">
                {txState.status === 'executing' || txState.status === 'pending' ? (
                  <Loader2 className="w-5 h-5 text-[var(--sen-green)] animate-spin" />
                ) : txState.status === 'sealed' ? (
                  <CheckCircle2 className="w-5 h-5 text-[var(--sen-green)]" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span
                  className="text-label-sm"
                  style={{ color: 'rgba(250,248,245,0.5)' }}
                >
                  {stepLabel}
                </span>
              </div>

              {/* Title */}
              <h2
                className="text-display-md mb-3"
                style={{
                  fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {txState.status === 'executing'
                  ? 'Confirm in Wallet'
                  : txState.status === 'pending'
                    ? 'Broadcasting'
                    : txState.status === 'sealed'
                      ? 'Transaction Complete'
                      : 'Transaction Failed'}
              </h2>

              {/* Description */}
              <p
                className="text-body-s mb-8"
                style={{ color: 'rgba(250,248,245,0.55)' }}
              >
                {txState.status === 'executing'
                  ? 'Please approve the request in your connected wallet.'
                  : txState.status === 'pending'
                    ? 'Your transaction is being submitted to the Flow network.'
                    : txState.status === 'sealed'
                      ? 'Your vault has been updated on-chain.'
                      : txState.error || 'Something went wrong. Please try again.'}
              </p>

              {/* Transaction details */}
              {(txState.txId || txState.error) && (
                <div className="mb-8 p-5 rounded-2xl" style={{ background: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.06)' }}>
                  {txState.txId && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-label-sm" style={{ color: 'rgba(250,248,245,0.4)' }}>
                          Transaction
                        </span>
                        <span
                          className="text-label-sm px-2 py-1 rounded-full"
                          style={{
                            background: 'rgba(0,239,139,0.08)',
                            color: 'var(--sen-green)',
                          }}
                        >
                          Testnet
                        </span>
                      </div>

                      <code
                        className="block text-body-s font-mono mb-4 p-3 rounded-xl select-all"
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          color: 'rgba(250,248,245,0.6)',
                          border: '1px solid rgba(250,248,245,0.06)',
                          wordBreak: 'break-all',
                        }}
                      >
                        {txState.txId}
                      </code>

                      <a
                        href={getExplorerUrl(txState.txId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-btn-outline w-full justify-center"
                        style={{ fontSize: '0.8125rem', padding: '12px 24px' }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View on FlowScan
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    </>
                  )}
                  {txState.error && !txState.txId && (
                    <p className="text-body-s" style={{ color: 'rgba(248,113,113,0.8)' }}>
                      {txState.error}
                    </p>
                  )}
                </div>
              )}

              {/* Action button */}
              <button
                onClick={resetTx}
                disabled={txState.status === 'executing' || txState.status === 'pending'}
                className={
                  txState.status === 'sealed'
                    ? 'dash-cta w-full justify-center'
                    : txState.status === 'error'
                      ? 'w-btn-outline w-full justify-center'
                      : 'w-btn-outline w-full justify-center opacity-40 cursor-not-allowed'
                }
                style={
                  txState.status === 'sealed'
                    ? { fontSize: '0.8125rem', padding: '14px 30px' }
                    : { fontSize: '0.8125rem', padding: '14px 30px' }
                }
              >
                {txState.status === 'sealed'
                  ? 'Dismiss'
                  : txState.status === 'error'
                    ? 'Try Again'
                    : 'Processing…'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
