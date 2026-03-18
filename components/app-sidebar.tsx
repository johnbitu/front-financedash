"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconBuildingBank,
  IconCalendarStats,
  IconCategory,
  IconCreditCard,
  IconDashboard,
  IconInnerShadowTop,
  IconReceipt2,
  IconReportAnalytics,
  IconSettings,
  IconTargetArrow,
  IconUserDollar,
  IconWallet,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useAuthStore } from "@/lib/auth-store"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    { title: "Visao geral", url: "/dashboard", icon: IconDashboard },
    { title: "Este mes", url: "/dashboard", icon: IconCalendarStats },
    { title: "Transacoes", url: "/transacoes", icon: IconReceipt2 },
    { title: "Categorias", url: "/categorias", icon: IconCategory },
    { title: "Contas", url: "/contas", icon: IconBuildingBank },
    { title: "Cartoes", url: "/dashboard", icon: IconCreditCard },
    { title: "Assinaturas", url: "/dashboard", icon: IconUserDollar },
    { title: "Metas", url: "/dashboard", icon: IconTargetArrow },
  ],
  navSecondary: [
    { title: "Relatorios", url: "/dashboard", icon: IconReportAnalytics },
    { title: "Configuracoes", url: "/dashboard", icon: IconSettings },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">FinancasPro</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.nome || "Usuario",
            email: user?.email || "usuario@local",
            avatar: "/placeholder-user.jpg",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
