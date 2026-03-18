'use client'

import { Wallet } from 'lucide-react'
import { PageLoading } from '@/components/shared/page-loading'
import { useAuthGuard } from '@/hooks/use-auth-guard'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuthGuard({
    requireAuth: false,
    redirectIfAuthenticatedTo: '/dashboard',
  })

  if (isLoading) {
    return <PageLoading className="min-h-screen" />
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wallet className="size-6" />
        </div>
        <span className="text-2xl font-bold">FinançasPro</span>
      </div>
      {children}
    </div>
  )
}
