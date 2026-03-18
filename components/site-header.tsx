 "use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconCalendarStats } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  const pathname = usePathname()

  const titles: Record<string, { title: string; subtitle: string }> = {
    "/dashboard": {
      title: "Dashboard financeiro",
      subtitle: "Acompanhe saldo, receitas e despesas em um unico painel.",
    },
    "/transacoes": {
      title: "Transacoes",
      subtitle: "Controle entradas e saidas com filtros rapidos.",
    },
    "/categorias": {
      title: "Categorias",
      subtitle: "Organize seu fluxo financeiro por categoria.",
    },
    "/contas": {
      title: "Contas",
      subtitle: "Monitore saldos por conta e carteira.",
    },
  }

  const config = titles[pathname] ?? {
    title: "FinancasPro",
    subtitle: "Gestao financeira pessoal",
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="grid gap-0.5">
          <h1 className="text-sm font-medium lg:text-base">{config.title}</h1>
          <p className="hidden text-xs text-muted-foreground md:block">
            {config.subtitle}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {pathname === "/dashboard" && (
            <Select defaultValue="30d">
              <SelectTrigger size="sm" className="w-36">
                <IconCalendarStats className="size-4" />
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Ultimos 7 dias</SelectItem>
                <SelectItem value="30d">Ultimos 30 dias</SelectItem>
                <SelectItem value="90d">Ultimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" asChild size="sm" className="hidden sm:flex">
            <Link href="/transacoes">Nova transacao</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
