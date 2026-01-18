'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    ArrowDownLeft,
    Plus,
    Shield,
    Zap,
    Info,
    Loader2
} from 'lucide-react'
import { Button } from 'components/ui/button'
import { FlowService } from 'lib/flow-service'
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
    isOpen,
    onClose,
    type,
    vaultName,
    vaultId,
    balance,
    availableFlow = 0
}: VaultActionModalProps) {
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isDeposit = type === 'deposit'
    const maxAmount = isDeposit ? availableFlow : balance

    const handleAction = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setError('Please enter a valid amount')
            return
        }

        if (Number(amount) > maxAmount) {
            setError(`Insufficient ${isDeposit ? 'Flow balance' : 'vault balance'}`)
            return
        }

        try {
            setLoading(true)
            setError(null)

            if (isDeposit) {
                await FlowService.deposit(vaultId, Number(amount))
            } else {
                await FlowService.withdraw(vaultId, Number(amount))
            }

            onClose()
            // Refresh the page data without a full reload
            setTimeout(() => {
                window.location.href = '/dashboard'
            }, 500)
        } catch (err: any) {
            console.error(`Error during ${type}:`, err)
            setError(err.message || `Failed to ${type}. Please try again.`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative glass border-white/15 rounded-[32px] w-full max-w-lg overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                    >
                        {/* Top Glow Accent */}
                        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${isDeposit ? 'from-primary/0 via-primary to-primary/0' : 'from-secondary/0 via-secondary to-secondary/0'} opacity-50`} />

                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center glass border-white/10 ${isDeposit ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                                        {isDeposit ? <Plus className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                                            {isDeposit ? 'Capital Injection' : 'Funds Extraction'}
                                        </h2>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{vaultName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors border-white/10"
                                >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2 px-1">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            {isDeposit ? 'Transfer Amount' : 'Withdrawal Amount'}
                                        </label>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                            Available: {isDeposit ? formatCurrency(availableFlow) : formatCurrency(balance)}
                                        </span>
                                    </div>

                                    <div className="relative group">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => {
                                                setAmount(e.target.value)
                                                setError(null)
                                            }}
                                            placeholder="0.00"
                                            className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-6 text-3xl font-black tracking-tight text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all financial-number"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2">
                                            <button
                                                onClick={() => setAmount((maxAmount * 0.5).toFixed(2))}
                                                className="glass-pill border-white/10 hover:bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase"
                                            >
                                                50%
                                            </button>
                                            <button
                                                onClick={() => setAmount(maxAmount.toFixed(2))}
                                                className="glass-pill border-primary/40 bg-primary/10 text-primary px-3 py-1.5 text-[10px] font-black uppercase"
                                            >
                                                MAX
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold italic flex items-center gap-3"
                                    >
                                        <Info className="w-4 h-4" />
                                        {error}
                                    </motion.div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 glass rounded-2xl border-white/5 bg-white/[0.02]">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Network Fee</span>
                                        <span className="text-xs font-bold text-white">~0.001 FLOW</span>
                                    </div>
                                    <div className="p-4 glass rounded-2xl border-white/5 bg-white/[0.02]">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Execution Speed</span>
                                        <span className="text-xs font-bold text-primary italic uppercase">Instant <Zap className="w-2.5 h-2.5 inline ml-1" /></span>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        className={`w-full py-8 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-lg transition-all ${isDeposit
                                            ? 'btn-primary shadow-primary/20'
                                            : 'bg-white/10 text-white hover:bg-white/20 border-white/10'
                                            }`}
                                        onClick={handleAction}
                                        disabled={loading || !amount}
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Shield className="w-4 h-4 mr-2" />
                                                {isDeposit ? 'Authorize Injection' : 'Confirm Extraction'}
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-center text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-4 opacity-50">
                                        Proprietary Flow Sentinel Security Layer Enabled
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
