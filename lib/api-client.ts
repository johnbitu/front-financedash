import type { ApiErrorPayload, RefreshResponse } from "@/lib/api-types"
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
  type AuthSession,
} from "@/lib/auth-session"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export class ApiError extends Error {
  status: number
  payload?: ApiErrorPayload

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.payload = payload
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean
}

let refreshPromise: Promise<AuthSession | null> | null = null

function buildHeaders(
  initHeaders: HeadersInit | undefined,
  token?: string,
): Headers {
  const headers = new Headers(initHeaders ?? {})
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  return headers
}

async function parseErrorPayload(response: Response): Promise<ApiErrorPayload | undefined> {
  try {
    return (await response.json()) as ApiErrorPayload
  } catch {
    return undefined
  }
}

async function throwApiError(response: Response): Promise<never> {
  const payload = await parseErrorPayload(response)
  const message = payload?.message ?? `Erro HTTP ${response.status}`
  throw new ApiError(response.status, message, payload)
}

function redirectToLogin() {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login"
  }
}

async function refreshSession(currentSession: AuthSession): Promise<AuthSession | null> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: buildHeaders(undefined),
      body: JSON.stringify({ refreshToken: currentSession.refreshToken }),
    })

    if (!response.ok) {
      clearAuthSession()
      return null
    }

    const refresh = (await response.json()) as RefreshResponse
    const nextSession: AuthSession = {
      accessToken: refresh.accessToken,
      refreshToken: refresh.refreshToken,
      expiresAt: Date.now() + refresh.expiresIn * 1000,
      user: currentSession.user,
    }

    saveAuthSession(nextSession)
    return nextSession
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

async function rawRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, ...rest } = options
  const session = getAuthSession()
  const headers = buildHeaders(rest.headers, auth ? session?.accessToken : undefined)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
  })

  if (!response.ok) {
    await throwApiError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true } = options

  try {
    return await rawRequest<T>(path, options)
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || !auth) {
      throw error
    }

    const session = getAuthSession()
    if (!session?.refreshToken) {
      clearAuthSession()
      redirectToLogin()
      throw error
    }

    const nextSession = await refreshSession(session)
    if (!nextSession) {
      clearAuthSession()
      redirectToLogin()
      throw error
    }

    try {
      return await rawRequest<T>(path, options)
    } catch (retryError) {
      if (retryError instanceof ApiError && retryError.status === 401) {
        clearAuthSession()
        redirectToLogin()
      }
      throw retryError
    }
  }
}
