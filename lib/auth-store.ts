import axios from 'axios'
import { create } from 'zustand'
import type { UserInfo, Role } from '@/types'

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || '/api'

const API_URL = (() => {
  const normalized = rawApiUrl.replace(/\/+$/, '')

  if (!/^https?:\/\//i.test(normalized)) {
    return normalized || '/api'
  }

  return normalized.endsWith('/api') ? normalized : `${normalized}/api`
})()

interface AuthState {
  user: UserInfo | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: UserInfo) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  login: (user: UserInfo, accessToken: string, refreshToken: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  initializeAuth: () => Promise<void>
  isAdmin: () => boolean
  hasRole: (role: Role) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user: UserInfo) => {
    set({ user })
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    // accessToken stays in memory (Zustand)
    // refreshToken goes to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', refreshToken)
    }
    set({ accessToken })
  },

  login: (user: UserInfo, accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', refreshToken)
      // Save basic user info for rehydration
      localStorage.setItem('user', JSON.stringify(user))
    }
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    })
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  initializeAuth: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false })
      return
    }

    // Prevent duplicate inits from multiple layouts/effects
    if (!get().isLoading) {
      return
    }

    const refreshToken = localStorage.getItem('refreshToken')
    const userJson = localStorage.getItem('user')

    if (!refreshToken || !userJson) {
      set({ isLoading: false })
      return
    }

    try {
      const user = JSON.parse(userJson) as UserInfo
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken,
      })

      const { accessToken, refreshToken: newRefreshToken } = response.data as {
        accessToken: string
        refreshToken: string
      }

      localStorage.setItem('refreshToken', newRefreshToken)
      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      get().logout()
    }
  },

  isAdmin: () => {
    const { user } = get()
    return user?.role === 'ADMIN'
  },

  hasRole: (role: Role) => {
    const { user } = get()
    return user?.role === role
  },
}))
