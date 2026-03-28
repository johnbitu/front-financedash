import { apiRequest } from "@/lib/api-client"
import type { LoginResponse } from "@/lib/api-types"
import {
  buildSession,
  clearAuthSession,
  getAuthSession,
  isSessionValid,
  saveAuthSession,
} from "@/lib/auth-session"

export interface LoginInput {
  email: string
  senha: string
}

export async function login(input: LoginInput) {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify(input),
  })

  const session = buildSession(
    response.accessToken,
    response.refreshToken,
    response.expiresIn,
    response.user,
  )
  saveAuthSession(session)
  return session
}

export async function logout() {
  const session = getAuthSession()
  try {
    if (session) {
      await apiRequest<void>("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      })
    }
  } finally {
    clearAuthSession()
  }
}

export function hasValidSession() {
  return isSessionValid(getAuthSession())
}
