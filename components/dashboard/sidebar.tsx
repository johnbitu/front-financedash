"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  Tags,
  Receipt,
  Settings,
  HelpCircle,
  ChevronLeft,
  Wallet
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/investimentos", icon: TrendingUp, label: "Investimentos" },
  { href: "/cartoes", icon: CreditCard, label: "Cartoes" },
  { href: "/categorias", icon: Tags, label: "Categorias" },
  { href: "/transacoes", icon: Receipt, label: "Transacoes" },
]

const bottomItems = [
  { href: "/configuracoes", icon: Settings, label: "Configuracoes" },
  { href: "/ajuda", icon: HelpCircle, label: "Ajuda" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={{ width: 240 }}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-black border-r border-[#1a1a1a] flex flex-col z-50"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1a1a1a]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#CCFF00] flex items-center justify-center">
            <Wallet className="w-5 h-5 text-black" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-white text-lg"
            >
              Pierre
            </motion.span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-[#1a1a1a] transition-colors"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 text-[#A1A1AA] transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                isActive
                  ? "bg-[#CCFF00]/10 text-[#CCFF00]"
                  : "text-[#A1A1AA] hover:text-white hover:bg-[#1a1a1a]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#CCFF00] rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="py-4 px-3 border-t border-[#1a1a1a] space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#1a1a1a] transition-colors"
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </div>
    </motion.aside>
  )
}
