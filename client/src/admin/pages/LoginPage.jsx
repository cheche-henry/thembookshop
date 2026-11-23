import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../context/authStore'
import { Input } from '../../components/ui/Form'
import { Button } from '../../components/ui/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (loginError) {
      setError(loginError.message || 'The email or password is incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-brand-800">
            <BookOpen className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <h1 className="font-display text-2xl font-semibold text-ink">Them Bookshop</h1>
          <p className="mt-1 text-sm text-muted">Sign in to the admin dashboard.</p>
        </div>

        <div className="border border-line bg-surface p-6 sm:p-8">
          {error && (
            <div className="mb-5 border border-danger/30 bg-[#fdf3f2] px-3.5 py-2.5 text-sm text-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@thembookshop.co.ke"
              autoComplete="username"
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              trailing={(
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="rounded p-1.5 text-muted transition-colors hover:bg-muted-surface hover:text-ink"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
            />

            <Button type="submit" loading={loading} className="mt-2 w-full">
              {loading ? 'Signing in' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Staff access only.
        </p>
      </div>
    </div>
  )
}
