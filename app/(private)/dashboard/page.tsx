"use client"

import { useEffect, useMemo, useState } from "react"
import { IconAlertCircle } from "@tabler/icons-react"

import type { ResumoDashboard, ResumoTransacao } from "@/types"
import { tratarErro } from "@/lib/utils"
import transacaoService from "@/services/transacao-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { PageLoading } from "@/components/shared/page-loading"
import { SectionCards } from "@/components/section-cards"
import { Empty } from "@/components/ui/empty"

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<ResumoDashboard | null>(null)
  const [transactions, setTransactions] = useState<ResumoTransacao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardResponse, listResponse] = await Promise.all([
          transacaoService.dashboard(),
          transacaoService.listar({ size: 40 }),
        ])
        setDashboard(dashboardResponse)
        setTransactions(listResponse.content)
      } catch (err) {
        setDashboard(null)
        setTransactions([])
        setError(tratarErro(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const monthly = dashboard?.dadosMensais ?? []
  const transactionsToShow = transactions.length ? transactions : dashboard?.transacoesRecentes ?? []
  const hasData = monthly.length > 0 || transactionsToShow.length > 0
  const currentMonth = monthly.at(-1)

  const summary = useMemo(
    () => ({
      saldoAtual: dashboard?.saldo ?? 0,
      receitasMes: currentMonth?.receitas ?? 0,
      despesasMes: currentMonth?.despesas ?? 0,
      economiaMes: (currentMonth?.receitas ?? 0) - (currentMonth?.despesas ?? 0),
    }),
    [currentMonth, dashboard?.saldo]
  )

  if (isLoading) {
    return <PageLoading />
  }

  if (!dashboard) {
    return (
      <Alert variant="destructive">
        <IconAlertCircle className="size-4" />
        <AlertDescription>{error || "Erro ao carregar dashboard"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {!hasData ? (
            <div className="px-4 lg:px-6">
              <Empty>
                <Empty.Icon>
                  <IconAlertCircle className="size-8" />
                </Empty.Icon>
                <Empty.Title>Nenhum dado para exibir</Empty.Title>
                <Empty.Description>
                  Quando houver transacoes no backend, o resumo financeiro aparecera aqui.
                </Empty.Description>
              </Empty>
            </div>
          ) : (
            <>
              <SectionCards summary={summary} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive monthlyData={monthly} />
              </div>
              <DataTable data={transactionsToShow} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
