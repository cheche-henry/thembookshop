import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../utils/api'

// Reads the JWT `exp` claim. Returns null when the token can't be parsed, in
// which case the server remains the source of truth.
export function tokenExpiry(token) {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    )
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

export function isTokenExpired(token) {
  if (!token) return true
  const expiry = tokenExpiry(token)
  return expiry !== null && expiry <= Date.now()
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      admin: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const data = await api.login(email, password)
        set({ token: data.data.token, admin: data.data.admin, isAuthenticated: true })
        return data.data
      },

      logout: () => set({ token: null, admin: null, isAuthenticated: false }),

      // True while the stored token is present and not past its expiry.
      hasValidSession: () => {
        const { token } = get()
        return Boolean(token) && !isTokenExpired(token)
      },

      refreshMe: async () => {
        try {
          const data = await api.me()
          set({ admin: data.data })
        } catch {
          get().logout()
        }
      },
    }),
    { name: 'tbsadmin-auth' }
  )
)
