'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Shield, AlertTriangle, DollarSign } from 'lucide-react'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
import { useVaultData } from 'hooks/useVaultData'

interface CreateVaultModalProps {
  onClose: () => void
}

interface VaultTemplate {
  id: string
  name: string
  description: string
  risk: 'low' | 'medium' | 'high'
  expectedAPY: string
  minDeposit: number
  features: string[]
  strategy: string
}

const vaultTemplates: VaultTemplate[] = [
  {
    id: 'conservative',
    name: 'Conservative Growth',
    description: 'Stable returns with minimal risk through liquid staking and low-risk DeFi protocols',
    risk: 'low',
    expectedAPY: '4-8%',
    minDeposit: 10,
    features: ['Liquid Staking', 'Auto-Compounding', 'Emergency Pause'],
    strategy: 'Balanced allocation across stable protocols with automatic rebalancing'
  },
  {
    id: 'balanced',
    name: 'Balanced Yield',
    description: 'Moderate risk with diversified yield farming and lending strategies',
    risk: 'medium',
    expectedAPY: '8-15%',
    minDeposit: 25,
    features: ['Yield Farming', 'MEV Protection', 'Risk Management', 'Auto-Harvest'],
    strategy: 'Diversified approach combining lending, farming, and liquidity provision'
  },
  {
    id: 'aggressive',
    name: 'Aggressive Growth',
    description: 'Maximum yield potential through advanced DeFi strategies and leverage',
    risk: 'high',
    expectedAPY: '15-30%',
    minDeposit: 50,
    features: ['Leveraged Farming', 'MEV Protection', 'Advanced Strategies', 'Real-time Monitoring'],
    strategy: 'High-yield farming with leverage and sophisticated risk management'
  }
]

export function CreateVaultModal({ onClose }: CreateVaultModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [vaultName, setVaultName] = useState('')
  const [step, setStep] = useState(1) // 1: Select Template, 2: Configure, 3: Confirm, 4: Creating
  
  const { createVault, flowBalance, loading } = useVaultData()
  const selectedVault = vaultTemplates.find(v => v.id === selectedTemplate)

  const handleCreateVault = async () => {
    if (!selectedVault || !vaultName || !depositAmount) return
    
    try {
      setStep(4) // Show loading step
      
      await createVault(
        vaultName || selectedVault.name,
        selectedVault.strategy,
        Number(depositAmount)
      )
      
      console.log('Vault created successfully')
      onClose()
      
      // Refresh the page to show the new vault
      window.location.reload()
      
    } catch (error) {
      console.error('Failed to create vault:', error)
      alert('Failed to create vault. Please try again.')
      setStep(3) // Go back to confirm step
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'high': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Create New Vault</h2>
            <p className="text-gray-400">Set up your autonomous DeFi strategy</p>
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
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {stepNum === 4 && step === 4 ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  stepNum
                )}
              </div>
              {stepNum < 4 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  step > stepNum ? 'bg-blue-600' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Template */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Choose Your Strategy
            </h3>
            
            {vaultTemplates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getRiskColor(template.risk)}>
                      {template.risk.toUpperCase()} RISK
                    </Badge>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">
                        {template.expectedAPY}
                      </div>
                      <div className="text-xs text-gray-400">Expected APY</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-400">Min Deposit</div>
                    <div className="text-white font-medium">
                      {template.minDeposit} FLOW
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Strategy</div>
                    <div className="text-white font-medium text-sm">
                      {template.strategy}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {template.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            ))}

            <div className="flex justify-end pt-4">
              <Button 
                onClick={() => setStep(2)}
                disabled={!selectedTemplate}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && selectedVault && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">
              Configure Your Vault
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vault Name
                </label>
                <input
                  type="text"
                  value={vaultName}
                  onChange={(e) => setVaultName(e.target.value)}
                  placeholder={selectedVault.name}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Initial Deposit (FLOW)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder={selectedVault.minDeposit.toString()}
                    min={selectedVault.minDeposit}
                    max={flowBalance}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <DollarSign className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Minimum: {selectedVault.minDeposit} FLOW</span>
                  <span>Available: {flowBalance.toFixed(2)} FLOW</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={!vaultName || !depositAmount || Number(depositAmount) < selectedVault.minDeposit || Number(depositAmount) > flowBalance}
              >
                Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedVault && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">
              Confirm Vault Creation
            </h3>

            <div className="glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">
                  {vaultName || selectedVault.name}
                </h4>
                <Badge className={getRiskColor(selectedVault.risk)}>
                  {selectedVault.risk.toUpperCase()} RISK
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-400">Strategy</div>
                  <div className="text-white">{selectedVault.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Expected APY</div>
                  <div className="text-green-400 font-semibold">
                    {selectedVault.expectedAPY}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Initial Deposit</div>
                  <div className="text-white">{depositAmount} FLOW</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Est. Gas Fee</div>
                  <div className="text-white">~0.001 FLOW</div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center text-yellow-400 mb-2">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Important Notice</span>
                </div>
                <p className="text-xs text-gray-400">
                  By creating this vault, you acknowledge the risks associated with DeFi protocols. 
                  Your funds will be managed autonomously according to the selected strategy.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleCreateVault} disabled={loading}>
                <Shield className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create Vault'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Creating */}
        {step === 4 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Creating Your Vault
            </h3>
            <p className="text-gray-400 mb-4">
              Please wait while we deploy your vault to the Flow blockchain...
            </p>
            <div className="text-sm text-gray-500">
              This may take a few moments. Do not close this window.
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}