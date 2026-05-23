'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Shield, Bell, Palette, Key, Database,
  AlertTriangle, Save, RefreshCw, Download, Upload, Trash2, Eye, EyeOff
} from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
import { Card } from 'components/ui/card'
import { useFlow } from 'lib/flow'

const settingsSections = [
  { id: 'profile',       title: 'Profile',           description: 'Account information',          icon: <User className="w-4 h-4" /> },
  { id: 'security',      title: 'Security',           description: 'Wallet & auth settings',       icon: <Shield className="w-4 h-4" /> },
  { id: 'notifications', title: 'Notifications',      description: 'Alerts & preferences',         icon: <Bell className="w-4 h-4" /> },
  { id: 'appearance',    title: 'Appearance',         description: 'Theme & display',              icon: <Palette className="w-4 h-4" /> },
  { id: 'api',           title: 'API & Integrations', description: 'Keys & third-party',           icon: <Key className="w-4 h-4" /> },
  { id: 'data',          title: 'Data & Privacy',     description: 'Export & privacy controls',    icon: <Database className="w-4 h-4" /> },
]

/* ── Reusable input classes ── */
const inputCls = 'w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all text-sm font-medium'
const selectCls = `${inputCls} cursor-pointer`
const rowCls = 'flex items-center justify-between p-5 glass rounded-2xl border-white/5 bg-white/[0.02]'

/* ── Flow-branded toggle ── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${checked ? 'bg-primary shadow-[0_0_12px_rgba(0,239,139,0.4)]' : 'bg-white/10'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
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

  const set = (section: string, key: string, value: any) =>
    setSettings(prev => ({ ...prev, [section]: { ...prev[section as keyof typeof prev], [key]: value } }))

  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6">Profile Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Display Name</label>
            <input type="text" value={settings.profile.displayName} onChange={e => set('profile', 'displayName', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Email Address</label>
            <input type="email" value={settings.profile.email} onChange={e => set('profile', 'email', e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Timezone</label>
              <select value={settings.profile.timezone} onChange={e => set('profile', 'timezone', e.target.value)} className={selectCls}>
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="GMT">Greenwich Mean Time</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Language</label>
              <select value={settings.profile.language} onChange={e => set('profile', 'language', e.target.value)} className={selectCls}>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 pt-6">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-4">Connected Wallet</h3>
        <div className={rowCls}>
          <div>
            <div className="text-sm font-black text-white">Flow Wallet</div>
            <div className="text-[10px] font-bold text-muted-foreground mt-1">
              {user.addr ? `${user.addr.slice(0, 8)}...${user.addr.slice(-6)}` : 'Not connected'}
            </div>
          </div>
          <Badge className={user.loggedIn ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white/5 text-muted-foreground border-white/10'}>
            {user.loggedIn ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>
    </div>
  )

  const renderSecurity = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6">Security Preferences</h3>
      <div className={rowCls}>
        <div>
          <div className="text-sm font-black text-white">Two-Factor Authentication</div>
          <div className="text-[10px] text-muted-foreground mt-1">Add an extra layer of security</div>
        </div>
        <Toggle checked={settings.security.twoFactorEnabled} onChange={v => set('security', 'twoFactorEnabled', v)} />
      </div>
      <div>
        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Session Timeout (minutes)</label>
        <select value={settings.security.sessionTimeout} onChange={e => set('security', 'sessionTimeout', parseInt(e.target.value))} className={selectCls}>
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={60}>1 hour</option>
          <option value={120}>2 hours</option>
          <option value={0}>Never</option>
        </select>
      </div>
      <div className={rowCls}>
        <div>
          <div className="text-sm font-black text-white">Auto Logout</div>
          <div className="text-[10px] text-muted-foreground mt-1">Automatically logout when inactive</div>
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
    <div className="space-y-4">
      <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6">Notification Preferences</h3>
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} className={rowCls}>
          <div>
            <div className="text-sm font-black text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{notifLabels[key]}</div>
          </div>
          <Toggle checked={value as boolean} onChange={v => set('notifications', key, v)} />
        </div>
      ))}
    </div>
  )

  const renderApi = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6">API Access</h3>
      <div className="p-6 glass rounded-2xl border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-black text-white">API Key</div>
            <div className="text-[10px] text-muted-foreground mt-1">Use this key to access the Sentinel API</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowApiKey(!showApiKey)} className="text-muted-foreground hover:text-white">
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        <div className="font-mono text-sm bg-black/40 border border-white/10 p-4 rounded-xl text-muted-foreground">
          {showApiKey ? 'sk_live_1234567890abcdef...' : '••••••••••••••••••••••••••••••••'}
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" className="border-white/10 hover:border-white/20 text-[10px] font-black uppercase tracking-widest">
            <RefreshCw className="w-3 h-3 mr-2" /> Regenerate
          </Button>
          <Button size="sm" variant="outline" className="border-white/10 hover:border-white/20 text-[10px] font-black uppercase tracking-widest">
            Copy
          </Button>
        </div>
      </div>
      <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-black text-primary">API Security</div>
            <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              Keep your API key secure. Never share it publicly or commit it to version control.
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderData = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6">Data Management</h3>
      <div className="p-6 glass rounded-2xl border-white/5 bg-white/[0.02]">
        <div className="text-sm font-black text-white mb-1">Export Data</div>
        <div className="text-[10px] text-muted-foreground mb-4">Download your portfolio data, transaction history, and settings</div>
        <Button variant="outline" size="sm" className="border-white/10 hover:border-white/20 text-[10px] font-black uppercase tracking-widest">
          <Download className="w-3 h-3 mr-2" /> Export All Data
        </Button>
      </div>
      <div className="p-6 glass rounded-2xl border-white/5 bg-white/[0.02]">
        <div className="text-sm font-black text-white mb-1">Import Settings</div>
        <div className="text-[10px] text-muted-foreground mb-4">Import settings from a backup file</div>
        <Button variant="outline" size="sm" className="border-white/10 hover:border-white/20 text-[10px] font-black uppercase tracking-widest">
          <Upload className="w-3 h-3 mr-2" /> Import Settings
        </Button>
      </div>
      <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-2xl">
        <div className="text-sm font-black text-destructive mb-1">Danger Zone</div>
        <div className="text-[10px] text-destructive/70 mb-4">Permanently delete your account and all associated data</div>
        <Button variant="outline" size="sm" className="border-destructive/40 text-destructive hover:bg-destructive/10 text-[10px] font-black uppercase tracking-widest">
          <Trash2 className="w-3 h-3 mr-2" /> Delete Account
        </Button>
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[40%] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      <Navbar />

      <div className="pt-32 pb-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Configuration</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Settings</h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Nav */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
              <div className="tool-card p-3 border-0 glass">
                <nav className="space-y-1">
                  {settingsSections.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        activeSection === s.id
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className={activeSection === s.id ? 'text-primary' : 'text-muted-foreground'}>{s.icon}</span>
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-widest">{s.title}</div>
                        <div className="text-[9px] opacity-60 mt-0.5">{s.description}</div>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
              <div className="tool-card p-8 border-0 glass relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                {renderContent()}
                <div className="flex justify-end gap-3 mt-10 pt-8 border-t border-white/5">
                  <Button variant="outline" className="border-white/10 hover:border-white/20 text-[10px] font-black uppercase tracking-widest">
                    Cancel
                  </Button>
                  <Button className="btn-primary text-[10px] font-black uppercase tracking-widest">
                    <Save className="w-3 h-3 mr-2" /> Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
