'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useOnboarding } from 'hooks/useOnboarding'
import { useFlow } from 'lib/flow'
import { OnboardingFlow } from 'components/onboarding/OnboardingFlow'

export function OnboardingWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { isConnected } = useFlow()
  const { showOnboarding, loading, completeOnboarding } = useOnboarding()

  // Only show onboarding on the dashboard page when wallet is connected
  const shouldShow = showOnboarding && isConnected && pathname === '/dashboard'

  if (loading) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      {shouldShow && <OnboardingFlow onComplete={completeOnboarding} />}
    </>
  )
}
