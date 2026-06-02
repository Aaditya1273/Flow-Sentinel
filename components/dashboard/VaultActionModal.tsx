'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Shield,
    Zap,
    Info,
} from 'lucide-react'
import { FlowService } from 'lib/flow-service'
import { useTransactions } from 'lib/transactions'
import { formatCurrency } from 'lib/utils'

interface VaultActionModalProps {
    isOpen: boolean
    onClose: () => void
    type: 'deposit' | 'withdraw'
    vaultName: string
    vaultId: string
    balance: number
    availableFlow?: number
}

export function VaultActionModal({
    isOpen, onClose, type, vaultName, vaultId, balance, availableFlow = 0
}: VaultActionModalProps) {
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isDeposit = type === 'deposit'
    const maxAmount = isDeposit ? availableFlow : balance
    const { setTxState } = useTransactions()

    const handleAction = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setError('Please enter a valid amount'); return
        }
        if (Number(amount) > maxAmount) {
            setError(`Insufficient ${isDeposit ? 'Flow balance' : 'vault balance'}`); return
        }
        try {
            setLoading(true); setError(null)
            const actionTitle = isDeposit ? 'Capital Injection' : 'Funds Extraction'
            setTxState({ status: 'executing', txId: null, error: null, title: actionTitle })
            const result = isDeposit
                ? await FlowService.deposit(vaultId, Number(amount))
                : await FlowService.withdraw(vaultId, Number(amount))
            const { transactionId, sealed } = result
            setTxState({ status: 'pending', txId: transactionId, error: null, title: actionTitle })
            onClose()
            await sealed
            setTxState({ status: 'sealed', txId: transactionId, error: null, title: isDeposit ? 'Injection Successful' : 'Extraction Successful' })
        } catch (err: any) {
            const errorMessage = err.message || `Failed to ${type}. Please try again.`
            setError(errorMessage)
            setTxState({ status: 'error', txId: null, error: errorMessage, title: 'Transaction Failed' })
        } finally { setLoading(false) }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
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
                            position: 'relative', width: '100%', maxWidth: 560,
                            borderRadius: 32, border: '1px solid rgba(250,248,245,0.10)',
                            background: '#111',
                            backdropFilter: 'blur(30px)',
                            overflow: 'hidden',
                            boxShadow: '0 0 100px rgba(0,0,0,0.5)',
                        }}
                    >
                        {/* Glow accent */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                            background: `linear-gradient(90deg, transparent, ${isDeposit ? '#00EF8B' : '#37DDDF'}, transparent)`,
                            opacity: 0.5,
                        }} />

                        <div style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div>
                                        <h2 style={{
                                            fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
                                            fontSize: '1.25rem', fontWeight: 500, letterSpacing: '-0.02em',
                                            color: '#FAF8F5', margin: 0, textTransform: 'uppercase',
                                        }}>
                                            {isDeposit ? 'Capital Injection' : 'Funds Extraction'}
                                        </h2>
                                        <p className="dash-label">{vaultName}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} style={{
                                    width: 40, height: 40, borderRadius: 16,
                                    border: '1px solid rgba(250,248,245,0.10)',
                                    background: 'transparent', color: 'rgba(250,248,245,0.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(250,248,245,0.06)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <X style={{ width: 16, height: 16 }} />
                                </button>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <label className="dash-label">{isDeposit ? 'Transfer Amount' : 'Withdrawal Amount'}</label>
                                    <span className="dash-label">Available: {isDeposit ? formatCurrency(availableFlow) : formatCurrency(balance)}</span>
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => { setAmount(e.target.value); setError(null) }}
                                        placeholder="0.00"
                                        className="dash-input"
                                        style={{ fontSize: '1.75rem', fontWeight: 500, padding: '24px 32px', fontVariantNumeric: 'tabular-nums' }}
                                    />
                                    <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={() => setAmount((maxAmount * 0.5).toFixed(2))}
                                            className="dash-badge dash-badge-muted"
                                            style={{ cursor: 'pointer', padding: '8px 14px' }}
                                        >
                                            50%
                                        </button>
                                        <button
                                            onClick={() => setAmount(maxAmount.toFixed(2))}
                                            className="dash-badge dash-badge-green"
                                            style={{ cursor: 'pointer', padding: '8px 14px' }}
                                        >
                                            MAX
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            marginTop: 16, padding: 16, borderRadius: 16,
                                            background: 'rgba(239,68,68,0.06)',
                                            border: '1px solid rgba(239,68,68,0.15)',
                                            color: '#ef4444', fontSize: '0.8125rem', fontWeight: 700,
                                            display: 'flex', alignItems: 'center', gap: 12,
                                        }}
                                    >
                                        <Info style={{ width: 16, height: 16 }} />
                                        {error}
                                    </motion.div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
                                    <div style={{
                                        padding: 16, borderRadius: 20,
                                        border: '1px solid rgba(250,248,245,0.04)',
                                        background: 'rgba(250,248,245,0.02)',
                                    }}>
                                        <span className="dash-label">Network Fee</span>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#FAF8F5', marginTop: 4 }}>~0.001 FLOW</div>
                                    </div>
                                    <div style={{
                                        padding: 16, borderRadius: 20,
                                        border: '1px solid rgba(250,248,245,0.04)',
                                        background: 'rgba(250,248,245,0.02)',
                                    }}>
                                        <span className="dash-label">Execution Speed</span>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00EF8B', marginTop: 4, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            Instant <Zap style={{ width: 12, height: 12 }} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: 24 }}>
                                    <button
                                        onClick={handleAction}
                                        disabled={loading || !amount}
                                        className="dash-cta"
                                        style={{
                                            width: '100%', padding: '20px 0',
                                            boxShadow: isDeposit ? '0 10px 40px rgba(0,239,139,0.2)' : 'none',
                                            background: isDeposit ? '#00EF8B' : 'rgba(250,248,245,0.08)',
                                            color: isDeposit ? '#000' : '#FAF8F5',
                                            fontSize: '0.75rem',
                                        }}
                                    >
                                        {loading ? (
                                            <span style={{ width: 20, height: 20, border: '2px solid rgba(0,239,139,0.3)', borderTopColor: '#00EF8B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                        ) : (
                                            <>
                                                <Shield style={{ width: 16, height: 16 }} />
                                                {isDeposit ? 'Authorize Injection' : 'Confirm Extraction'}
                                            </>
                                        )}
                                    </button>
                                    <p style={{ textAlign: 'center', fontSize: '0.5625rem', fontWeight: 700, color: 'rgba(250,248,245,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 16 }}>
                                        Flow Sentinel Security Layer Enabled
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
