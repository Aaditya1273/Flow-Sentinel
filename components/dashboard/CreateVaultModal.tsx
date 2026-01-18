'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Shield,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Zap,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Lock,
  ArrowRight,
  Target,
  Sparkles
} from 'lucide-react'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
import { useVaultData } from 'hooks/useVaultData'
import { FlowService } from 'lib/flow-service'
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
  const [step, setStep] = useState(1) // 1: Select Strategy, 2: Configure, 3: Confirm, 4: Creating
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { flowBalance, loading: vaultLoading } = useVaultData()
  const selectedStrategyData = strategies.find(s => s.id === selectedStrategy)

  // Load strategies from blockchain
  useEffect(() => {
    const loadStrategies = async () => {
      try {
        setLoading(true)
        setError(null)

        const blockchainStrategies = await FlowService.getAllStrategies()

        if (blockchainStrategies && blockchainStrategies.length > 0) {
          const transformedStrategies: Strategy[] = blockchainStrategies.map((strategy: any) => ({
            id: strategy.id,
            name: strategy.name,
            description: strategy.description,
            riskLevel: parseInt(strategy.riskLevel || '1'),
            category: strategy.category,
            expectedAPY: parseFloat(strategy.expectedAPY || '0'),
            minDeposit: parseFloat(strategy.minDeposit || '0'),
            features: strategy.features || [],
            creator: strategy.creator || 'Unknown',
            verified: strategy.verified === true
          }))

          setStrategies(transformedStrategies)
        } else {
          setError('No strategies available. Please ensure contracts are deployed.')
        }
      } catch (err) {
        console.error('Error loading strategies:', err)
        setError('Failed to load strategies from blockchain.')
      } finally {
        setLoading(false)
      }
    }

    loadStrategies()
  }, [])

  // Auto-advance if strategy is pre-selected
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
      setStep(4) // Show loading step
      setTxState({ status: 'executing', txId: null, error: null, title: 'Launching Sentinel' })

      const { transactionId, sealed } = await FlowService.createVaultWithStrategy(
        selectedStrategyData.id,
        vaultName,
        Number(depositAmount)
      )

      setTxState({ status: 'pending', txId: transactionId, error: null, title: 'Deploying Protocol' })
      onClose()

      await sealed
      setTxState({ status: 'sealed', txId: transactionId, error: null, title: 'Sentinel Deployed' })

      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error('Failed to create vault:', err)
      const errorMessage = err.message || 'Failed to create vault on blockchain.'
      setError(errorMessage)
      setStep(3)
      setTxState({ status: 'error', txId: null, error: errorMessage, title: 'Deployment Failed' })
    }
  }

  const getRiskBadge = (riskLevel: number) => {
    switch (riskLevel) {
      case 1: return 'text-primary bg-primary/10 border-primary/40'
      case 2: return 'text-warning bg-warning/10 border-warning/20'
      case 3: return 'text-destructive bg-destructive/10 border-destructive/20'
      default: return 'text-muted-foreground bg-white/5 border-white/10'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'liquid-staking': return <Shield className="w-5 h-5" />
      case 'yield-farming': return <TrendingUp className="w-5 h-5" />
      case 'lending': return <DollarSign className="w-5 h-5" />
      case 'arbitrage': return <Zap className="w-5 h-5" />
      default: return <Target className="w-5 h-5" />
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
        className="relative glass border-white/15 rounded-[40px] w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-secondary/5 blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="p-10 pb-6 flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Step {step} of 4</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
              {step === 1 && 'Select Strategy'}
              {step === 2 && 'Configuration'}
              {step === 3 && 'Final Verification'}
              {step === 4 && 'Deploying Sentinel'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 glass rounded-2xl flex items-center justify-center transition-all hover:bg-white/10 border-white/15"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Progress Bar Container */}
        <div className="px-10 mb-8 relative z-10">
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary shadow-[0_0_10px_rgba(0,239,139,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar relative z-10">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Strategy */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="tool-card h-64 animate-pulse glass border-white/15" />
                  ))
                ) : (
                  strategies.map((strategy) => (
                    <div
                      key={strategy.id}
                      onClick={() => setSelectedStrategy(strategy.id)}
                      className={`tool-card p-8 cursor-pointer border-2 transition-all group ${selectedStrategy === strategy.id
                        ? 'border-primary bg-primary/5 shadow-[0_0_30px_rgba(0,239,139,0.05)]'
                        : 'border-white/15 hover:border-white/20'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 glass rounded-2xl flex items-center justify-center border-white/15 transition-all ${selectedStrategy === strategy.id ? 'bg-primary text-primary-foreground' : 'bg-white/5 group-hover:bg-white/10'
                          }`}>
                          {getCategoryIcon(strategy.category)}
                        </div>
                        <Badge className={`${getRiskBadge(strategy.riskLevel)} border text-[10px] uppercase font-black tracking-widest px-2 py-1`}>
                          {strategy.riskLevel === 1 ? 'Low' : strategy.riskLevel === 2 ? 'Medium' : 'High'} Risk
                        </Badge>
                      </div>

                      <h4 className="text-xl font-black text-white tracking-tighter uppercase italic mb-2">
                        {strategy.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                        {strategy.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Expected APY</span>
                          <span className="text-2xl font-black text-primary tracking-tighter financial-number">{strategy.expectedAPY}%</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Min. Deposit</span>
                          <span className="text-lg font-black text-white tracking-tighter financial-number">{strategy.minDeposit} FLOW</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {strategy.features.slice(0, 3).map(f => (
                          <span key={f} className="text-[9px] font-black uppercase text-muted-foreground tracking-widest bg-white/5 px-2 py-1 rounded-lg border border-white/15 italic">
                            {f}
                          </span>
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
                className="max-w-2xl mx-auto space-y-10"
              >
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-1">Vault Identifier</label>
                  <input
                    type="text"
                    value={vaultName}
                    onChange={(e) => setVaultName(e.target.value)}
                    placeholder={`Sentinel-Alpha-01`}
                    className="w-full bg-white/5 border-2 border-white/15 rounded-3xl p-6 text-2xl font-black tracking-tighter italic uppercase text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between px-1">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Capital Deployment (FLOW)</label>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Available: {formatCurrency(flowBalance)}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder={selectedStrategyData.minDeposit.toString()}
                      className="w-full bg-white/5 border-2 border-white/15 rounded-3xl p-8 text-4xl font-black tracking-tight text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 transition-all financial-number"
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-2">
                      <button
                        onClick={() => setDepositAmount((flowBalance * 0.5).toFixed(1))}
                        className="glass-pill border-white/10 hover:bg-white/10 px-4 py-2 text-[10px] font-black"
                      >
                        50%
                      </button>
                      <button
                        onClick={() => setDepositAmount(flowBalance.toFixed(1))}
                        className="glass-pill border-primary/40 bg-primary/10 text-primary px-4 py-2 text-[10px] font-black"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                  <p className="px-4 text-[10px] font-bold text-muted-foreground italic">Minimum Required Capital: {selectedStrategyData.minDeposit} FLOW</p>
                </div>

                <div className="glass p-8 rounded-[30px] border-white/15 bg-white/[0.02] flex items-center gap-6">
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center bg-primary/5">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-white uppercase italic tracking-tighter">Optimization Enabled</h5>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">
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
                className="max-w-3xl mx-auto"
              >
                <div className="tool-card p-10 border-white/15 glass bg-white/[0.02] rounded-[40px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Shield className="w-32 h-32" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Final Verification Required</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                      <div className="space-y-6">
                        <div>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Target Name</span>
                          <span className="text-2xl font-black text-white uppercase italic tracking-tighter">{vaultName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Strategy Engine</span>
                          <span className="text-xl font-black text-primary uppercase italic tracking-tighter">{selectedStrategyData.name}</span>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Capital Allocation</span>
                          <span className="text-4xl font-black text-white tracking-tighter financial-number">{depositAmount} FLOW</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Security Fee (Est.)</span>
                          <span className="text-lg font-black text-muted-foreground tracking-tighter financial-number">~0.001 FLOW</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/10">
                      <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="text-[10px] font-black text-destructive uppercase tracking-widest">Protocol Confirmation</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium italic leading-relaxed">
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
                className="h-full flex flex-col items-center justify-center text-center py-20"
              >
                <div className="relative w-48 h-48 mb-12">
                  <div className="absolute inset-0 border-8 border-primary/10 rounded-full" />
                  <motion.div
                    className="absolute inset-0 border-8 border-primary border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-4 border-2 border-secondary/40 rounded-full border-dashed animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-16 h-16 text-primary animate-pulse" />
                  </div>
                </div>

                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-4">
                  Deploying Intelligence
                </h3>
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-0" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-150" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-300" />
                </div>
                <div className="max-w-md space-y-4">
                  <p className="text-sm font-bold text-muted-foreground italic uppercase tracking-widest">
                    Initializing Vault Registry...
                  </p>
                  <p className="text-[10px] font-black text-primary/50 uppercase tracking-[0.2em] animate-pulse">
                    Finalizing on Flow Testnet. Do not close the link.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {step < 4 && (
          <div className="p-10 pt-6 flex justify-between items-center border-t border-white/15 bg-black/20 relative z-10">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {step === 1 ? 'Cancel Operation' : 'Reverse Step'}
            </button>

            <div className="flex gap-4">
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 ? !selectedStrategy : (!vaultName || !depositAmount || Number(depositAmount) < (selectedStrategyData?.minDeposit || 0))}
                  className="btn-primary px-10 py-4 rounded-xl flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(0,239,139,0.2)] disabled:opacity-50 disabled:grayscale transition-all"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCreateVault}
                  disabled={vaultLoading}
                  className="btn-primary px-12 py-5 rounded-xl flex items-center gap-4 font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(0,239,139,0.3)] hover:shadow-[0_10px_50px_rgba(0,239,139,0.5)] transition-all"
                >
                  <Lock className="w-5 h-5" />
                  Finalize Deployment
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
