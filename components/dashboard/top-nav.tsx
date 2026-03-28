"use client"

import { Bell, Search, User, Moon, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth-service"
import { useAuthSession } from "@/hooks/use-auth-session"

export function TopNav() {
  const router = useRouter()
  const session = useAuthSession()

  async function onLogout() {
    await logout()
    router.replace("/login")
  }

  const displayName = session?.user?.email ?? "Conta"

  return (
    <header className="h-16 bg-black border-b border-[#1a1a1a] flex items-center justify-end px-6">
      {/* Right Side - Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="p-2.5 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#CCFF00]/30 transition-colors group">
          <Search className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#CCFF00]" />
        </button>

        {/* Notifications */}
        <button className="p-2.5 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#CCFF00]/30 transition-colors group relative">
          <Bell className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#CCFF00]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#CCFF00] rounded-full" />
        </button>

        {/* Theme Toggle */}
        <button className="p-2.5 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#CCFF00]/30 transition-colors group">
          <Moon className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#CCFF00]" />
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="p-2.5 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-red-500/30 transition-colors group"
          title="Sair"
        >
          <LogOut className="w-4 h-4 text-[#A1A1AA] group-hover:text-red-400" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-3 p-1.5 pr-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#CCFF00]/30 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#CCFF00] to-[#22c55e] flex items-center justify-center">
            <User className="w-4 h-4 text-black" />
          </div>
          <span className="text-sm font-medium text-white max-w-[190px] truncate">{displayName}</span>
        </button>
      </div>
    </header>
  )
}
