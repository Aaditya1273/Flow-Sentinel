'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, TrendingUp, Zap, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { formatCurrency } from 'lib/utils'
import type { ProtocolStats } from 'hooks/useVaultData'
import { FlowService } from 'lib/flow-service'
import { useTransactions } from 'lib/transactions'
import { errorReporter } from '@/lib/sentry-wrapper'

interface ReserveHealthWidgetProps {
  stats: ProtocolStats
  onFunded?: () => void
}

// Threshold values matching SentinelVaultV2.cdc getProtocolStats()
const CRITICAL_THRESHOLD = 10
const WARNING_THRESHOLD = 100

function ReserveStatusIcon({ status }: { status: ProtocolStats['reserveStatus'] }) {
  if (status === 'HEALTHY') return <CheckCircle style={{ width: 16, height: 16, color: '#00EF8B' }} />
  if (status === 'WARNING') return <AlertTriangle style={{ width: 16, height: 16, color: '#f59e0b' }} />
  return <XCircle style={{ width: 16, height: 16, color: '#ef4444' }} />
}

function statusColor(status: ProtocolStats['reserveStatus']): string {
  if (status === 'HEALTHY') return '#00EF8B'
  if (status === 'WARNING') return '#f59e0b'
  return '#ef4444'
}

function statusBg(status: ProtocolStats['reserveStatus']): string {
  if (status === 'HEALTHY') return 'rgba(0,239,139,0.08)'
  if (status === 'WARNING') return 'rgba(245,158,11,0.08)'
  return 'rgba(239,68,68,0.08)'
}

function statusBorder(status: ProtocolStats['reserveStatus']): string {
  if (status === 'HEALTHY') return 'rgba(0,239,139,0.20)'
  if (status === 'WARNING') return 'rgba(245,158,11,0.20)'
  return 'rgba(239,68,68,0.20)'
}

// Reserve fill bar — shows how full the reserve is relative to a "comfortable" level (500 FLOW)
function ReserveFillBar({ balance, status }: { balance: number; status: ProtocolStats['reserveStatus'] }) {
  const comfortable = 500
  const pct = Math.min(100, (balance / comfortable) * 100)
  return (
    <div style={{ height: 6, borderRadius: 3, background: 'rgba(250,248,245,0.06)', overflow: 'hidden', marginTop: 8 }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ height: '100%', borderRadius: 3, background: statusColor(status) }}
      />
    </div>
  )
}

export function ReserveHealthWidget({ stats, onFunded }: ReserveHealthWidgetProps) {
  const [expanded, setExpanded] = useState(false)
  const [fundAmount, setFundAmount] = useState('50')
  const [funding, setFunding] = useState(false)
  const { setTxState } = useTransactions()

  const handleFund = async () => {
    const amount = parseFloat(fundAmount)
    if (!amount || amount < 1) return
    try {
      setFunding(true)
      setTxState({ status: 'executing', txId: null, error: null, title: 'Funding Reserve' })
      const { transactionId, sealed } = await FlowService.fundYieldReserve(amount)
      setTxState({ status: 'submitting', txId: transactionId, error: null, title: 'Funding Reserve' })
      await sealed
      setTxState({ status: 'sealed', txId: transactionId, error: null, title: 'Reserve Funded' })
      onFunded?.()
    } catch (err) {
      errorReporter.captureException(err, { component: 'ReserveHealthWidget', action: 'fundReserve' })
      setTxState({ status: 'error', txId: null, error: err instanceof Error ? err.message : 'Fund failed', title: 'Fund Failed' })
    } finally {
      setFunding(false)
    }
  }

  return (
    <div style={{
      borderRadius: 24, padding: 24,
      border: `1px solid ${statusBorder(stats.reserveStatus)}`,
      background: statusBg(stats.reserveStatus),
      transition: 'all 0.3s',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ReserveStatusIcon status={stats.reserveStatus} />
          <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: statusColor(stats.reserveStatus) }}>
            Yield Reserve
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '3px 10px', borderRadius: 9999, fontSize: '0.5rem', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: statusColor(stats.reserveStatus),
            background: `${statusColor(stats.reserveStatus)}18`,
            border: `1px solid ${statusColor(stats.reserveStatus)}30`,
          }}>
            {stats.reserveStatus}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Collapse reserve details' : 'Expand reserve details'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(250,248,245,0.4)', padding: 2 }}
          >
            {expanded ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
          </button>
        </div>
      </div>

      {/* Reserve balance */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 500, color: '#FAF8F5', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
          {stats.yieldReserveBalance.toFixed(4)} <span style={{ fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)' }}>FLOW</span>
        </div>
        <div style={{ fontSize: '0.5625rem', fontWeight: 500, color: 'rgba(250,248,245,0.4)', letterSpacing: '0.08em', marginTop: 2 }}>
          Available to distribute as yield
        </div>
      </div>

      <ReserveFillBar balance={stats.yieldReserveBalance} status={stats.reserveStatus} />

      {/* Status message */}
      {stats.reserveStatus === 'CRITICAL' && (
        <div style={{ marginTop: 12, fontSize: '0.6875rem', color: '#ef4444', fontWeight: 500, lineHeight: 1.5 }}>
          Reserve critically low — yield claims will fail until funded.
        </div>
      )}
      {stats.reserveStatus === 'WARNING' && (
        <div style={{ marginTop: 12, fontSize: '0.6875rem', color: '#f59e0b', fontWeight: 500, lineHeight: 1.5 }}>
          Reserve below 100 FLOW — consider topping up to ensure uninterrupted yield.
        </div>
      )}

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 20, borderTop: '1px solid rgba(250,248,245,0.06)', marginTop: 16 }}>
              {/* Protocol stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total Yield Paid', value: `${stats.totalYieldDistributed.toFixed(4)} FLOW` },
                  { label: 'Fees Collected', value: `${stats.totalFeesCollected.toFixed(4)} FLOW` },
                  { label: 'Protocol Fee', value: `${stats.protocolFeeRateBps} bps (0.1%)` },
                  { label: 'Total Vaults', value: stats.totalVaults.toString() },
                  { label: 'MEV Protections', value: stats.mevTotalProtections.toLocaleString() },
                  { label: 'Pending Exec.', value: stats.mevPendingExecutions.toString() },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.06)' }}>
                    <div style={{ fontSize: '0.5rem', color: 'rgba(250,248,245,0.4)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#FAF8F5', fontVariantNumeric: 'tabular-nums' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Fund reserve form */}
              <div style={{ borderTop: '1px solid rgba(250,248,245,0.06)', paddingTop: 16 }}>
                <div style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(250,248,245,0.55)', marginBottom: 12 }}>
                  Top Up Reserve
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="number"
                    value={fundAmount}
                    min="1"
                    step="10"
                    onChange={e => setFundAmount(e.target.value)}
                    className="dash-input"
                    style={{ flex: 1, padding: '10px 14px', fontSize: '0.875rem' }}
                    placeholder="Amount (FLOW)"
                    aria-label="Amount to fund yield reserve"
                  />
                  <button
                    onClick={handleFund}
                    disabled={funding || parseFloat(fundAmount) < 1}
                    className="dash-cta"
                    style={{ padding: '10px 20px', fontSize: '0.625rem', flexShrink: 0,
                      ...(stats.reserveStatus !== 'HEALTHY' ? { boxShadow: `0 4px 20px ${statusColor(stats.reserveStatus)}30` } : {})
                    }}
                    aria-label={`Fund yield reserve with ${fundAmount} FLOW`}
                  >
                    {funding ? (
                      <span style={{ width: 14, height: 14, border: '2px solid rgba(0,239,139,0.3)', borderTopColor: '#00EF8B', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    ) : (
                      <><Zap style={{ width: 12, height: 12 }} /> Fund</>
                    )}
                  </button>
                </div>
                <div style={{ marginTop: 8, fontSize: '0.5625rem', color: 'rgba(250,248,245,0.3)', lineHeight: 1.5 }}>
                  Auto-fee (0.1% per deposit) + manual top-ups keep the reserve funded. Min 1 FLOW.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
