'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Zap, Wallet, Rocket, Check, ArrowRight } from 'lucide-react'
import { useOnboarding } from 'hooks/useOnboarding'

const steps = [
  {
    title: 'Welcome to Flow Sentinel',
    subtitle: 'The Autonomous DeFi Wealth Manager',
    description: 'Flow Sentinel is the first fully autonomous, MEV-resistant wealth manager built on the Flow blockchain. Your vaults work for you — 24/7, without manual intervention.',
    icon: Rocket,
    color: '#00EF8B',
  },
  {
    title: 'Connect Your Wallet',
    subtitle: 'Establish Your Secure Link',
    description: 'Connect your Flow Wallet to get started. Flow Sentinel uses your wallet for authentication and transaction signing. Your private keys never leave your device.',
    icon: Wallet,
    color: '#37DDDF',
  },
  {
    title: 'Choose a Strategy',
    subtitle: 'Select Your Risk Profile',
    description: 'Pick from multiple automated strategies — from conservative liquid staking to high-yield farming. Each strategy has a different risk level and expected APY range.',
    icon: Shield,
    color: '#00EF8B',
  },
  {
    title: 'Deploy & Earn',
    subtitle: 'Your Vault Runs Automatically',
    description: 'Deposit FLOW tokens into your vault, and the protocol handles the rest — strategy execution, yield compounding, and MEV protection. Monitor your performance in real-time.',
    icon: Zap,
    color: '#37DDDF',
  },
]

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const step = steps[currentStep]
  const Icon = step.icon

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(30px)' }}
      />

      {/* Modal */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        style={{
          position: 'relative',
          width: '100%', maxWidth: 520,
          borderRadius: 40, border: '1px solid rgba(250,248,245,0.10)',
          background: '#111',
          padding: 48,
          overflow: 'hidden',
          boxShadow: '0 0 100px rgba(0,0,0,0.5)',
        }}
      >
        {/* Glow accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${step.color}, transparent)`,
          opacity: 0.5,
        }} />

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i <= currentStep ? step.color : 'rgba(250,248,245,0.08)',
                transition: 'background 0.5s',
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: `${step.color}15`,
          border: `1px solid ${step.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 32,
        }}>
          <Icon style={{ width: 28, height: 28, color: step.color }} />
        </div>

        {/* Content */}
        <h2 style={{
          fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
          fontSize: '1.75rem', fontWeight: 500, letterSpacing: '-0.02em',
          color: '#FAF8F5', margin: '0 0 8px', textTransform: 'uppercase',
        }}>
          {step.title}
        </h2>
        <p style={{
          fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: step.color, marginBottom: 16,
        }}>
          {step.subtitle}
        </p>
        <p style={{
          fontSize: '0.875rem', lineHeight: 1.7,
          color: 'rgba(250,248,245,0.55)', marginBottom: 40,
        }}>
          {step.description}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handleSkip}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'rgba(250,248,245,0.3)',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(250,248,245,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,248,245,0.3)'}
          >
            Skip Tutorial
          </button>

          <button
            onClick={handleNext}
            className="dash-cta"
            style={{ padding: '14px 28px', fontSize: '0.6875rem' }}
          >
            {currentStep < steps.length - 1 ? (
              <>
                Continue <ArrowRight style={{ width: 14, height: 14 }} />
              </>
            ) : (
              <>
                <Check style={{ width: 14, height: 14 }} />
                Get Started
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
