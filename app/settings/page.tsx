'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Palette,
  Key,
  Database,
  AlertTriangle,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { Navbar } from 'components/layout/Navbar'
import { Button } from 'components/ui/button'
import { Badge } from 'components/ui/badge'
import { Card } from 'components/ui/card'
import { useFlow } from 'lib/flow'

interface SettingsSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Manage your account information and preferences',
    icon: <User className="w-5 h-5" />
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Security settings and wallet management',
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure alerts and notification preferences',
    icon: <Bell className="w-5 h-5" />
  },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Customize the look and feel of your dashboard',
    icon: <Palette className="w-5 h-5" />
  },
  {
    id: 'api',
    title: 'API & Integrations',
    description: 'Manage API keys and third-party integrations',
    icon: <Key className="w-5 h-5" />
  },
  {
    id: 'data',
    title: 'Data & Privacy',
    description: 'Export data and manage privacy settings',
    icon: <Database className="w-5 h-5" />
  }
]

export default function SettingsPage() {
  const { user } = useFlow()
  const [activeSection, setActiveSection] = useState('profile')
  const [showApiKey, setShowApiKey] = useState(false)
  const [settings, setSettings] = useState({
    profile: {
      displayName: 'DeFi Enthusiast',
      email: 'user@example.com',
      timezone: 'UTC',
      language: 'en'
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      autoLogout: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      vaultAlerts: true,
      performanceReports: true,
      securityAlerts: true,
      marketingEmails: false
    },
    appearance: {
      theme: 'dark',
      accentColor: 'blue',
      compactMode: false,
      animations: true
    },
    privacy: {
      analyticsOptIn: true,
      shareAnonymousData: false,
      publicProfile: false
    }
  })

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
  }

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={settings.profile.displayName}
              onChange={(e) => handleSettingChange('profile', 'displayName', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={settings.profile.timezone}
                onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="GMT">Greenwich Mean Time</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Language
              </label>
              <select
                value={settings.profile.language}
                onChange={(e) => handleSettingChange('profile', 'language', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Connected Wallet</h3>
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div>
            <div className="font-medium text-white">Flow Wallet</div>
            <div className="text-sm text-gray-400">
              {user.addr ? `${user.addr.slice(0, 8)}...${user.addr.slice(-6)}` : 'Not connected'}
            </div>
          </div>
          <Badge variant={user.loggedIn ? 'success' : 'outline'}>
            {user.loggedIn ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Security Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <div className="font-medium text-white">Two-Factor Authentication</div>
              <div className="text-sm text-gray-400">Add an extra layer of security</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.twoFactorEnabled}
                onChange={(e) => handleSettingChange('security', 'twoFactorEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Session Timeout (minutes)
            </label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={0}>Never</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <div className="font-medium text-white">Auto Logout</div>
              <div className="text-sm text-gray-400">Automatically logout when inactive</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.autoLogout}
                onChange={(e) => handleSettingChange('security', 'autoLogout', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <div className="font-medium text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm text-gray-400">
                  {key === 'emailNotifications' && 'Receive notifications via email'}
                  {key === 'pushNotifications' && 'Browser push notifications'}
                  {key === 'vaultAlerts' && 'Alerts about vault performance'}
                  {key === 'performanceReports' && 'Weekly performance summaries'}
                  {key === 'securityAlerts' && 'Security-related notifications'}
                  {key === 'marketingEmails' && 'Product updates and news'}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">API Access</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-white">API Key</div>
                <div className="text-sm text-gray-400">Use this key to access the Sentinel API</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <div className="font-mono text-sm bg-gray-900 p-3 rounded border">
              {showApiKey ? 'sk_live_1234567890abcdef...' : '••••••••••••••••••••••••••••••••'}
            </div>
            <div className="flex space-x-2 mt-3">
              <Button size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button size="sm" variant="outline">
                Copy
              </Button>
            </div>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-400">API Security</div>
                <div className="text-sm text-yellow-300 mt-1">
                  Keep your API key secure. Never share it publicly or commit it to version control.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="font-medium text-white mb-2">Export Data</div>
            <div className="text-sm text-gray-400 mb-4">
              Download your portfolio data, transaction history, and settings
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export All Data
            </Button>
          </div>

          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="font-medium text-white mb-2">Import Settings</div>
            <div className="text-sm text-gray-400 mb-4">
              Import settings from a backup file
            </div>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import Settings
            </Button>
          </div>

          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="font-medium text-red-400 mb-2">Danger Zone</div>
            <div className="text-sm text-red-300 mb-4">
              Permanently delete your account and all associated data
            </div>
            <Button variant="outline" size="sm" className="text-red-400 border-red-400 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings()
      case 'security':
        return renderSecuritySettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'api':
        return renderApiSettings()
      case 'data':
        return renderDataSettings()
      default:
        return renderProfileSettings()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Settings
            </h1>
            <p className="text-xl text-gray-300">
              Manage your account preferences and security settings
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Settings Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <Card className="glass p-4">
                <nav className="space-y-2">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800/50'
                      }`}
                    >
                      {section.icon}
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs opacity-75">{section.description}</div>
                      </div>
                    </button>
                  ))}
                </nav>
              </Card>
            </motion.div>

            {/* Settings Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              <Card className="glass p-6">
                {renderSettingsContent()}
                
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-700">
                  <Button variant="outline">
                    Cancel
                  </Button>
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}