import type { UserLogin } from "@/lib/api-types"

const SESSION_KEY = "finance.session.v1"

export interface AuthSession {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: UserLogin
}

function canUseStorage() {
  return typeof window !== "undefined"
}

export function getAuthSession(): AuthSession | null {
  if (!canUseStorage()) return null

  const raw = window.localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    window.localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function saveAuthSession(session: AuthSession) {
  if (!canUseStorage()) return
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(SESSION_KEY)
}

export function isSessionValid(session: AuthSession | null) {
  if (!session) return false
  return Boolean(session.accessToken && session.refreshToken && session.expiresAt > Date.now())
}

export function buildSession(
  accessToken: string,
  refreshToken: string,
  expiresInSeconds: number,
  user: UserLogin,
): AuthSession {
  return {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + expiresInSeconds * 1000,
    user,
  }
}
