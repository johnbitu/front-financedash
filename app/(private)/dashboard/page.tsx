"use client"

import { useEffect, useMemo, useState } from "react"
import { IconAlertCircle } from "@tabler/icons-react"

import type { ResumoDashboard, ResumoTransacao } from "@/types"
import { tratarErro } from "@/lib/utils"
import transacaoService from "@/services/transacao-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { Spinner } from "@/components/ui/spinner"

const mockTransactions: ResumoTransacao[] = [
  {
    id: 1,
    descricao: "Salario CLT",
    valor: 7500,
    tipo: "RECEITA",
    data: "2026-03-05",
    contaId: 1,
    contaNome: "Conta Principal",
    categoriaId: 1,
    categoriaNome: "Salario",
    criadoEm: "2026-03-05T08:00:00",
    atualizadoEm: "2026-03-05T08:00:00",
  },
  {
    id: 2,
    descricao: "Aluguel",
    valor: 2200,
    tipo: "DESPESA",
    data: "2026-03-06",
    contaId: 1,
    contaNome: "Conta Principal",
    categoriaId: 2,
    categoriaNome: "Moradia",
    criadoEm: "2026-03-06T10:00:00",
    atualizadoEm: "2026-03-06T10:00:00",
  },
  {
    id: 3,
    descricao: "Mercado semanal",
    valor: 480,
    tipo: "DESPESA",
    data: "2026-03-08",
    contaId: 1,
    contaNome: "Conta Principal",
    categoriaId: 3,
    categoriaNome: "Alimentacao",
    criadoEm: "2026-03-08T11:00:00",
    atualizadoEm: "2026-03-08T11:00:00",
  },
  {
    id: 4,
    descricao: "Freelance UX",
    valor: 1800,
    tipo: "RECEITA",
    data: "2026-03-10",
    contaId: 2,
    contaNome: "Conta Reserva",
    categoriaId: 4,
    categoriaNome: "Renda extra",
    criadoEm: "2026-03-10T14:00:00",
    atualizadoEm: "2026-03-10T14:00:00",
  },
  {
    id: 5,
    descricao: "Cartao - Fatura",
    valor: 1320,
    tipo: "DESPESA",
    data: "2026-03-12",
    contaId: 1,
    contaNome: "Conta Principal",
    categoriaId: 5,
    categoriaNome: "Cartao de credito",
    criadoEm: "2026-03-12T09:00:00",
    atualizadoEm: "2026-03-12T09:00:00",
  },
  {
    id: 6,
    descricao: "Assinatura streaming",
    valor: 59,
    tipo: "DESPESA",
    data: "2026-03-13",
    contaId: 1,
    contaNome: "Conta Principal",
    categoriaId: 6,
    categoriaNome: "Assinaturas",
    criadoEm: "2026-03-13T09:00:00",
    atualizadoEm: "2026-03-13T09:00:00",
  },
  {
    id: 7,
    descricao: "Investimento mensal",
    valor: 1000,
    tipo: "DESPESA",
    data: "2026-03-15",
    contaId: 2,
    contaNome: "Conta Reserva",
    categoriaId: 7,
    categoriaNome: "Investimentos",
    criadoEm: "2026-03-15T15:00:00",
    atualizadoEm: "2026-03-15T15:00:00",
  },
  {
    id: 8,
    descricao: "Reembolso empresa",
    valor: 420,
    tipo: "RECEITA",
    data: "2026-03-16",
    contaId: 1,
    contaNome: "Conta Principal",
    categoriaId: 8,
    categoriaNome: "Reembolso",
    criadoEm: "2026-03-16T17:00:00",
    atualizadoEm: "2026-03-16T17:00:00",
  },
]

const mockDashboardData: ResumoDashboard = {
  totalReceitas: 9720,
  totalDespesas: 5059,
  saldo: 4661,
  transacoesRecentes: mockTransactions.slice(0, 5),
  dadosMensais: [
    { mes: "Out", receitas: 8300, despesas: 6400 },
    { mes: "Nov", receitas: 9100, despesas: 7200 },
    { mes: "Dez", receitas: 12500, despesas: 9800 },
    { mes: "Jan", receitas: 8400, despesas: 6900 },
    { mes: "Fev", receitas: 9600, despesas: 7450 },
    { mes: "Mar", receitas: 9720, despesas: 5059 },
  ],
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<ResumoDashboard | null>(null)
  const [transactions, setTransactions] = useState<ResumoTransacao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardResponse, listResponse] = await Promise.all([
          transacaoService.dashboard(),
          transacaoService.listar({ size: 40 }),
        ])
        setDashboard(dashboardResponse)
        setTransactions(listResponse.content)
        setUsingMockData(false)
      } catch (err) {
        setDashboard(mockDashboardData)
        setTransactions(mockTransactions)
        setUsingMockData(true)
        setError(tratarErro(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const monthly = dashboard?.dadosMensais ?? []
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
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
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
          {usingMockData && (
            <Alert>
              <IconAlertCircle className="size-4" />
              <AlertDescription>
                Exibindo dados de demonstracao. Conecte ao backend para ver dados reais.
              </AlertDescription>
            </Alert>
          )}
          <SectionCards summary={summary} />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive monthlyData={monthly} />
          </div>
          <DataTable data={transactions.length ? transactions : dashboard.transacoesRecentes} />
        </div>
      </div>
    </div>
  )
}
