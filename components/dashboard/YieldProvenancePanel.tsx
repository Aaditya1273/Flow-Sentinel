'use client'

import { motion } from 'framer-motion'
import { Shield, ShieldCheck, ExternalLink, AlertTriangle, Info } from 'lucide-react'

export interface ProvenanceData {
  protocolName: string
  protocolAddress: string
  methodology: string
  methodologyUrl: string
  verified: boolean
  riskScore: number
  updatedAt: number
}

interface YieldProvenancePanelProps {
  provenance: ProvenanceData
  apy: number
  source: string
  confidence: number
  compact?: boolean
}

const RISK_LABELS: Record<string, { label: string; color: string }> = {
  'epoch-rewards': { label: 'On-Chain Rewards', color: '#00EF8B' },
  'lending-pool-apy': { label: 'Lending Pool APY', color: '#37DDDF' },
  'multi-protocol': { label: 'Aggregated Sources', color: '#f59e0b' },
  'aggregated': { label: 'Aggregated', color: '#f59e0b' },
  'dex-lp': { label: 'DEX LP Fees', color: '#8b5cf6' },
}

function getRiskColor(score: number): string {
  if (score < 0.2) return '#00EF8B'
  if (score < 0.4) return '#37DDDF'
  if (score < 0.6) return '#f59e0b'
  return '#ef4444'
}

function getRiskLabel(score: number): string {
  if (score < 0.2) return 'Very Low'
  if (score < 0.4) return 'Low'
  if (score < 0.6) return 'Moderate'
  if (score < 0.8) return 'High'
  return 'Very High'
}

function getMethodologyLabel(methodology: string): string {
  return RISK_LABELS[methodology]?.label ?? methodology.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getMethodologyColor(methodology: string): string {
  return RISK_LABELS[methodology]?.color ?? '#FAF8F5'
}

function trimAddress(addr: string): string {
  if (!addr) return ''
  return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr
}

export function YieldProvenancePanel({ provenance, apy, source, confidence, compact }: YieldProvenancePanelProps) {
  const riskColor = getRiskColor(provenance.riskScore)
  const methodologyColor = getMethodologyColor(provenance.methodology)

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {/* Verified badge */}
        {provenance.verified ? (
          <span
            title="Verified yield source"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '2px 8px', borderRadius: 20,
              background: 'rgba(0,239,139,0.10)', border: '1px solid rgba(0,239,139,0.20)',
              fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.08em',
              color: '#00EF8B',
            }}
          >
            <ShieldCheck style={{ width: 8, height: 8 }} />
            VERIFIED
          </span>
        ) : (
          <span
            title="Unverified yield source — review methodology"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '2px 8px', borderRadius: 20,
              background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.20)',
              fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.08em',
              color: '#f59e0b',
            }}
          >
            <AlertTriangle style={{ width: 8, height: 8 }} />
            UNVERIFIED
          </span>
        )}

        {/* Protocol name */}
        <span style={{
          fontSize: '0.5rem', fontWeight: 600, color: '#FAF8F5',
          letterSpacing: '0.06em',
        }}>
          {provenance.protocolName}
        </span>

        {/* Methodology */}
        <span style={{
          padding: '2px 8px', borderRadius: 20,
          background: `${methodologyColor}10`,
          border: `1px solid ${methodologyColor}25`,
          fontSize: '0.4375rem', fontWeight: 600, color: methodologyColor,
          letterSpacing: '0.06em',
        }}>
          {getMethodologyLabel(provenance.methodology)}
        </span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: 20, borderRadius: 16,
        background: 'rgba(250,248,245,0.02)',
        border: '1px solid rgba(250,248,245,0.06)',
        fontFamily: 'var(--font-authority), "Host Grotesk", sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield style={{ width: 14, height: 14, color: provenance.verified ? '#00EF8B' : '#f59e0b' }} />
          <span style={{
            fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'rgba(250,248,245,0.5)',
          }}>
            Yield Provenance
          </span>
        </div>
        {provenance.verified ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.08em',
            color: '#00EF8B', padding: '3px 10px', borderRadius: 9999,
            background: 'rgba(0,239,139,0.08)', border: '1px solid rgba(0,239,139,0.20)',
          }}>
            <ShieldCheck style={{ width: 10, height: 10 }} />
            SOURCE VERIFIED
          </span>
        ) : (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.08em',
            color: '#f59e0b', padding: '3px 10px', borderRadius: 9999,
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)',
          }}>
            <Info style={{ width: 10, height: 10 }} />
            UNVERIFIED
          </span>
        )}
      </div>

      {/* Protocol Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left column: Protocol identity */}
        <div>
          <div style={{ fontSize: '0.5rem', fontWeight: 700, color: 'rgba(250,248,245,0.35)', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>
            Protocol
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FAF8F5', marginBottom: 4 }}>
            {provenance.protocolName}
          </div>
          <a
            href={`https://testnet.flowscan.org/account/${provenance.protocolAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: '0.5rem', fontWeight: 500, color: 'rgba(250,248,245,0.45)',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FAF8F5' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(250,248,245,0.45)' }}
          >
            {trimAddress(provenance.protocolAddress)}
            <ExternalLink style={{ width: 10, height: 10 }} />
          </a>
        </div>

        {/* Right column: Methodology + Risk */}
        <div>
          <div style={{ fontSize: '0.5rem', fontWeight: 700, color: 'rgba(250,248,245,0.35)', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>
            Methodology
          </div>
          <div style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 9999,
            background: `${methodologyColor}10`, border: `1px solid ${methodologyColor}25`,
            fontSize: '0.5625rem', fontWeight: 600, color: methodologyColor,
            letterSpacing: '0.06em', marginBottom: 8,
          }}>
            {getMethodologyLabel(provenance.methodology)}
          </div>
          {provenance.methodologyUrl && (
            <a
              href={provenance.methodologyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', fontSize: '0.5rem', fontWeight: 500,
                color: 'rgba(250,248,245,0.45)', textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FAF8F5' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(250,248,245,0.45)' }}
            >
              Read methodology docs →
            </a>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 24,
        marginTop: 16, paddingTop: 16,
        borderTop: '1px solid rgba(250,248,245,0.06)',
      }}>
        {/* Risk Score */}
        <div>
          <div style={{ fontSize: '0.4375rem', fontWeight: 700, color: 'rgba(250,248,245,0.35)', letterSpacing: '0.1em', marginBottom: 4, textTransform: 'uppercase' }}>
            Risk Score
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: riskColor, flexShrink: 0,
            }} />
            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: riskColor, letterSpacing: '0.05em' }}>
              {getRiskLabel(provenance.riskScore)} ({(provenance.riskScore * 100).toFixed(0)})
            </span>
          </div>
        </div>

        {/* Confidence */}
        <div>
          <div style={{ fontSize: '0.4375rem', fontWeight: 700, color: 'rgba(250,248,245,0.35)', letterSpacing: '0.1em', marginBottom: 4, textTransform: 'uppercase' }}>
            Confidence
          </div>
          <span style={{ fontSize: '0.625rem', fontWeight: 600, color: confidence >= 0.9 ? '#00EF8B' : confidence >= 0.7 ? '#f59e0b' : '#ef4444', letterSpacing: '0.05em' }}>
            {(confidence * 100).toFixed(0)}%
          </span>
        </div>

        {/* Current APY */}
        <div>
          <div style={{ fontSize: '0.4375rem', fontWeight: 700, color: 'rgba(250,248,245,0.35)', letterSpacing: '0.1em', marginBottom: 4, textTransform: 'uppercase' }}>
            Current APY
          </div>
          <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#00EF8B', letterSpacing: '0.05em' }}>
            {apy.toFixed(2)}%
          </span>
        </div>

        {/* Source */}
        <div>
          <div style={{ fontSize: '0.4375rem', fontWeight: 700, color: 'rgba(250,248,245,0.35)', letterSpacing: '0.1em', marginBottom: 4, textTransform: 'uppercase' }}>
            Data Feed
          </div>
          <span style={{ fontSize: '0.625rem', fontWeight: 500, color: 'rgba(250,248,245,0.6)', letterSpacing: '0.05em' }}>
            {source}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
