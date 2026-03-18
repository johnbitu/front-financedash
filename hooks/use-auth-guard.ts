'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuthStore } from '@/lib/auth-store'

type UseAuthGuardParams = {
  redirectIfAuthenticatedTo?: string
  redirectIfUnauthenticatedTo?: string
  redirectIfUnauthorizedTo?: string
  requireAuth?: boolean
  requireAdmin?: boolean
}

export function useAuthGuard({
  redirectIfAuthenticatedTo,
  redirectIfUnauthenticatedTo,
  redirectIfUnauthorizedTo,
  requireAuth = false,
  requireAdmin = false,
}: UseAuthGuardParams) {
  const router = useRouter()
  const { isAuthenticated, isLoading, initializeAuth, isAdmin } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const isAuthorized = !requireAdmin || isAdmin()

  useEffect(() => {
    if (isLoading) return

    if (!requireAuth && isAuthenticated && redirectIfAuthenticatedTo) {
      router.replace(redirectIfAuthenticatedTo)
      return
    }

    if (!requireAuth && !isAuthenticated && redirectIfUnauthenticatedTo) {
      router.replace(redirectIfUnauthenticatedTo)
      return
    }

    if (requireAuth && !isAuthenticated && redirectIfUnauthenticatedTo) {
      router.replace(redirectIfUnauthenticatedTo)
      return
    }

    if (requireAdmin && isAuthenticated && !isAuthorized && redirectIfUnauthorizedTo) {
      router.replace(redirectIfUnauthorizedTo)
    }
  }, [
    isAuthenticated,
    isAuthorized,
    isLoading,
    redirectIfAuthenticatedTo,
    redirectIfUnauthenticatedTo,
    redirectIfUnauthorizedTo,
    requireAdmin,
    requireAuth,
    router,
  ])

  return {
    isLoading,
    isAuthenticated,
    isAuthorized,
  }
}
