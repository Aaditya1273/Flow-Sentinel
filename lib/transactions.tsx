'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ExternalLink,
    CheckCircle2,
    Loader2,
    XCircle,
    ShieldCheck,
    ChevronRight,
    Terminal,
    Zap,
    Activity
} from 'lucide-react'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'

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
        title: 'Transaction'
    })

    const resetTx = () => setTxState({ status: 'idle', txId: null, error: null, title: 'Transaction' })

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

    const getExplorerUrl = (txId: string) => `https://testnet.flowscan.org/transaction/${txId}`

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg glass border-primary/20 bg-slate-950/80 shadow-[0_0_50px_rgba(0,239,139,0.15)] overflow-hidden rounded-[2.5rem]"
                >
                    {/* Decorative Corner Glows */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 blur-3xl" />

                    <div className="p-8 sm:p-10 relative z-10">
                        {/* Header Status Icon */}
                        <div className="flex justify-center mb-8">
                            <div className="relative">
                                <AnimatePresence mode="wait">
                                    {txState.status === 'executing' || txState.status === 'pending' ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0, rotate: -45 }}
                                            animate={{ opacity: 1, rotate: 0 }}
                                            exit={{ opacity: 0, rotate: 45 }}
                                            className="w-20 h-20 rounded-3xl glass flex items-center justify-center bg-primary/5 border-primary/30"
                                        >
                                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                            <div className="absolute inset-[-4px] border-2 border-primary/20 rounded-[2.25rem] animate-ping opacity-20" />
                                        </motion.div>
                                    ) : txState.status === 'sealed' ? (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="w-20 h-20 rounded-3xl glass flex items-center justify-center bg-primary/10 border-primary/40 shadow-[0_0_30px_rgba(0,239,139,0.3)]"
                                        >
                                            <CheckCircle2 className="w-10 h-10 text-primary" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="error"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="w-20 h-20 rounded-3xl glass flex items-center justify-center bg-destructive/5 border-destructive/30"
                                        >
                                            <XCircle className="w-10 h-10 text-destructive" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="text-center mb-10">
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-3">
                                {txState.status === 'executing' ? 'Requesting Auth' :
                                    txState.status === 'pending' ? 'Dispatching Sentinel' :
                                        txState.status === 'sealed' ? 'Protocol Sealed' : 'Transmission Failed'}
                            </h3>
                            <p className="text-muted-foreground font-medium px-4">
                                {txState.status === 'executing' ? 'Waiting for secure wallet authorization...' :
                                    txState.status === 'pending' ? 'Transaction broadcasted to Flow network.' :
                                        txState.status === 'sealed' ? 'Success. Your sentinel protocols have been updated on-chain.' :
                                            txState.error || 'The secure link was interrupted. Please try again.'}
                            </p>
                        </div>

                        {/* Transaction Data Card */}
                        {(txState.txId || txState.error) && (
                            <div className="mb-10 tool-card border-white/5 bg-white/[0.02] p-6 rounded-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Terminal className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Log Details</span>
                                    </div>
                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-white/10 opacity-60">TESTNET</Badge>
                                </div>

                                {txState.txId && (
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Transaction Hash</span>
                                            <code className="text-[11px] font-mono text-white/70 bg-black/40 p-2 rounded-lg break-all select-all border border-white/5">
                                                {txState.txId}
                                            </code>
                                        </div>

                                        <a
                                            href={getExplorerUrl(txState.txId)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary/5 border border-primary/20 text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/10 transition-all group"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            View on FlowExplorer
                                            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* System Status Pills */}
                        <div className="flex items-center justify-center gap-4 mb-10">
                            <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full border-white/5 bg-white/[0.02]">
                                <ShieldCheck className="w-3 h-3 text-primary" />
                                <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Secure Vault</span>
                            </div>
                            <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full border-white/5 bg-white/[0.02]">
                                <Activity className="w-3 h-3 text-secondary" />
                                <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Vitals Normal</span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <Button
                            onClick={resetTx}
                            className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all ${txState.status === 'sealed' ? 'btn-primary shadow-[0_10px_30px_rgba(0,239,139,0.2)]' :
                                txState.status === 'error' ? 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20' :
                                    'glass opacity-50 cursor-not-allowed'
                                }`}
                            disabled={txState.status === 'executing' || txState.status === 'pending'}
                        >
                            {txState.status === 'sealed' ? 'Dismiss Protocol' :
                                txState.status === 'error' ? 'Try Again' : 'Synchronizing...'}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
