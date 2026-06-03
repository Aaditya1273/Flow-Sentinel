'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Shield, Bell, Palette, Key, Database,
  AlertTriangle, Save, RefreshCw, Download, Upload, Trash2, Eye, EyeOff
} from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'
import { useFlow } from 'lib/flow'

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
  const [activeSection, setActiveSection] = useState('profile')
  const [showApiKey, setShowApiKey] = useState(false)
  const [settings, setSettings] = useState({
    profile:       { displayName: 'DeFi Enthusiast', email: 'user@example.com', timezone: 'UTC', language: 'en' },
    security:      { twoFactorEnabled: false, sessionTimeout: 30, autoLogout: true },
    notifications: { emailNotifications: true, pushNotifications: true, vaultAlerts: true, performanceReports: true, securityAlerts: true, marketingEmails: false },
    appearance:    { theme: 'dark', accentColor: 'green', compactMode: false, animations: true },
    privacy:       { analyticsOptIn: true, shareAnonymousData: false, publicProfile: false },
  })

  const set = (section: string, key: string, value: string | boolean | number) =>
    setSettings(prev => ({ ...prev, [section]: { ...prev[section as keyof typeof prev], [key]: value } }))

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
          <button onClick={() => setShowApiKey(!showApiKey)}
            style={{ width: 36, height: 36, borderRadius: 18, border: '1px solid rgba(250,248,245,0.1)', background: 'transparent', color: 'rgba(250,248,245,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
            {showApiKey ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
          </button>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.8125rem', padding: 16, borderRadius: 16, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(250,248,245,0.06)', color: 'rgba(250,248,245,0.5)', marginBottom: 16 }}>
          {showApiKey ? 'sk_live_1234567890abcdef...' : '••••••••••••••••••••••••••••••••'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="dash-cta" style={{ padding: '10px 16px', fontSize: '0.625rem', background: 'transparent', border: '1px solid rgba(250,248,245,0.15)', color: '#FAF8F5' }}>
            <RefreshCw style={{ width: 12, height: 12 }} /> Regenerate
          </button>
          <button className="dash-cta" style={{ padding: '10px 16px', fontSize: '0.625rem', background: 'transparent', border: '1px solid rgba(250,248,245,0.15)', color: '#FAF8F5' }}>
            Copy
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
        <div className="dash-label" style={{ marginBottom: 16 }}>Download your portfolio data, transaction history, and settings</div>
        <button className="dash-cta" style={{ padding: '10px 20px', fontSize: '0.625rem', background: 'transparent', border: '1px solid rgba(250,248,245,0.15)', color: '#FAF8F5' }}>
          <Download style={{ width: 12, height: 12 }} /> Export All Data
        </button>
      </div>
      <div className="dash-card" style={{ padding: 24 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#FAF8F5', marginBottom: 4 }}>Import Settings</div>
        <div className="dash-label" style={{ marginBottom: 16 }}>Import settings from a backup file</div>
        <button className="dash-cta" style={{ padding: '10px 20px', fontSize: '0.625rem', background: 'transparent', border: '1px solid rgba(250,248,245,0.15)', color: '#FAF8F5' }}>
          <Upload style={{ width: 12, height: 12 }} /> Import Settings
        </button>
      </div>
      <div style={{ padding: 24, borderRadius: 24, border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.04)' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#ef4444', marginBottom: 4 }}>Danger Zone</div>
        <div className="dash-label" style={{ marginBottom: 16, color: 'rgba(239,68,68,0.6)' }}>Permanently delete your account and all associated data</div>
        <button className="dash-cta" style={{ padding: '10px 20px', fontSize: '0.625rem', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
          <Trash2 style={{ width: 12, height: 12 }} /> Delete Account
        </button>
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
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 24px', borderRadius: 26, border: '1px solid rgba(250,248,245,0.15)',
                    background: 'transparent', color: '#FAF8F5',
                    fontSize: '0.625rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(250,248,245,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(250,248,245,0.15)'}>
                    Cancel
                  </button>
                  <button className="dash-cta" style={{ padding: '12px 24px', fontSize: '0.625rem' }}>
                    <Save style={{ width: 12, height: 12 }} /> Save Changes
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
