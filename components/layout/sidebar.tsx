'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Wallet,
  Tags,
  ArrowLeftRight,
  Users,
  Wallet as WalletIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/auth-store'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Contas',
    href: '/contas',
    icon: Wallet,
  },
  {
    name: 'Categorias',
    href: '/categorias',
    icon: Tags,
  },
  {
    name: 'Transações',
    href: '/transacoes',
    icon: ArrowLeftRight,
  },
]

const adminNavigation = [
  {
    name: 'Usuários',
    href: '/admin/usuarios',
    icon: Users,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isAdmin } = useAuthStore()

  return (
    <aside className="hidden w-64 flex-col border-r bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <WalletIcon className="size-5" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">
          FinançasPro
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="flex flex-col gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className="size-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>

        {isAdmin() && (
          <>
            <div className="my-4 border-t" />
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Administração
            </p>
            <ul className="flex flex-col gap-1">
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      )}
                    >
                      <item.icon className="size-5" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </nav>
    </aside>
  )
}
