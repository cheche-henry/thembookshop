import { useState } from 'react'
import { User, Lock, CheckCircle } from 'lucide-react'
import { api } from '../utils/api'
import { useAuthStore } from '../context/authStore'
import { Input, Btn } from '../components/AdminInput'

export default function SettingsPage() {
  const { admin, refreshMe }    = useAuthStore()
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState('')
  const [error, setError]       = useState('')

  const [profile, setProfile] = useState({ name: admin?.name || '', email: admin?.email || '', phone: admin?.phone || '' })
  const [creds, setCreds]     = useState({ current_password: '', password: '', password_confirm: '' })

  const handleProfile = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      await api.updateCredentials({ name: profile.name, email: profile.email, phone: profile.phone })
      await refreshMe()
      setSuccess('Profile updated successfully')
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (creds.password !== creds.password_confirm) { setError('Passwords do not match'); return }
    if (creds.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setSaving(true); setError(''); setSuccess('')
    try {
      await api.updateCredentials({ current_password: creds.current_password, password: creds.password })
      setCreds({ current_password: '', password: '', password_confirm: '' })
      setSuccess('Password updated successfully')
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-white font-bold text-2xl">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your admin account</p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* Profile */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-green-400" /> Profile
        </h2>
        <form onSubmit={handleProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={profile.name}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            placeholder="Bookshop Admin"
          />
          <Input
            label="Email Address"
            type="email"
            value={profile.email}
            onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
            placeholder="admin@thembookshop.co.ke"
          />
          <Input
            label="Phone (optional)"
            value={profile.phone}
            onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
            placeholder="+254 700 000 000"
          />
          <div className="flex justify-end pt-1">
            <Btn type="submit" loading={saving}>Save Profile</Btn>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold flex items-center gap-2 mb-5">
          <Lock className="w-4 h-4 text-green-400" /> Change Password
        </h2>
        <form onSubmit={handlePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={creds.current_password}
            onChange={e => setCreds(c => ({ ...c, current_password: e.target.value }))}
            placeholder="••••••••"
          />
          <Input
            label="New Password"
            type="password"
            value={creds.password}
            onChange={e => setCreds(c => ({ ...c, password: e.target.value }))}
            placeholder="Min. 8 characters"
            hint="Must contain uppercase, lowercase, and a number"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={creds.password_confirm}
            onChange={e => setCreds(c => ({ ...c, password_confirm: e.target.value }))}
            placeholder="••••••••"
          />
          <div className="flex justify-end pt-1">
            <Btn type="submit" loading={saving}>Update Password</Btn>
          </div>
        </form>
      </div>

      {/* Info */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 text-sm text-gray-500">
        <p className="text-gray-400 font-semibold mb-1">Session</p>
        <p>JWT tokens expire after 24 hours. You'll be logged out automatically.</p>
      </div>
    </div>
  )
}
