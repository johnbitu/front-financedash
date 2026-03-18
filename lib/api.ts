import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from './auth-store'

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || '/api'

// Normalize base URL to avoid calls hitting "/users" instead of "/api/users"
// when NEXT_PUBLIC_API_URL is set to host-only (e.g. http://localhost:8080).
const API_URL = (() => {
  const normalized = rawApiUrl.replace(/\/+$/, '')

  if (!/^https?:\/\//i.test(normalized)) {
    return normalized || '/api'
  }

  return normalized.endsWith('/api') ? normalized : `${normalized}/api`
})()

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Avoid multiple concurrent refresh calls
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: Error) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

// Request interceptor: add auth header when token is present
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: refresh token on auth errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    const status = error.response?.status
    const isAuthError = status === 401 || status === 403

    // Skip if not an auth error or if already retried
    if (!isAuthError || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Never refresh for auth endpoints themselves
    const authRoutes = ['/auth/login', '/auth/register', '/auth/refresh']
    if (authRoutes.some((route) => originalRequest.url?.includes(route))) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(api(originalRequest))
          },
          reject: (err: Error) => {
            reject(err)
          },
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken,
      })

      const { accessToken, refreshToken: newRefreshToken } = response.data as {
        accessToken: string
        refreshToken: string
      }

      useAuthStore.getState().setTokens(accessToken, newRefreshToken)

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
      }

      processQueue(null, accessToken)
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError as Error, null)
      useAuthStore.getState().logout()

      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
