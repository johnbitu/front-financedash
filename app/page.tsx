'use client'

import { PageLoading } from '@/components/shared/page-loading'
import { useAuthGuard } from '@/hooks/use-auth-guard'

export default function HomePage() {
  useAuthGuard({
    requireAuth: false,
    redirectIfAuthenticatedTo: '/dashboard',
    redirectIfUnauthenticatedTo: '/login',
  })

  return <PageLoading className="min-h-screen" />
}
