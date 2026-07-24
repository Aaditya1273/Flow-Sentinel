'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  User, Shield, Bell, Palette, Key, Database,
  AlertTriangle, Save, RefreshCw, Download, Upload, Trash2, Eye, EyeOff, CheckCircle2
} from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'
import { useFlow } from 'lib/flow'
import { useTransactions } from 'lib/transactions'
import { useSettings } from 'hooks/useSettings'

const settingsSections = [
  { id: 'profile',       title: 'Profile',           description: 'Account information',          icon: <User className="w-4 h-4" /> },
  { id: 'security',      title: 'Security',           description: 'Wallet & auth settings',       icon: <Shield className="w-4 h-4" /> },
  { id: 'notifications', title: 'Notifications',      description: 'Alerts & preferences',         icon: <Bell className="w-4 h-4" /> },
  { id: 'appearance',    title: 'Appearance',         description: 'Theme & display',              icon: <Palette className="w-4 h-4" /> },
  { id: 'api',           title: 'API & Integrations', description: 'Keys & third-party',           icon: <Key className="w-4 h-4" /> },
  { id: 'data',          title: 'Data & Privacy',     description: 'Export & privacy controls',    icon: <Database className="w-4 h-4" /> },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={checked ? 'Disable' : 'Enable'}
      style={{
        position: 'relative', width: 48, height: 24, borderRadius: 9999,
        transition: 'all 0.3s', border: 'none', cursor: 'pointer',
        background: checked ? '#00EF8B' : 'rgba(250,248,245,0.08)',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: checked ? 26 : 2, width: 20, height: 20,
        borderRadius: '50%', background: '#fff', transition: 'all 0.3s',
      }} />
    </button>
  )
}

export default function SettingsPage() {
  const { user } = useFlow()
  const { setTxState } = useTransactions()
  const { settings, setSettings, saveSettings, deleteAccount, exportData, loading, saving, error, lastSaved } = useSettings()
  const [activeSection, setActiveSection] = useState('profile')
  const [showApiKey, setShowApiKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const saved = !!lastSaved

  const set = useCallback((section: string, key: string, value: string | boolean | number) => {
    setSettings(prev => ({ ...prev, [section]: { ...prev[section as keyof typeof prev], [key]: value } }))
  }, [setSettings])

  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderRadius: 24,
    border: '1px solid rgba(250,248,245,0.08)',
    background: 'rgba(250,248,245,0.02)',
    transition: 'border-color 0.3s',
  }

  const renderProfile = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h3 className="dash-label" style={{ fontSize: '0.8125rem', color: '#FAF8F5', marginBottom: 24 }}>Profile Information</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="dash-label" style={{ marginBottom: 8, display: 'block' }}>Display Name</label>
            <input type="text" value={settings.profile.displayName} onChange={e => set('profile', 'displayName', e.target.value)} className="dash-input" />
          </div>
          <div>
            <label className="dash-label" style={{ marginBottom: 8, display: 'block' }}>Email Address</label>
            <input type="email" value={settings.profile.email} onChange={e => set('profile', 'email', e.target.value)} className="dash-input" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="dash-label" style={{ marginBottom: 8, display: 'block' }}>Timezone</label>
              <select value={settings.profile.timezone} onChange={e => set('profile', 'timezone', e.target.value)} className="dash-select">
                <option value="UTC">UTC</option><option value="EST">Eastern Time</option><option value="PST">Pacific Time</option><option value="GMT">Greenwich Mean Time</option>
              </select>
            </div>
            <div>
              <label className="dash-label" style={{ marginBottom: 8, display: 'block' }}>Language</label>
              <select value={settings.profile.language} onChange={e => set('profile', 'language', e.target.value)} className="dash-select">
                <option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(250,248,245,0.06)', paddingTop: 24 }}>
        <h3 className="dash-label" style={{ fontSize: '0.8125rem', color: '#FAF8F5', marginBottom: 16 }}>Connected Wallet</h3>
        <div style={rowStyle}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#FAF8F5' }}>Flow Wallet</div>
            <div className="dash-label" style={{ marginTop: 4 }}>
              {user.addr ? `${user.addr.slice(0, 8)}...${user.addr.slice(-6)}` : 'Not connected'}
            </div>
          </div>
          <span className="dash-badge" style={{
            background: user.loggedIn ? 'rgba(0,239,139,0.10)' : 'rgba(250,248,245,0.04)',
            borderColor: user.loggedIn ? 'rgba(0,239,139,0.25)' : 'rgba(250,248,245,0.10)',
            color: user.loggedIn ? '#00EF8B' : 'rgba(250,248,245,0.5)',
          }}>
            {user.loggedIn ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  )

  const renderSecurity = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 className="dash-label" style={{ fontSize: '0.8125rem', color: '#FAF8F5', marginBottom: 16 }}>Security Preferences</h3>
      <div style={rowStyle}>
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#FAF8F5' }}>Two-Factor Authentication</div>
          <div className="dash-label">Add an extra layer of security</div>
        </div>
        <Toggle checked={settings.security.twoFactorEnabled} onChange={v => set('security', 'twoFactorEnabled', v)} />
      </div>
      <div>
        <label className="dash-label" style={{ marginBottom: 8, display: 'block' }}>Session Timeout (minutes)</label>
        <select value={settings.security.sessionTimeout} onChange={e => set('security', 'sessionTimeout', parseInt(e.target.value))} className="dash-select">
          <option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>1 hour</option><option value={120}>2 hours</option><option value={0}>Never</option>
        </select>
      </div>
      <div style={rowStyle}>
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#FAF8F5' }}>Auto Logout</div>
          <div className="dash-label">Automatically logout when inactive</div>
        </div>
        <Toggle checked={settings.security.autoLogout} onChange={v => set('security', 'autoLogout', v)} />
      </div>
    </div>
  )

  const notifLabels: Record<string, string> = {
    emailNotifications: 'Receive notifications via email',
    pushNotifications: 'Browser push notifications',
    vaultAlerts: 'Alerts about vault performance',
    performanceReports: 'Weekly performance summaries',
    securityAlerts: 'Security-related notifications',
    marketingEmails: 'Product updates and news',
  }

  const renderNotifications = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 className="dash-label" style={{ fontSize: '0.8125rem', color: '#FAF8F5', marginBottom: 16 }}>Notification Preferences</h3>
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} style={rowStyle}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#FAF8F5', textTransform: 'capitalize' }}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="dash-label">{notifLabels[key]}</div>
          </div>
          <Toggle checked={value as boolean} onChange={v => set('notifications', key, v)} />
        </div>
      ))}
    </div>
  )

  const renderApi = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3 className="dash-label" style={{ fontSize: '0.8125rem', color: '#FAF8F5', marginBottom: 16 }}>API Access</h3>
      <div className="dash-card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#FAF8F5' }}>API Key</div>
            <div className="dash-label">Use this key to access the Sentinel API</div>
          </div>
          <button onClick={() => setShowApiKey(!showApiKey)} aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
            style={{ width: 36, height: 36, borderRadius: 18, border: '1px solid rgba(250,248,245,0.1)', background: 'transparent', color: 'rgba(250,248,245,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
            {showApiKey ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
          </button>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.8125rem', padding: 16, borderRadius: 16, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(250,248,245,0.06)', color: 'rgba(250,248,245,0.5)', marginBottom: 16 }}>
          {user.addr
            ? (showApiKey ? `sk_${user.addr.replace('0x','')}_${Date.now().toString(36)}` : '••••••••••••••••••••••••••••••••')
            : 'Connect wallet to generate API key'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="dash-cta" style={{ padding: '10px 16px', fontSize: '0.625rem', background: 'transparent', border: '1px solid rgba(250,248,245,0.15)', color: '#FAF8F5' }} aria-label="Regenerate API key">
            <RefreshCw style={{ width: 12, height: 12 }} /> Regenerate
          </button>
          <button
            onClick={() => {
              if (!user.addr) return
              const key = `sk_${user.addr.replace('0x','')}_${Date.now().toString(36)}`
              navigator.clipboard.writeText(key).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }).catch(() => {})
            }}
            className="dash-cta"
            aria-label={copied ? 'API key copied' : 'Copy API key to clipboard'}
            style={{ padding: '10px 16px', fontSize: '0.625rem', background: copied ? 'rgba(0,239,139,0.15)' : 'transparent', border: `1px solid ${copied ? 'rgba(0,239,139,0.3)' : 'rgba(250,248,245,0.15)'}`, color: copied ? '#00EF8B' : '#FAF8F5', transition: 'all 0.2s', minWidth: 80, justifyContent: 'center' }}>
            {copied ? <><CheckCircle2 style={{ width: 12, height: 12 }} /> Copied!</> : <>Copy</>}
          </button>
        </div>
      </div>
      <div style={{ padding: 20, borderRadius: 24, border: '1px solid rgba(0,239,139,0.15)', background: 'rgba(0,239,139,0.04)', display: 'flex', gap: 12 }}>
        <AlertTriangle style={{ width: 20, height: 20, color: '#00EF8B', flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#00EF8B' }}>API Security</div>
          <div className="dash-label" style={{ marginTop: 4, lineHeight: 1.5 }}>Keep your API key secure. Never share it publicly or commit it to version control.</div>
        </div>
      </div>
    </div>
  )

  const renderData = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 className="dash-label" style={{ fontSize: '0.8125rem', color: '#FAF8F5', marginBottom: 16 }}>Data Management</h3>
      <div className="dash-card" style={{ padding: 24 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#FAF8F5', marginBottom: 4 }}>Export Data</div>
        <div className="dash-label" style={{ marginBottom: 16 }}>Download your portfolio data, transaction history, and settings as CSV</div>
        <button
          className="dash-cta"
          onClick={exportData}
          style={{ padding: '10px 20px', fontSize: '0.625rem', background: 'transparent', border: '1px solid rgba(250,248,245,0.15)', color: '#FAF8F5' }}
          aria-label="Export all portfolio data as CSV"
        >
          <Download style={{ width: 12, height: 12 }} /> Export All Data
        </button>
      </div>
      <div className="dash-card" style={{ padding: 24 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#FAF8F5', marginBottom: 4 }}>Import Settings</div>
        <div className="dash-label" style={{ marginBottom: 16 }}>Import settings from a previously exported JSON backup</div>
        <label style={{ cursor: 'pointer' }} aria-label="Import settings from backup file">
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              try {
                const text = await file.text()
                const parsed = JSON.parse(text)
                setSettings(prev => ({ ...prev, ...parsed }))
              } catch { /* ignore parse errors */ }
            }}
          />
          <span className="dash-cta" style={{ padding: '10px 20px', fontSize: '0.625rem', background: 'transparent', border: '1px solid rgba(250,248,245,0.15)', color: '#FAF8F5', display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 26, cursor: 'pointer' }}>
            <Upload style={{ width: 12, height: 12 }} /> Import Settings
          </span>
        </label>
      </div>
      <div style={{ padding: 24, borderRadius: 24, border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.04)' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#ef4444', marginBottom: 4 }}>Danger Zone</div>
        <div className="dash-label" style={{ marginBottom: 16, color: 'rgba(239,68,68,0.6)' }}>Permanently delete your account and all associated data. This cannot be undone.</div>
        {deleteConfirm ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.625rem', color: '#ef4444', fontWeight: 600 }}>Are you sure?</span>
            <button
              className="dash-cta"
              onClick={async () => {
                const ok = await deleteAccount()
                if (ok) setDeleteConfirm(false)
              }}
              style={{ padding: '8px 16px', fontSize: '0.5625rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}
              aria-label="Confirm account deletion"
            >
              <Trash2 style={{ width: 12, height: 12 }} /> Yes, Delete
            </button>
            <button onClick={() => setDeleteConfirm(false)} style={{ background: 'none', border: 'none', color: 'rgba(250,248,245,0.5)', cursor: 'pointer', fontSize: '0.5625rem' }}>Cancel</button>
          </div>
        ) : (
          <button
            className="dash-cta"
            onClick={() => setDeleteConfirm(true)}
            style={{ padding: '10px 20px', fontSize: '0.625rem', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
            aria-label="Delete account permanently"
          >
            <Trash2 style={{ width: 12, height: 12 }} /> Delete Account
          </button>
        )}
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':       return renderProfile()
      case 'security':      return renderSecurity()
      case 'notifications': return renderNotifications()
      case 'api':           return renderApi()
      case 'data':          return renderData()
      default:              return renderProfile()
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', background: 'radial-gradient(ellipse at center, rgba(0,239,139,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '30%', height: '40%', background: 'radial-gradient(ellipse at center, rgba(55,221,223,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <Navbar />

      <div style={{ paddingTop: 128, paddingBottom: 80, position: 'relative', zIndex: 10 }}>
        <div className="w-container">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dash-page-header">
            <h1>Settings</h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Sidebar Navigation */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="dash-card" style={{ padding: 8 }}>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {settingsSections.map(s => (
                    <button key={s.id} onClick={() => setActiveSection(s.id)}
                      className={`dash-sidebar-btn ${activeSection === s.id ? 'active' : ''}`}>
                      <span style={{ opacity: activeSection === s.id ? 1 : 0.5 }}>{s.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.title}</div>
                        <div style={{ fontSize: '0.5rem', fontWeight: 500, letterSpacing: '0.08em', opacity: 0.5, marginTop: 2, textTransform: 'uppercase' }}>{s.description}</div>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="dash-card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
                {renderContent()}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(250,248,245,0.06)' }}>
                  {error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: '0.6875rem', fontWeight: 500, marginRight: 16 }}>
                      <AlertTriangle style={{ width: 14, height: 14 }} /> {error}
                    </div>
                  )}
                  {saved && !saving && !error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00EF8B', fontSize: '0.6875rem', fontWeight: 500, marginRight: 24 }}>
                      <CheckCircle2 style={{ width: 14, height: 14 }} />
                      {lastSaved ? `Saved at ${lastSaved.toLocaleTimeString()}` : 'Settings saved'}
                    </div>
                  )}
                  <button
                    onClick={() => setSettings(prev => prev)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '12px 24px', borderRadius: 26, border: '1px solid rgba(250,248,245,0.15)',
                      background: 'transparent', color: '#FAF8F5',
                      fontSize: '0.625rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(250,248,245,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(250,248,245,0.15)'}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const ok = await saveSettings(settings)
                      if (ok) setTxState({ status: 'sealed', txId: null, error: null, title: 'Settings Saved' })
                      else setTxState({ status: 'error', txId: null, error: error ?? 'Could not save settings', title: 'Save Failed' })
                    }}
                    disabled={saving}
                    className="dash-cta"
                    style={{ padding: '12px 24px', fontSize: '0.625rem' }}
                    aria-label="Save settings"
                  >
                    {saving ? (
                      <span style={{ width: 14, height: 14, border: '2px solid rgba(0,239,139,0.3)', borderTopColor: '#00EF8B', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    ) : (
                      <><Save style={{ width: 12, height: 12 }} /> Save Changes</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
