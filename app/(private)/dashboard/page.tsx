'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'

import { formatarMoeda, formatarData, tratarErro, cn } from '@/lib/utils'
import transacaoService from '@/services/transacao-service'
import type { ResumoDashboard, ResumoTransacao, DadoMensal } from '@/types'

const chartConfig = {
  receita: {
    label: 'Receita',
    color: '#16a34a',
  },
  despesa: {
    label: 'Despesa',
    color: '#dc2626',
  },
} satisfies ChartConfig

const MAX_VALUE = 5000

// Dados mock para quando a API não está disponível
const mockDashboardData: ResumoDashboard = {
  totalReceitas: 12500.0,
  totalDespesas: 8350.0,
  saldo: 4150.0,
  transacoesRecentes: [
    {
      id: 1,
      descricao: 'Salário',
      valor: 5000.0,
      tipo: 'RECEITA',
      data: '2026-03-15',
      contaId: 1,
      contaNome: 'Conta Corrente',
      categoriaId: 1,
      categoriaNome: 'Salário',
      criadoEm: '2026-03-15T10:00:00',
      atualizadoEm: '2026-03-15T10:00:00',
    },
    {
      id: 2,
      descricao: 'Aluguel',
      valor: 1500.0,
      tipo: 'DESPESA',
      data: '2026-03-10',
      contaId: 1,
      contaNome: 'Conta Corrente',
      categoriaId: 2,
      categoriaNome: 'Moradia',
      criadoEm: '2026-03-10T10:00:00',
      atualizadoEm: '2026-03-10T10:00:00',
    },
    {
      id: 3,
      descricao: 'Supermercado',
      valor: 450.0,
      tipo: 'DESPESA',
      data: '2026-03-08',
      contaId: 1,
      contaNome: 'Conta Corrente',
      categoriaId: 3,
      categoriaNome: 'Alimentação',
      criadoEm: '2026-03-08T10:00:00',
      atualizadoEm: '2026-03-08T10:00:00',
    },
    {
      id: 4,
      descricao: 'Freelance',
      valor: 2500.0,
      tipo: 'RECEITA',
      data: '2026-03-05',
      contaId: 2,
      contaNome: 'Poupança',
      categoriaId: 4,
      categoriaNome: 'Renda Extra',
      criadoEm: '2026-03-05T10:00:00',
      atualizadoEm: '2026-03-05T10:00:00',
    },
    {
      id: 5,
      descricao: 'Internet',
      valor: 120.0,
      tipo: 'DESPESA',
      data: '2026-03-01',
      contaId: 1,
      contaNome: 'Conta Corrente',
      categoriaId: 5,
      categoriaNome: 'Serviços',
      criadoEm: '2026-03-01T10:00:00',
      atualizadoEm: '2026-03-01T10:00:00',
    },
  ],
  dadosMensais: [
    { mes: 'Out', receitas: 8000, despesas: 6500 },
    { mes: 'Nov', receitas: 9500, despesas: 7200 },
    { mes: 'Dez', receitas: 15000, despesas: 12000 },
    { mes: 'Jan', receitas: 10000, despesas: 8000 },
    { mes: 'Fev', receitas: 11000, despesas: 7500 },
    { mes: 'Mar', receitas: 12500, despesas: 8350 },
  ],
}

export default function DashboardPage() {
  const [data, setData] = useState<ResumoDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await transacaoService.dashboard()
        setData(response)
        setUsingMockData(false)
      } catch (err) {
        // Se a API não está disponível, usa dados mock
        setData(mockDashboardData)
        setUsingMockData(true)
        setError(tratarErro(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertDescription>{error || 'Erro ao carregar dashboard'}</AlertDescription>
      </Alert>
    )
  }

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const chartData = data.dadosMensais.map((item) => ({
    month: item.mes,
    receita: item.receitas,
    despesa: item.despesas,
  }))
  const totalIncome = chartData.reduce((acc, item) => acc + item.receita, 0)
  const totalExpense = chartData.reduce((acc, item) => acc + item.despesa, 0)
  const balance = totalIncome - totalExpense
  const summaryText =
    totalIncome > totalExpense
      ? 'Receita total maior que despesas no período'
      : totalExpense > totalIncome
        ? 'Despesas maiores que receitas no período'
        : 'Receitas e despesas ficaram equilibradas no período'
  const firstMonthInPeriod = chartData.at(0)?.month?.toLowerCase()
  const lastMonthInPeriod = chartData.at(-1)?.month?.toLowerCase()
  const periodText =
    firstMonthInPeriod && lastMonthInPeriod
      ? `entre ${firstMonthInPeriod} e ${lastMonthInPeriod} de ${currentYear}`
      : `no ano de ${currentYear}`
  const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
  const periodLabel =
    firstMonthInPeriod && lastMonthInPeriod
      ? `${capitalize(firstMonthInPeriod)} - ${capitalize(lastMonthInPeriod)} ${currentYear}`
      : `${currentYear}`

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas finanças
        </p>
      </div>

      {usingMockData && (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            Exibindo dados de demonstração. Conecte ao backend para ver seus dados reais.
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Total Receitas"
          value={data.totalReceitas}
          icon={TrendingUp}
          variant="success"
        />
        <SummaryCard
          title="Total Despesas"
          value={data.totalDespesas}
          icon={TrendingDown}
          variant="destructive"
        />
        <SummaryCard
          title="Saldo"
          value={data.saldo}
          icon={Wallet}
          variant={data.saldo >= 0 ? 'default' : 'destructive'}
        />
      </div>

      {/* Gráfico e transações recentes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
            <CardDescription>{periodLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                barSize={18}
                barGap={6}
                data={chartData}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => String(value).slice(0, 3)}
                />
                <YAxis hide domain={[0, MAX_VALUE]} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar
                  dataKey="receita"
                  fill="var(--color-receita)"
                  radius={4}
                />
                <Bar
                  dataKey="despesa"
                  fill="var(--color-despesa)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="leading-none font-medium">{summaryText}</div>
            <div className="leading-none text-muted-foreground">
              Saldo acumulado de {formatarMoeda(balance)} {periodText}
            </div>
          </CardFooter>
        </Card>

        {/* Transações recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Últimas 5 transações realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.transacoesRecentes.map((transacao) => (
                  <TransactionRow key={transacao.id} transacao={transacao} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'success' | 'destructive'
}

function SummaryCard({ title, value, icon: Icon, variant = 'default' }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p
              className={cn(
                'text-2xl font-bold',
                variant === 'success' && 'text-green-600',
                variant === 'destructive' && 'text-red-600'
              )}
            >
              {formatarMoeda(value)}
            </p>
          </div>
          <div
            className={cn(
              'flex size-12 items-center justify-center rounded-full',
              variant === 'default' && 'bg-primary/10 text-primary',
              variant === 'success' && 'bg-green-100 text-green-600',
              variant === 'destructive' && 'bg-red-100 text-red-600'
            )}
          >
            <Icon className="size-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TransactionRow({ transacao }: { transacao: ResumoTransacao }) {
  const isReceita = transacao.tipo === 'RECEITA'

  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium">{transacao.descricao}</p>
          <p className="text-xs text-muted-foreground">{transacao.categoriaNome}</p>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatarData(transacao.data)}
      </TableCell>
      <TableCell
        className={cn(
          'text-right font-medium',
          isReceita ? 'text-green-600' : 'text-red-600'
        )}
      >
        {isReceita ? '+' : '-'} {formatarMoeda(transacao.valor)}
      </TableCell>
    </TableRow>
  )
}


