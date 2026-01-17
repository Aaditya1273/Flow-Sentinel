import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B'
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M'
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K'
  }
  return num.toFixed(decimals)
}

export function formatCurrency(amount: number, currency: string = 'FLOW'): string {
  return `${formatNumber(amount)} ${currency}`
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function truncateAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function calculateAPY(principal: number, earned: number, days: number): number {
  if (principal === 0 || days === 0) return 0
  const dailyRate = earned / principal / days
  return ((1 + dailyRate) ** 365 - 1) * 100
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}