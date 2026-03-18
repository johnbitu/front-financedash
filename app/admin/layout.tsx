'use client'

import { type CSSProperties } from 'react'

import { AppSidebar } from '@/components/app-sidebar'
import { PageLoading } from '@/components/shared/page-loading'
import { SiteHeader } from '@/components/site-header'
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
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 overflow-y-auto bg-muted/40 p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
