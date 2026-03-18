"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { formatarMoeda } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
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

export function ChartAreaInteractive({ monthlyData }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("6m")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("3m")
    }
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    const ranges: Record<string, number> = {
      "6m": 6,
      "3m": 3,
      "2m": 2,
    }

    const size = ranges[timeRange] ?? 6
    return monthlyData.slice(-size).map((item) => ({
      ...item,
      saldo: item.receitas - item.despesas,
    }))
  }, [monthlyData, timeRange])

  const saldoPeriodo = filteredData.reduce((acc, item) => acc + item.saldo, 0)

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
            <ToggleGroupItem value="2m">2 meses</ToggleGroupItem>
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
              <SelectItem value="2m" className="rounded-lg">
                2 meses
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <AreaChart data={filteredData}>
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
            <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => formatarMoeda(Number(value))}
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
          </AreaChart>
        </ChartContainer>
        <p className="mt-3 text-xs text-muted-foreground">
          Saldo acumulado no periodo: <span className="font-medium">{formatarMoeda(saldoPeriodo)}</span>
        </p>
      </CardContent>
    </Card>
  )
}
