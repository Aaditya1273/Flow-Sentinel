'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'

interface OracleAPYEntry {
  apy: number
  source: string
  updatedAt: number      // Unix timestamp from on-chain
  confidence: number
}

interface OracleFreshnessBarProps {
  apyData: Record<string, OracleAPYEntry>
  onForceRefresh?: () => void
}

function formatAge(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const STALE_WARN_SECONDS = 6 * 3600   // 6 hours — warn
const STALE_CRIT_SECONDS = 24 * 3600  // 24 hours — critical

export function OracleFreshnessBar({ apyData, onForceRefresh }: OracleFreshnessBarProps) {
  const [now, setNow] = useState(Date.now() / 1000)

  // Tick every 30 seconds so the "X ago" label stays fresh
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() / 1000), 30_000)
    return () => clearInterval(id)
  }, [])

  const entries = Object.entries(apyData)
  if (entries.length === 0) return null

  // Find oldest entry across all strategies
  const oldest = entries.reduce((min, [, v]) => (v.updatedAt < min ? v.updatedAt : min), Infinity)
  const ageSeconds = now - oldest

  const status: 'fresh' | 'warn' | 'stale' =
    ageSeconds < STALE_WARN_SECONDS ? 'fresh' :
    ageSeconds < STALE_CRIT_SECONDS ? 'warn' : 'stale'

  const color = status === 'fresh' ? '#00EF8B' : status === 'warn' ? '#f59e0b' : '#ef4444'
  const StatusIcon = status === 'fresh' ? CheckCircle : AlertTriangle

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderRadius: 12,
        background: `${color}08`,
        border: `1px solid ${color}20`,
        marginBottom: 24,
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusIcon style={{ width: 13, height: 13, color, flexShrink: 0 }} />
        <span style={{ fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color }}>
          Oracle
        </span>
        <span style={{ fontSize: '0.5625rem', fontWeight: 500, color: 'rgba(250,248,245,0.5)' }}>
          {status === 'fresh' ? `Updated ${formatAge(ageSeconds)}` :
           status === 'warn' ? `Data aging — last update ${formatAge(ageSeconds)}` :
           `⚠ Stale data — last update ${formatAge(ageSeconds)}`}
        </span>

        {/* Per-strategy APY pills */}
        <div style={{ display: 'flex', gap: 6, marginLeft: 8, flexWrap: 'wrap' }}>
          {entries.slice(0, 4).map(([id, v]) => (
            <span
              key={id}
              title={`Source: ${v.source} | Confidence: ${(v.confidence * 100).toFixed(0)}%`}
              style={{
                padding: '2px 8px', borderRadius: 20,
                background: 'rgba(250,248,245,0.05)',
                border: '1px solid rgba(250,248,245,0.08)',
                fontSize: '0.5rem', fontWeight: 600,
                color: '#FAF8F5', letterSpacing: '0.08em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {id.replace('liquid-staking-pro', 'LS').replace('defi-yield-maximizer', 'DFY').replace('arbitrage-hunter', 'ARB').replace('high-yield-farming', 'HYF')}
              {' '}
              <span style={{ color }}>{v.apy.toFixed(2)}%</span>
            </span>
          ))}
        </div>
      </div>

      {/* Staleness warning + force refresh */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {status !== 'fresh' && (
          <span style={{
            padding: '3px 8px', borderRadius: 9999,
            background: `${color}14`,
            border: `1px solid ${color}30`,
            fontSize: '0.5rem', fontWeight: 700,
            letterSpacing: '0.1em', color,
            textTransform: 'uppercase',
          }}>
            {status === 'warn' ? 'AGING' : 'STALE'}
          </span>
        )}
        {onForceRefresh && (
          <button
            onClick={onForceRefresh}
            title="Force oracle refresh"
            aria-label="Force oracle data refresh"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(250,248,245,0.35)', padding: 2, transition: 'color 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FAF8F5' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(250,248,245,0.35)' }}
          >
            <RefreshCw style={{ width: 12, height: 12 }} />
          </button>
        )}
      </div>
    </motion.div>
  )
}
