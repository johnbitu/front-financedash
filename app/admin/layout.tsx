'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { PageLoading } from '@/components/shared/page-loading'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useAuthGuard } from '@/hooks/use-auth-guard'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isAuthorized, isLoading } = useAuthGuard({
    requireAuth: true,
    requireAdmin: true,
    redirectIfUnauthenticatedTo: '/login',
    redirectIfUnauthorizedTo: '/dashboard',
  })

  if (isLoading) {
    return <PageLoading className="min-h-screen" />
  }

  if (!isAuthenticated || !isAuthorized) {
    return null
  }

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/40 p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
