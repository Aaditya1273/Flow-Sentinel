'use client'

import { motion } from 'framer-motion'
import { Shield, ShieldOff, AlertTriangle, Clock, DollarSign, Ban, Activity } from 'lucide-react'

interface StrategyStatus {
  isActive: boolean
  name: string
}

interface OracleStaleness {
  age: number
  isFresh: boolean
  updatedAt: number
}

interface CircuitBreakerData {
  globalPaused: boolean
  maxVaultBalanceCap: number
  maxDepositPerBlock: number
  maxSlippageHardCapBps: number
  oracleStaleThresholdSeconds: number
  strategies: Record<string, StrategyStatus>
  oracleStaleness: Record<string, OracleStaleness>
}

interface CircuitBreakerStatusProps {
  data: CircuitBreakerData | null
  loading?: boolean
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

function StatusBadge({ active, label, activeLabel, inactiveLabel }: {
  active: boolean
  label: string
  activeLabel?: string
  inactiveLabel?: string
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', borderRadius: 12,
      background: active ? 'rgba(0,239,139,0.04)' : 'rgba(239,68,68,0.04)',
      border: `1px solid ${active ? 'rgba(0,239,139,0.15)' : 'rgba(239,68,68,0.15)'}`,
    }}>
      <span style={{ fontSize: '0.5625rem', fontWeight: 600, color: 'rgba(250,248,245,0.6)', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.08em',
        padding: '3px 8px', borderRadius: 9999,
        color: active ? '#00EF8B' : '#ef4444',
        background: active ? 'rgba(0,239,139,0.10)' : 'rgba(239,68,68,0.10)',
        border: `1px solid ${active ? 'rgba(0,239,139,0.20)' : 'rgba(239,68,68,0.20)'}`,
      }}>
        {active ? (activeLabel || 'ACTIVE') : (inactiveLabel || 'DISABLED')}
      </span>
    </div>
  )
}

export function CircuitBreakerStatus({ data, loading }: CircuitBreakerStatusProps) {
  if (loading || !data) {
    return (
      <div className="dash-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Shield style={{ width: 16, height: 16, color: '#00EF8B' }} />
          <span className="dash-label">CIRCUIT BREAKERS</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(250,248,245,0.3)', textAlign: 'center', padding: '20px 0' }}>
          {loading ? 'Loading circuit breaker status...' : 'No data available'}
        </div>
      </div>
    )
  }

  const hasStaleOracle = Object.values(data.oracleStaleness || {}).some(s => !s.isFresh)
  const hasKilledStrategy = Object.values(data.strategies || {}).some(s => !s.isActive)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="dash-card"
      style={{ padding: 24 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {data.globalPaused ? (
            <ShieldOff style={{ width: 16, height: 16, color: '#ef4444' }} />
          ) : (
            <Shield style={{ width: 16, height: 16, color: '#00EF8B' }} />
          )}
          <span className="dash-label" style={{ color: data.globalPaused ? '#ef4444' : '#FAF8F5' }}>
            CIRCUIT BREAKERS
          </span>
        </div>
        {data.globalPaused && (
          <span style={{
            padding: '3px 10px', borderRadius: 9999,
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
            fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em',
            color: '#ef4444', textTransform: 'uppercase',
            animation: 'pulse 1.5s infinite',
          }}>
            GLOBAL PAUSED
          </span>
        )}
      </div>

      {/* Status indicators */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {/* Global pause */}
        <StatusBadge
          active={!data.globalPaused}
          label="Global Circuit Breaker"
          inactiveLabel="PAUSED"
        />

        {/* Strategy kill switches */}
        {Object.entries(data.strategies || {}).map(([id, s]) => (
          <StatusBadge
            key={id}
            active={s.isActive}
            label={`Strategy: ${s.name}`}
            inactiveLabel="KILLED"
          />
        ))}

        {/* Oracle staleness */}
        <StatusBadge
          active={!hasStaleOracle}
          label="Oracle Data Freshness"
          activeLabel="FRESH"
          inactiveLabel="STALE"
        />

        {/* Deposit caps */}
        <StatusBadge
          active={true}
          label={`Max Deposit: ${(data.maxDepositPerBlock || 0).toFixed(0)} FLOW`}
          activeLabel="CAP"
        />

        {/* Max balance cap */}
        <StatusBadge
          active={true}
          label={`Vault Cap: ${(data.maxVaultBalanceCap || 0).toFixed(0)} FLOW`}
          activeLabel="CAP"
        />

        {/* Hard slippage cap */}
        <StatusBadge
          active={true}
          label={`Max Slippage: ${((data.maxSlippageHardCapBps || 0) / 100).toFixed(0)}%`}
          activeLabel="HARD CAP"
        />
      </div>

      {/* Oracle staleness details */}
      {data.oracleStaleness && Object.keys(data.oracleStaleness).length > 0 && (
        <div style={{
          padding: '12px 14px', borderRadius: 12,
          background: hasStaleOracle ? 'rgba(245,158,11,0.04)' : 'rgba(250,248,245,0.02)',
          border: `1px solid ${hasStaleOracle ? 'rgba(245,158,11,0.15)' : 'rgba(250,248,245,0.06)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Clock style={{ width: 12, height: 12, color: hasStaleOracle ? '#f59e0b' : 'rgba(250,248,245,0.4)' }} />
            <span style={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(250,248,245,0.4)', textTransform: 'uppercase' }}>
              Oracle Freshness
            </span>
          </div>
          {Object.entries(data.oracleStaleness).map(([id, s]) => (
            <div key={id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: '1px solid rgba(250,248,245,0.04)',
            }}>
              <span style={{ fontSize: '0.5625rem', fontWeight: 600, color: '#FAF8F5' }}>
                {id.replace('liquid-staking-pro', 'Liquid Staking').replace('defi-yield-maximizer', 'Yield Farming')}
              </span>
              <span style={{
                fontSize: '0.5rem', fontWeight: 600,
                color: s.isFresh ? '#00EF8B' : '#f59e0b',
                letterSpacing: '0.06em',
              }}>
                {s.isFresh ? `Fresh (${formatDuration(s.age)} old)` : `⚠ STALE (${formatDuration(s.age)} old)`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Warning banner if any breakers triggered */}
      {(data.globalPaused || hasKilledStrategy || hasStaleOracle) && (
        <div style={{
          marginTop: 16, padding: '10px 14px', borderRadius: 12,
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <AlertTriangle style={{ width: 14, height: 14, color: '#ef4444', flexShrink: 0 }} />
          <span style={{ fontSize: '0.5rem', fontWeight: 600, color: '#ef4444', lineHeight: 1.5 }}>
            {data.globalPaused ? 'Global circuit breaker is ACTIVE — all vault operations halted.' :
             hasKilledStrategy ? 'One or more strategies have been killed. Some vaults cannot execute.' :
             'Oracle data is stale — strategy execution may be blocked.'}
          </span>
        </div>
      )}
    </motion.div>
  )
}
