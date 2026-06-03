'use client'

import { useState, useEffect, useCallback } from 'react'

const ONBOARDING_STORAGE_KEY = 'sen_onboarding_complete'
const ONBOARDING_VERSION = 1

interface OnboardingState {
  complete: boolean
  version: number
  completedAt?: string
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY)
      if (stored) {
        const state: OnboardingState = JSON.parse(stored)
        if (state.complete && state.version === ONBOARDING_VERSION) {
          setShowOnboarding(false)
          setLoading(false)
          return
        }
      }
      // Not completed or version mismatch — show onboarding
      setShowOnboarding(true)
    } catch {
      setShowOnboarding(true)
    }
    setLoading(false)
  }, [])

  const completeOnboarding = useCallback(() => {
    const state: OnboardingState = {
      complete: true,
      version: ONBOARDING_VERSION,
      completedAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Silently fail — onboarding is non-critical
    }
    setShowOnboarding(false)
  }, [])

  const resetOnboarding = useCallback(() => {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    } catch {
      // Silently fail
    }
    setShowOnboarding(true)
  }, [])

  return {
    showOnboarding,
    loading,
    completeOnboarding,
    resetOnboarding,
  }
}
