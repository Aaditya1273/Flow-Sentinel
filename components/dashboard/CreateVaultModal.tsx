'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Shield, AlertTriangle, DollarSign, TrendingUp, Zap } from 'lucide-react'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
import { useVaultData } from 'hooks/useVaultData'
import { FlowService } from 'lib/flow-service'

interface CreateVaultModalProps {
  onClose: () => void
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

export function CreateVaultModal({ onClose, preselectedStrategy }: CreateVaultModalProps) {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(preselectedStrategy || null)
  const [depositAmount, setDepositAmount] = useState('')
  const [vaultName, setVaultName] = useState('')
  const [step, setStep] = useState(1) // 1: Select Strategy, 2: Configure, 3: Confirm, 4: Creating
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { createVault, flowBalance, loading: vaultLoading } = useVaultData()
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

  const handleCreateVault = async () => {
    if (!selectedStrategyData || !vaultName || !depositAmount) return
    
    try {
      setStep(4) // Show loading step
      
      // Use the real FlowService to create vault with strategy
      await FlowService.createVaultWithStrategy(
        selectedStrategyData.id,
        Number(depositAmount)
      )
      
      console.log('Vault created successfully with strategy:', selectedStrategyData.id)
      onClose()
      
      // Refresh the page to show the new vault
      window.location.reload()
      
    } catch (error) {
      console.error('Failed to create vault:', error)
      alert('Failed to create vault. Please try again.')
      setStep(3) // Go back to confirm step
    }
  }

  const getRiskColor = (riskLevel: number) => {
    switch (riskLevel) {
      case 1: return 'text-green-400 bg-green-400/20'
      case 2: return 'text-yellow-400 bg-yellow-400/20'
      case 3: return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getRiskLabel = (riskLevel: number) => {
    switch (riskLevel) {
      case 1: return 'LOW'
      case 2: return 'MEDIUM'
      case 3: return 'HIGH'
      default: return 'UNKNOWN'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'liquid-staking': return <Shield className="w-5 h-5" />
      case 'yield-farming': return <TrendingUp className="w-5 h-5" />
      case 'lending': return <DollarSign className="w-5 h-5" />
      case 'arbitrage': return <Zap className="w-5 h-5" />
      default: return <Shield className="w-5 h-5" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background border border-border rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Create New Vault</h2>
            <p className="text-muted-foreground">Deploy your autonomous DeFi strategy on Flow blockchain</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum 
                  ? 'bg-accent text-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {stepNum === 4 && step === 4 ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
                ) : (
                  stepNum
                )}
              </div>
              {stepNum < 4 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  step > stepNum ? 'bg-accent' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading strategies from blockchain...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Strategies</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {/* Step 1: Select Strategy */}
        {step === 1 && !loading && !error && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Choose Your Strategy
            </h3>
            
            {strategies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No strategies available. Please ensure contracts are deployed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {strategies.map((strategy) => (
                  <motion.div
                    key={strategy.id}
                    whileHover={{ scale: 1.02 }}
                    className={`tool-card p-6 cursor-pointer transition-all border-2 ${
                      selectedStrategy === strategy.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50'
                    }`}
                    onClick={() => setSelectedStrategy(strategy.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-accent rounded-lg">
                          {getCategoryIcon(strategy.category)}
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-foreground">
                            {strategy.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            by {strategy.creator}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={`${getRiskColor(strategy.riskLevel)} font-medium`}>
                          {getRiskLabel(strategy.riskLevel)} RISK
                        </Badge>
                        {strategy.verified && (
                          <Badge variant="outline" className="text-xs status-active border-accent">
                            VERIFIED
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {strategy.description}
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 font-medium">Expected APY</div>
                        <div className="text-2xl font-bold status-active financial-number">
                          {strategy.expectedAPY.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 font-medium">Min Deposit</div>
                        <div className="text-lg font-semibold text-foreground financial-number">
                          {strategy.minDeposit} FLOW
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {strategy.features.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs bg-accent/20 border-accent/30">
                          {feature}
                        </Badge>
                      ))}
                      {strategy.features.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-accent/20 border-accent/30">
                          +{strategy.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button 
                onClick={() => setStep(2)}
                disabled={!selectedStrategy}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && selectedStrategyData && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">
              Configure Your Vault
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Vault Name
                </label>
                <input
                  type="text"
                  value={vaultName}
                  onChange={(e) => setVaultName(e.target.value)}
                  placeholder={`My ${selectedStrategyData.name} Vault`}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Initial Deposit (FLOW)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder={selectedStrategyData.minDeposit.toString()}
                    min={selectedStrategyData.minDeposit}
                    max={flowBalance}
                    step="0.1"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
                  />
                  <DollarSign className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Minimum: {selectedStrategyData.minDeposit} FLOW</span>
                  <span>Available: {flowBalance.toFixed(2)} FLOW</span>
                </div>
              </div>

              {/* Strategy Details */}
              <div className="tool-card p-4 border border-border">
                <h4 className="text-sm font-semibold text-foreground mb-3">Strategy Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <span className="text-foreground ml-2 capitalize">{selectedStrategyData.category.replace('-', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected APY:</span>
                    <span className="text-accent ml-2 font-semibold">{selectedStrategyData.expectedAPY.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-muted-foreground text-sm">Features:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedStrategyData.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={!vaultName || !depositAmount || Number(depositAmount) < selectedStrategyData.minDeposit || Number(depositAmount) > flowBalance}
              >
                Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedStrategyData && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">
              Confirm Vault Creation
            </h3>

            <div className="tool-card p-4 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-foreground">
                  {vaultName}
                </h4>
                <Badge className={getRiskColor(selectedStrategyData.riskLevel)}>
                  {getRiskLabel(selectedStrategyData.riskLevel)} RISK
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Strategy</div>
                  <div className="text-foreground">{selectedStrategyData.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Expected APY</div>
                  <div className="text-accent font-semibold">
                    {selectedStrategyData.expectedAPY.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Initial Deposit</div>
                  <div className="text-foreground financial-number">{depositAmount} FLOW</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Est. Gas Fee</div>
                  <div className="text-foreground">~0.001 FLOW</div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center text-accent mb-2">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Important Notice</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  By creating this vault, you acknowledge the risks associated with DeFi protocols. 
                  Your funds will be managed autonomously according to the selected strategy deployed on Flow blockchain.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleCreateVault} disabled={vaultLoading}>
                <Shield className="w-4 h-4 mr-2" />
                {vaultLoading ? 'Creating...' : 'Create Vault'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Creating */}
        {step === 4 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Creating Your Vault
            </h3>
            <p className="text-muted-foreground mb-4">
              Deploying your vault with {selectedStrategyData?.name} strategy to Flow blockchain...
            </p>
            <div className="text-sm text-muted-foreground">
              This may take a few moments. Do not close this window.
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}