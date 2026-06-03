'use client'

import { ReactNode } from 'react'
import { Providers } from 'app/providers'
import { OnboardingWrapper } from './OnboardingWrapper'

export function ProvidersWrapper({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <OnboardingWrapper>
        {children}
      </OnboardingWrapper>
    </Providers>
  )
}
