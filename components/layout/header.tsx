'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Palette, User, Wallet as WalletIcon } from 'lucide-react'

import { useAuthStore } from '@/lib/auth-store'
import { Button } from '@/components/ui/button'
import { ThemeCommandDialog } from '@/components/layout/theme-command-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function Header() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [themeDialogOpen, setThemeDialogOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />

        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <WalletIcon className="size-5" />
          </div>
          <span className="font-semibold">FinançasPro</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                <User className="size-4" />
              </div>
              <span className="hidden sm:inline">{user?.nome}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.nome}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setThemeDialogOpen(true)}>
              <Palette className="mr-2 size-4" />
              Selecionar tema
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ThemeCommandDialog
        open={themeDialogOpen}
        onOpenChange={setThemeDialogOpen}
      />
    </header>
  )
}
