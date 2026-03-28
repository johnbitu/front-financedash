"use client"

import { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav"
import { ChatFab } from "./chat-fab"
import { useAuthGuard } from "@/hooks/use-auth-guard"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const ready = useAuthGuard()

  if (!ready) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-[#A1A1AA]">
        Carregando sessao...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <div className="ml-[240px] transition-all duration-300">
        <TopNav />
        <main className="p-6">
          {children}
        </main>
      </div>
      <ChatFab />
    </div>
  )
}
