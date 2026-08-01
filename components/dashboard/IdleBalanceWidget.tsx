'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  TrendingUp,
  Zap,
  RotateCcw,
  ChevronDown,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { formatCurrency, formatPercentage } from 'lib/utils'

interface IdleBalanceWidgetProps {
  flowBalance: number
  hasVaults: boolean
  vaultBalance?: number
  vaultApy?: number
  vaultYieldAccrued?: number
  vaultId?: string
  vaultName?: string
  onActivate: () => void
  onRefresh: () => void
}

export function IdleBalanceWidget({
  flowBalance,
  hasVaults,
  vaultBalance,
  vaultApy,
  vaultYieldAccrued,
  vaultId,
  vaultName,
  onActivate,
  onRefresh,
}: IdleBalanceWidgetProps) {
  const [isEarning, setIsEarning] = useState(hasVaults && (vaultBalance ?? 0) > 0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Sync earning state with props (e.g., after parent creates vault and refetches)
  useEffect(() => {
    setIsEarning(hasVaults && (vaultBalance ?? 0) > 0)
  }, [hasVaults, vaultBalance])

  const handleToggleEarning = () => {
    if (isEarning) {
      setIsExpanded(!isExpanded)
    } else {
      onActivate()
    }
  }

  // Projected earnings
  // No APY is displayed until a real audited adapter produces an on-chain position.
  const apyRate = 0
  const earningBalance = vaultBalance ?? flowBalance
  const dailyYield = earningBalance * (apyRate / 365)
  const monthlyYield = dailyYield * 30
  const yearlyYield = dailyYield * 365
  const totalEarned = vaultYieldAccrued ?? 0
  const displayBalance = isEarning ? (vaultBalance ?? flowBalance) : flowBalance

  if (!mounted) {
    return (
      <div className="dash-stat" style={{ padding: '28px 32px', minHeight: 160 }}>
        <div className="dash-skeleton" style={{ width: '60%', height: 14, marginBottom: 16 }} />
        <div className="dash-skeleton" style={{ width: '40%', height: 32, marginBottom: 8 }} />
        <div className="dash-skeleton" style={{ width: '30%', height: 12 }} />
      </div>
    )
  }

  return (
    <div
      className="dash-stat"
      style={{
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        background: isEarning
          ? 'linear-gradient(135deg, rgba(0,239,139,0.06) 0%, rgba(17,17,17,0.95) 100%)'
          : undefined,
        border: isEarning
          ? '1px solid rgba(0,239,139,0.15)'
          : flowBalance > 0 && !isEarning
          ? '1px solid rgba(55,221,223,0.15)'
          : undefined,
      }}
    >
      {isEarning && (
        <div
          style={{
            position: 'absolute', top: '-30%', right: '-10%',
            width: '60%', height: '80%',
            background: 'radial-gradient(ellipse at center, rgba(0,239,139,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}

      <div style={{ padding: '28px 32px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isEarning
                  ? 'rgba(0,239,139,0.12)'
                  : flowBalance > 0
                  ? 'rgba(55,221,223,0.10)'
                  : 'rgba(250,248,245,0.04)',
                transition: 'all 0.3s',
              }}
            >
              {isEarning ? (
                <Zap style={{ width: 18, height: 18, color: '#00EF8B' }} />
              ) : (
                <Wallet style={{ width: 18, height: 18, color: flowBalance > 0 ? '#37DDDF' : 'rgba(250,248,245,0.3)' }} />
              )}
            </div>
            <div>
              <div className="dash-label" style={{ fontSize: '0.5rem', letterSpacing: '0.15em' }}>
                {isEarning ? 'EARNING ACTIVE' : flowBalance > 0 ? 'IDLE BALANCE' : 'WALLET BALANCE'}
              </div>
              <div style={{ fontSize: '0.625rem', color: 'rgba(250,248,245,0.35)', marginTop: 2 }}>
                {isEarning ? `custody vault: ${vaultName ?? 'Wallet Vault'}` : 'Yield integrations disabled'}
              </div>
            </div>
          </div>

          {isEarning ? (
            <span
              style={{
                padding: '4px 12px', borderRadius: 9999,
                fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#00EF8B', background: 'rgba(0,239,139,0.10)',
                border: '1px solid rgba(0,239,139,0.2)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#00EF8B', animation: 'pulse 2s infinite' }} />
              COMPOUNDING
            </span>
          ) : flowBalance > 0 ? (
            <span
              style={{
                padding: '4px 12px', borderRadius: 9999,
                fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#37DDDF', background: 'rgba(55,221,223,0.08)',
                border: '1px solid rgba(55,221,223,0.15)',
              }}
            >
              {hasVaults ? 'PARTIAL' : 'PENDING'}
            </span>
          ) : null}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <span className="dash-value" style={{ fontSize: '2rem' }}>
            {formatCurrency(displayBalance)}
          </span>
          <span style={{ fontSize: '0.625rem', fontWeight: 500, color: 'rgba(250,248,245,0.3)', fontFamily: 'monospace' }}>
            FLOW
          </span>
          {isEarning && (
            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#00EF8B', display: 'flex', alignItems: 'center', gap: 3 }}>
              <TrendingUp style={{ width: 12, height: 12 }} />
              No APY
            </span>
          )}
        </div>

        {isEarning && (
          <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
            <ProjectedEarnings label="Daily" value={dailyYield} />
            <ProjectedEarnings label="Monthly" value={monthlyYield} />
            <ProjectedEarnings label="Yearly" value={yearlyYield} />
          </div>
        )}

        {!isEarning && flowBalance > 0 && (
          <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Sparkles style={{ width: 10, height: 10, color: '#37DDDF' }} />
              <span style={{ fontSize: '0.5rem', color: 'rgba(250,248,245,0.3)', fontWeight: 500 }}>
                External yield integrations are disabled
              </span>
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button
            onClick={handleToggleEarning}
            className={isEarning ? undefined : 'dash-cta'}
            style={
              isEarning
                ? {
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 24px', borderRadius: 20,
                    background: 'rgba(0,239,139,0.08)', color: '#00EF8B',
                    border: '1px solid rgba(0,239,139,0.15)',
                    fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }
                : { flex: 1, padding: '14px 24px', fontSize: '0.625rem' }
            }
            onMouseEnter={e => {
              if (isEarning) e.currentTarget.style.background = 'rgba(0,239,139,0.14)'
            }}
            onMouseLeave={e => {
              if (isEarning) e.currentTarget.style.background = 'rgba(0,239,139,0.08)'
            }}
            disabled={!isEarning && flowBalance <= 0}
            aria-label={isEarning ? 'View earning details' : 'Activate earning on idle balance'}
          >
            {isEarning ? (
              <>
                <Zap style={{ width: 14, height: 14 }} />
                {isExpanded ? 'Hide Details' : 'View Details'}
                <ChevronDown style={{ width: 12, height: 12 }} />
              </>
            ) : (
              <>
                <Zap style={{ width: 16, height: 16 }} />
                {flowBalance > 0 ? 'Activate Earning' : 'No Balance to Earn'}
              </>
            )}
          </button>

          {!isEarning && (
            <button
              onClick={onRefresh}
              style={{
                width: 48, height: 48, borderRadius: 20, flexShrink: 0,
                border: '1px solid rgba(250,248,245,0.08)',
                background: 'transparent', color: 'rgba(250,248,245,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(250,248,245,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              aria-label="Refresh balance"
            >
              <RotateCcw style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && isEarning && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ paddingTop: 16, marginTop: 16, borderTop: '1px solid rgba(250,248,245,0.06)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div className="dash-label" style={{ fontSize: '0.4375rem' }}>Yield Earned</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#00EF8B', marginTop: 4 }}>
                      +{totalEarned.toFixed(4)} FLOW
                    </div>
                  </div>
                  <div>
                    <div className="dash-label" style={{ fontSize: '0.4375rem' }}>External APY</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FAF8F5', marginTop: 4 }}>
                      No APY
                    </div>
                  </div>
                  <div>
                    <div className="dash-label" style={{ fontSize: '0.4375rem' }}>Compounding</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#00EF8B', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <RotateCcw style={{ width: 12, height: 12 }} /> Active
                    </div>
                  </div>
                  <div>
                    <div className="dash-label" style={{ fontSize: '0.4375rem' }}>Protection</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FAF8F5', marginTop: 4 }}>
                      Full MEV Shield
                    </div>
                  </div>
                </div>
                {vaultId && (
                  <a
                    href={`https://testnet.flowscan.io/account/${vaultId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      marginTop: 12, display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: '0.5rem', color: 'rgba(250,248,245,0.3)',
                      textDecoration: 'none', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(250,248,245,0.6)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,248,245,0.3)')}
                  >
                    <ExternalLink style={{ width: 10, height: 10 }} />
                    View on Flowscan
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Helper sub-component for projected earnings lines
function ProjectedEarnings({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: '0.5rem', color: 'rgba(250,248,245,0.3)', fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#00EF8B' }}>
        +{value.toFixed(value >= 1 ? 2 : 4)}
      </span>
    </div>
  )
}
