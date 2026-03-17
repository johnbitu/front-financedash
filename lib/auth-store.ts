import { create } from 'zustand'
import type { UserInfo, Role } from '@/types'

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
  initializeAuth: () => void
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
    // accessToken fica em memória (Zustand)
    // refreshToken vai para localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', refreshToken)
    }
    set({ accessToken })
  },

  login: (user: UserInfo, accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', refreshToken)
      // Salva info básica do usuário para rehidratação
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

  initializeAuth: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false })
      return
    }

    const refreshToken = localStorage.getItem('refreshToken')
    const userJson = localStorage.getItem('user')

    if (refreshToken && userJson) {
      try {
        const user = JSON.parse(userJson) as UserInfo
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
        // O token será obtido via refresh na primeira requisição
      } catch {
        // Se der erro no parse, faz logout
        get().logout()
      }
    } else {
      set({ isLoading: false })
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
