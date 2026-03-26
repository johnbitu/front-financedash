'use client'

import { useEffect, useMemo, useState } from 'react'
import { IconAlertCircle, IconCreditCard, IconRepeat, IconTargetArrow } from '@tabler/icons-react'

import type {
  DadoMensal,
  DashboardResumoResponse,
  ResumoTransacao,
  StatusFatura,
} from '@/types'
import { tratarErro, formatarMoeda, formatarData } from '@/lib/utils'
import dashboardService from '@/services/dashboard-service'
import transacaoService from '@/services/transacao-service'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { DataTable } from '@/components/data-table'
import { PageLoading } from '@/components/shared/page-loading'
import { SectionCards } from '@/components/section-cards'
import { Empty } from '@/components/ui/empty'

const monthKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const monthLabel = (monthKeyValue: string): string => {
  const date = new Date(`${monthKeyValue}-01T00:00:00`)
  return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date).replace('.', '')
}

const buildMonthlyData = (transactions: ResumoTransacao[]): DadoMensal[] => {
  const grouped = new Map<string, { receitas: number; despesas: number }>()

  transactions.forEach((transaction) => {
    const key = transaction.data.slice(0, 7)
    if (!grouped.has(key)) {
      grouped.set(key, { receitas: 0, despesas: 0 })
    }
    const current = grouped.get(key)!
    if (transaction.tipo === 'RECEITA') {
      current.receitas += transaction.valor
    } else {
      current.despesas += transaction.valor
    }
  })

  const totalMonths = 6
  const today = new Date()

  return Array.from({ length: totalMonths }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (totalMonths - 1 - index), 1)
    const key = monthKey(date)
    const values = grouped.get(key) ?? { receitas: 0, despesas: 0 }
    return {
      mes: monthLabel(key),
      receitas: values.receitas,
      despesas: values.despesas,
    }
  })
}

const faturaBadgeVariant = (status: StatusFatura): 'outline' | 'secondary' | 'default' => {
  if (status === 'PAGA') return 'secondary'
  if (status === 'FECHADA') return 'default'
  return 'outline'
}

export function DashboardResumoView() {
  const [resumo, setResumo] = useState<DashboardResumoResponse | null>(null)
  const [transactions, setTransactions] = useState<ResumoTransacao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumoResponse, transactionsResponse] = await Promise.all([
          dashboardService.resumo(),
          transacaoService.listar({ size: 1000 }),
        ])

        setResumo(resumoResponse)
        setTransactions(transactionsResponse.content)
      } catch (err) {
        setResumo(null)
        setTransactions([])
        setError(tratarErro(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const monthly = useMemo(() => buildMonthlyData(transactions), [transactions])

  const summary = useMemo(
    () => ({
      saldoAtual: resumo?.saldoTotal ?? 0,
      receitasMes: resumo?.totalReceitas ?? 0,
      despesasMes: resumo?.totalDespesas ?? 0,
      economiaMes: resumo?.saldoMes ?? 0,
    }),
    [resumo]
  )

  const limitePercentual = useMemo(() => {
    if (!resumo || resumo.limiteCartaoTotal <= 0) {
      return 0
    }
    return Math.min(100, (resumo.limiteCartaoUsado / resumo.limiteCartaoTotal) * 100)
  }, [resumo])

  const hasData =
    transactions.length > 0 ||
    (resumo?.faturas.length ?? 0) > 0 ||
    (resumo?.metas.length ?? 0) > 0 ||
    (resumo?.recorrencias.length ?? 0) > 0

  if (isLoading) {
    return <PageLoading />
  }

  if (!resumo) {
    return (
      <Alert variant="destructive">
        <IconAlertCircle className="size-4" />
        <AlertDescription>{error || 'Erro ao carregar dashboard'}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {!hasData ? (
        <Empty>
          <Empty.Icon>
            <IconAlertCircle className="size-8" />
          </Empty.Icon>
          <Empty.Title>Nenhum dado para exibir</Empty.Title>
          <Empty.Description>
            Quando houver movimentacoes no backend, o resumo financeiro aparecera aqui.
          </Empty.Description>
        </Empty>
      ) : (
        <>
          <SectionCards summary={summary} />

          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Limite de cartoes</CardTitle>
                <CardDescription>
                  Utilizado {formatarMoeda(resumo.limiteCartaoUsado)} de {formatarMoeda(resumo.limiteCartaoTotal)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={limitePercentual} />
                <p className="text-xs text-muted-foreground">{limitePercentual.toFixed(1)}% do limite utilizado</p>
              </CardContent>
            </Card>
          </div>

          <div className="px-4 lg:px-6">
            <ChartAreaInteractive monthlyData={monthly} transactions={transactions} />
          </div>

          <DataTable data={transactions.slice(0, 40)} />

          <div className="grid gap-4 px-4 lg:grid-cols-3 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconCreditCard className="size-5" />
                  Faturas em aberto
                </CardTitle>
                <CardDescription>{resumo.faturas.length} fatura(s)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {resumo.faturas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma fatura pendente.</p>
                ) : (
                  resumo.faturas.slice(0, 5).map((fatura) => (
                    <div key={fatura.id} className="flex items-center justify-between rounded-md border p-2">
                      <div>
                        <p className="text-sm font-medium">{fatura.cartao}</p>
                        <p className="text-xs text-muted-foreground">
                          {String(fatura.mes).padStart(2, '0')}/{fatura.ano}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatarMoeda(fatura.valor)}</p>
                        <Badge variant={faturaBadgeVariant(fatura.status)}>{fatura.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconTargetArrow className="size-5" />
                  Metas em andamento
                </CardTitle>
                <CardDescription>{resumo.metas.length} meta(s)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {resumo.metas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma meta ativa.</p>
                ) : (
                  resumo.metas.slice(0, 5).map((meta) => (
                    <div key={meta.id} className="space-y-1 rounded-md border p-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{meta.nome}</p>
                        <p className="text-xs text-muted-foreground">{Number(meta.percentualConcluido).toFixed(1)}%</p>
                      </div>
                      <Progress value={Number(meta.percentualConcluido)} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconRepeat className="size-5" />
                  Proximas recorrencias
                </CardTitle>
                <CardDescription>{resumo.recorrencias.length} recorrencia(s)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {resumo.recorrencias.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma recorrencia ativa.</p>
                ) : (
                  resumo.recorrencias.map((recorrencia) => (
                    <div key={recorrencia.id} className="rounded-md border p-2">
                      <p className="text-sm font-medium">{recorrencia.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {recorrencia.frequencia} - {formatarData(recorrencia.proximaExecucao)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
