import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../utils/api'

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
