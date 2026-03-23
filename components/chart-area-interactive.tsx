"use client"

import * as React from "react"
import { Area, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts"

import { formatarMoeda } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import type { ResumoTransacao } from "@/types"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type MonthlyData = {
  mes: string
  receitas: number
  despesas: number
}

interface ChartAreaInteractiveProps {
  monthlyData: MonthlyData[]
  transactions?: ResumoTransacao[]
}

const chartConfig = {
  receitas: {
    label: "Receitas",
    color: "var(--chart-2)",
  },
  despesas: {
    label: "Despesas",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

const dateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const dayLabel = (date: Date): string =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
    .format(date)
    .replace(".", "")

export function ChartAreaInteractive({ monthlyData, transactions = [] }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("6m")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("3m")
    }
  }, [isMobile])

  const dailyData = React.useMemo(() => {
    const totalsByDay = new Map<string, { receitas: number; despesas: number }>()

    transactions.forEach((tx) => {
      const key = tx.data.slice(0, 10)
      if (!totalsByDay.has(key)) {
        totalsByDay.set(key, { receitas: 0, despesas: 0 })
      }
      const slot = totalsByDay.get(key)!
      if (tx.tipo === "RECEITA") slot.receitas += tx.valor
      else slot.despesas += tx.valor
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return Array.from({ length: 30 }, (_, index) => {
      const current = new Date(today)
      current.setDate(today.getDate() - (29 - index))
      const key = dateKey(current)
      const values = totalsByDay.get(key) ?? { receitas: 0, despesas: 0 }

      return {
        label: dayLabel(current),
        receitas: values.receitas,
        despesas: values.despesas,
      }
    })
  }, [transactions])

  const filteredData = React.useMemo(() => {
    const ranges: Record<string, number> = {
      "6m": 6,
      "3m": 3,
    }

    if (timeRange === "30d") {
      return dailyData
    }

    const size = ranges[timeRange] ?? 6
    return monthlyData.slice(-size).map((item) => ({
      label: item.mes,
      receitas: item.receitas,
      despesas: item.despesas,
    }))
  }, [dailyData, monthlyData, timeRange])

  const saldoPeriodo = filteredData.reduce((acc, item) => acc + (item.receitas - item.despesas), 0)
  const yDomain = React.useMemo<[number, number]>(() => {
    const values = filteredData.flatMap((item) => [item.receitas, item.despesas])
    const min = Math.min(...values, 0)
    const max = Math.max(...values, 0)
    const range = max - min

    if (range === 0) {
      return [min - 1, max + 1]
    }

    const padding = range * 0.2
    return [min - padding, max + padding * 0.15]
  }, [filteredData])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Fluxo de caixa</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Receitas e despesas dos ultimos meses
          </span>
          <span className="@[540px]/card:hidden">Ultimos meses</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => {
              if (value) setTimeRange(value)
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="6m">6 meses</ToggleGroupItem>
            <ToggleGroupItem value="3m">3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 dias</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Selecionar periodo"
            >
              <SelectValue placeholder="6 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="6m" className="rounded-lg">
                6 meses
              </SelectItem>
              <SelectItem value="3m" className="rounded-lg">
                3 meses
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 dias
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <ComposedChart
            data={filteredData}
            margin={{ top: 8, right: 8, left: 8, bottom: 20 }}
          >
            <defs>
              <linearGradient id="fillReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-receitas)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-receitas)" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="fillDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-despesas)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-despesas)" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              height={36}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis hide domain={yDomain} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const label = name === "receitas" ? "Receita" : name === "despesas" ? "Despesa" : String(name)
                    return `${label} - ${formatarMoeda(Number(value))}`
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="despesas"
              type="natural"
              fill="url(#fillDespesas)"
              stroke="var(--color-despesas)"
              strokeWidth={2}
            />
            <Area
              dataKey="receitas"
              type="natural"
              fill="url(#fillReceitas)"
              stroke="var(--color-receitas)"
              strokeWidth={2}
            />
          </ComposedChart>
        </ChartContainer>
        <p className="mt-3 text-xs text-muted-foreground">
          Saldo acumulado no periodo: <span className="font-medium">{formatarMoeda(saldoPeriodo)}</span>
        </p>
      </CardContent>
    </Card>
  )
}
