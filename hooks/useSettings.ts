// hooks/useSettings.ts — Phase 6: settings persistence via Supabase API
// Replaces localStorage-only settings with real server-side persistence.
// Falls back to localStorage gracefully when Supabase is not configured.

import { useState, useEffect, useCallback } from 'react'
import { useFlow } from 'lib/flow'
import { getAuthHeaders } from 'lib/wallet-auth'

export interface AppSettings {
  profile: {
    displayName: string
    email: string
    timezone: string
    language: string
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
    autoLogout: boolean
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    vaultAlerts: boolean
    performanceReports: boolean
    securityAlerts: boolean
    marketingEmails: boolean
  }
  appearance: {
    theme: string
    accentColor: string
    compactMode: boolean
    animations: boolean
  }
}

const DEFAULT_SETTINGS: AppSettings = {
  profile: { displayName: '', email: '', timezone: 'UTC', language: 'en' },
  security: { twoFactorEnabled: false, sessionTimeout: 30, autoLogout: true },
  notifications: {
    emailNotifications: true, pushNotifications: true, vaultAlerts: true,
    performanceReports: true, securityAlerts: true, marketingEmails: false,
  },
  appearance: { theme: 'dark', accentColor: 'green', compactMode: false, animations: true },
}

const STORAGE_KEY = 'sen_settings'
const SUPABASE_CONFIGURED = !!process.env.NEXT_PUBLIC_SUPABASE_URL

export function useSettings() {
  const { user } = useFlow()
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load settings — try Supabase first, fall back to localStorage
  const loadSettings = useCallback(async () => {
    if (!user.addr || !user.loggedIn) {
      // Try localStorage fallback for unauthenticated state
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) setSettings(prev => ({ ...prev, ...JSON.parse(stored) }))
      } catch { /* ignore */ }
      return
    }

    setLoading(true)
    setError(null)
    try {
      if (SUPABASE_CONFIGURED) {
        const headers = await getAuthHeaders(user.addr)
        const res = await fetch('/api/settings', { headers })
        if (res.ok) {
          const data = await res.json()
          // Map Supabase shape → app settings shape
          setSettings({
            profile: {
              displayName: data.profile?.display_name ?? '',
              email: data.profile?.email ?? '',
              timezone: data.profile?.timezone ?? 'UTC',
              language: data.profile?.language ?? 'en',
            },
            security: settings.security, // security settings stay local
            notifications: {
              emailNotifications: data.notifications?.email_notifications ?? true,
              pushNotifications: data.notifications?.push_notifications ?? true,
              vaultAlerts: data.notifications?.vault_alerts ?? true,
              performanceReports: data.notifications?.performance_reports ?? true,
              securityAlerts: data.notifications?.security_alerts ?? true,
              marketingEmails: data.notifications?.marketing_emails ?? false,
            },
            appearance: settings.appearance,
          })
          return
        }
      }
      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSettings(prev => ({ ...prev, ...JSON.parse(stored) }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
      // Fallback to localStorage on error
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) setSettings(prev => ({ ...prev, ...JSON.parse(stored) }))
      } catch { /* ignore */ }
    } finally {
      setLoading(false)
    }
  }, [user.addr, user.loggedIn]) // eslint-disable-line react-hooks/exhaustive-deps

  // Save settings — to Supabase if configured, always to localStorage as backup
  const saveSettings = useCallback(async (newSettings: AppSettings) => {
    setSaving(true)
    setError(null)
    try {
      // Always save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))

      if (SUPABASE_CONFIGURED && user.addr && user.loggedIn) {
        const headers = await getAuthHeaders(user.addr)
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            profile: {
              display_name: newSettings.profile.displayName,
              email: newSettings.profile.email || null,
              timezone: newSettings.profile.timezone,
              language: newSettings.profile.language,
            },
            notifications: {
              email_notifications: newSettings.notifications.emailNotifications,
              push_notifications: newSettings.notifications.pushNotifications,
              vault_alerts: newSettings.notifications.vaultAlerts,
              performance_reports: newSettings.notifications.performanceReports,
              security_alerts: newSettings.notifications.securityAlerts,
              marketing_emails: newSettings.notifications.marketingEmails,
            },
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error ?? 'Save failed')
        }
      }

      setSettings(newSettings)
      setLastSaved(new Date())
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
      return false
    } finally {
      setSaving(false)
    }
  }, [user.addr, user.loggedIn])

  // Delete account — wipes all Supabase data
  const deleteAccount = useCallback(async (): Promise<boolean> => {
    if (!user.addr || !user.loggedIn || !SUPABASE_CONFIGURED) {
      localStorage.removeItem(STORAGE_KEY)
      return true
    }
    try {
      const headers = await getAuthHeaders(user.addr)
      const res = await fetch('/api/settings', { method: 'DELETE', headers })
      if (!res.ok) throw new Error('Delete failed')
      localStorage.removeItem(STORAGE_KEY)
      setSettings(DEFAULT_SETTINGS)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      return false
    }
  }, [user.addr, user.loggedIn])

  // Export data as CSV download
  const exportData = useCallback(async () => {
    if (!user.addr || !user.loggedIn || !SUPABASE_CONFIGURED) {
      // Fallback: export localStorage settings as JSON
      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url
      a.download = `flow-sentinel-settings.json`; a.click()
      URL.revokeObjectURL(url)
      return
    }
    try {
      const headers = await getAuthHeaders(user.addr)
      const res = await fetch('/api/export-data', { headers })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url
      a.download = `flow-sentinel-export-${user.addr.slice(0, 8)}.csv`; a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    }
  }, [user.addr, user.loggedIn, settings])

  useEffect(() => { loadSettings() }, [user.addr, user.loggedIn]) // eslint-disable-line react-hooks/exhaustive-deps

  return { settings, setSettings, saveSettings, deleteAccount, exportData, loading, saving, error, lastSaved }
}
