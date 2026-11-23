import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { api } from '../utils/api'
import { useAuthStore } from '../context/authStore'
import { Input } from '../../components/ui/Form'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'

const MIN_PASSWORD = 8

export default function SettingsPage() {
  const { admin, refreshMe } = useAuthStore()
  const { toast } = useToast()

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [errors, setErrors] = useState({})

  const [profile, setProfile] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    phone: admin?.phone || '',
  })
  const [creds, setCreds] = useState({ current_password: '', password: '', password_confirm: '' })

  const setProfileField = (key, value) => {
    setProfile((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: null }))
  }

  const setCredField = (key, value) => {
    setCreds((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: null }))
  }

  const handleProfile = async (event) => {
    event.preventDefault()

    const next = {}
    if (!profile.name.trim()) next.name = 'Enter your name.'
    if (!profile.email.trim()) next.email = 'Enter an email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) next.email = 'Enter a valid email address.'
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }

    setSavingProfile(true)
    try {
      await api.updateCredentials({
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
      })
      await refreshMe()
      toast({ title: 'Profile updated' })
    } catch (error) {
      toast({ title: 'Profile could not be saved', description: error.message, tone: 'error' })
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePassword = async (event) => {
    event.preventDefault()

    const next = {}
    if (!creds.current_password) next.current_password = 'Enter your current password.'
    if (!creds.password) next.password = 'Enter a new password.'
    else if (creds.password.length < MIN_PASSWORD) next.password = `Use at least ${MIN_PASSWORD} characters.`
    if (!creds.password_confirm) next.password_confirm = 'Repeat the new password.'
    else if (creds.password !== creds.password_confirm) next.password_confirm = 'The passwords do not match.'

    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }

    setSavingPassword(true)
    try {
      await api.updateCredentials({
        current_password: creds.current_password,
        password: creds.password,
      })
      setCreds({ current_password: '', password: '', password_confirm: '' })
      toast({ title: 'Password updated', description: 'Use the new password the next time you sign in.' })
    } catch (error) {
      toast({ title: 'Password could not be updated', description: error.message, tone: 'error' })
    } finally {
      setSavingPassword(false)
    }
  }

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPasswords((value) => !value)}
      className="rounded p-1.5 text-muted transition-colors hover:bg-muted-surface hover:text-ink"
      aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
    >
      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage the admin account used to run the shop.</p>
      </div>

      <section className="border border-line bg-surface">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-sm font-semibold text-ink">Profile</h2>
          <p className="mt-0.5 text-xs text-muted">Shown in the sidebar and used for account notices.</p>
        </div>

        <form onSubmit={handleProfile} className="space-y-4 px-5 py-5">
          <Input
            label="Full name"
            value={profile.name}
            onChange={(event) => setProfileField('name', event.target.value)}
            placeholder="Bookshop Admin"
            autoComplete="name"
            error={errors.name}
          />
          <Input
            label="Email address"
            type="email"
            value={profile.email}
            onChange={(event) => setProfileField('email', event.target.value)}
            placeholder="admin@thembookshop.co.ke"
            autoComplete="email"
            error={errors.email}
          />
          <Input
            label="Phone"
            optional
            type="tel"
            value={profile.phone}
            onChange={(event) => setProfileField('phone', event.target.value)}
            placeholder="0712 345 678"
            autoComplete="tel"
          />

          <div className="flex justify-end pt-1">
            <Button type="submit" loading={savingProfile} disabled={savingProfile}>
              {savingProfile ? 'Saving' : 'Save profile'}
            </Button>
          </div>
        </form>
      </section>

      <section className="border border-line bg-surface">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-sm font-semibold text-ink">Password</h2>
          <p className="mt-0.5 text-xs text-muted">
            Use at least {MIN_PASSWORD} characters. You stay signed in after changing it.
          </p>
        </div>

        <form onSubmit={handlePassword} className="space-y-4 px-5 py-5">
          <Input
            label="Current password"
            type={showPasswords ? 'text' : 'password'}
            value={creds.current_password}
            onChange={(event) => setCredField('current_password', event.target.value)}
            autoComplete="current-password"
            error={errors.current_password}
            trailing={passwordToggle}
          />
          <Input
            label="New password"
            type={showPasswords ? 'text' : 'password'}
            value={creds.password}
            onChange={(event) => setCredField('password', event.target.value)}
            autoComplete="new-password"
            error={errors.password}
          />
          <Input
            label="Confirm new password"
            type={showPasswords ? 'text' : 'password'}
            value={creds.password_confirm}
            onChange={(event) => setCredField('password_confirm', event.target.value)}
            autoComplete="new-password"
            error={errors.password_confirm}
          />

          <div className="flex justify-end pt-1">
            <Button type="submit" loading={savingPassword} disabled={savingPassword}>
              {savingPassword ? 'Updating' : 'Update password'}
            </Button>
          </div>
        </form>
      </section>

      <div className="flex items-start gap-3 border border-line bg-muted-surface px-4 py-3.5">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-700" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-muted">
          Admin sessions expire after 24 hours. When a session ends you are returned to the sign-in screen.
        </p>
      </div>
    </div>
  )
}
