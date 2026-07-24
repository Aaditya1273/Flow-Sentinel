// ── Analytics Pure Functions ──
// Pure data transformations extracted from flow-service.ts.
// These don't touch the blockchain — they process already-fetched data.

export interface VaultEvent {
  type: 'deposit' | 'withdraw' | 'created'
  vaultId: string
  amount: number
  timestamp: number
  blockHeight: number
}

// Calculate vault age in days based on first event
export function getVaultAgeInDays(events: VaultEvent[]): number {
  if (events.length === 0) return 0
  const firstEventTime = events[0].timestamp * 1000
  const now = Date.now()
  return (now - firstEventTime) / (1000 * 60 * 60 * 24)
}

// Build performance history from events
export function buildPerformanceHistory(events: VaultEvent[], currentBalance: number): PerformanceDataPoint[] {
  if (events.length === 0) return []

  const history: PerformanceDataPoint[] = []
  let runningBalance = 0
  let totalDeposited = 0

  for (const event of events) {
    if (event.type === 'deposit' || event.type === 'created') {
      runningBalance += event.amount
      totalDeposited += event.amount
    } else if (event.type === 'withdraw') {
      runningBalance -= event.amount
      totalDeposited -= event.amount
    }
    history.push({
      timestamp: event.timestamp,
      balance: runningBalance,
      cumulativePnl: runningBalance - totalDeposited,
    })
  }

  history.push({
    timestamp: Date.now() / 1000,
    balance: currentBalance,
    cumulativePnl: currentBalance - totalDeposited,
  })

  return history
}

// Check if enough data is available for the selected timeframe
export function hasEnoughDataForTimeframe(vaultAgeDays: number, timeframe: string): boolean {
  const requiredDays: Record<string, number> = {
    '1d': 1, '7d': 7, '30d': 30, '90d': 90, '1y': 365, 'all': 0,
  }
  return vaultAgeDays >= (requiredDays[timeframe] || 0)
}

// Get remaining time needed for timeframe
export function getRemainingTimeForTimeframe(vaultAgeDays: number, timeframe: string): string {
  const requiredDays: Record<string, number> = {
    '1d': 1, '7d': 7, '30d': 30, '90d': 90, '1y': 365,
  }
  const required = requiredDays[timeframe] || 0
  const remaining = required - vaultAgeDays
  if (remaining <= 0) return ''
  if (remaining < 1) {
    const hours = Math.ceil(remaining * 24)
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  const days = Math.ceil(remaining)
  return `${days} day${days !== 1 ? 's' : ''}`
}

export interface PerformanceDataPoint {
  timestamp: number
  balance: number
  cumulativePnl: number
}
