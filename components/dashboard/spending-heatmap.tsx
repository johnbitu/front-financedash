"use client"

import { useMemo } from "react"
import { ArrowUpRight } from "lucide-react"
import type { TransactionSummary } from "@/lib/api-types"
import { cn } from "@/lib/utils"

interface SpendingHeatmapProps {
  transactions: TransactionSummary[]
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

function getIntensityColor(value: number, maxValue: number) {
  if (value === 0) return "bg-[#1a1a1a]"
  const ratio = maxValue === 0 ? 0 : value / maxValue
  if (ratio < 0.2) return "bg-[#3d1515]"
  if (ratio < 0.4) return "bg-[#5c1f1f]"
  if (ratio < 0.6) return "bg-[#8b2525]"
  if (ratio < 0.8) return "bg-[#b33030]"
  return "bg-[#ef4444]"
}

export function SpendingHeatmap({ transactions }: SpendingHeatmapProps) {
  const { totalSpent, monthCells, maxSpending, dailyAverage } = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const expenses = transactions
      .filter((tx) => tx.tipo === "DESPESA")
      .filter((tx) => {
        const date = toDate(tx.dataTransacao)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })

    const groupedByDay = new Map<number, number>()
    expenses.forEach((tx) => {
      const day = toDate(tx.dataTransacao).getDate()
      groupedByDay.set(day, (groupedByDay.get(day) ?? 0) + Math.abs(Number(tx.valor)))
    })

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      value: groupedByDay.get(i + 1) ?? 0,
    }))

    const total = monthDays.reduce((sum, item) => sum + item.value, 0)
    const daysWithSpending = monthDays.filter((item) => item.value > 0).length
    const average = daysWithSpending > 0 ? total / daysWithSpending : 0
    const max = monthDays.reduce((prev, item) => (item.value > prev.value ? item : prev), monthDays[0] ?? { day: 0, value: 0 })

    return {
      totalSpent: total,
      monthCells: monthDays,
      maxSpending: max,
      dailyAverage: average,
    }
  }, [transactions])

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-[#A1A1AA] uppercase tracking-wide">Mapa de Calor</span>
        <button className="text-sm text-[#A1A1AA] hover:text-white flex items-center gap-1 transition-colors">
          ver mais <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-4xl font-bold text-white">
          {totalSpent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </h2>
        <p className="text-sm text-[#A1A1AA] mt-1">
          Media diaria:{" "}
          <span className="text-white font-medium">
            {dailyAverage.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {monthCells.map((cell) => (
          <div
            key={cell.day}
            className={cn(
              "h-10 rounded-lg flex items-center justify-center text-sm text-[#d4d4d8]",
              getIntensityColor(cell.value, maxSpending.value),
            )}
            title={`Dia ${cell.day}: R$ ${cell.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          >
            {cell.day}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#A1A1AA]">Menos</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-[#1a1a1a]" />
            <div className="w-4 h-4 rounded bg-[#3d1515]" />
            <div className="w-4 h-4 rounded bg-[#5c1f1f]" />
            <div className="w-4 h-4 rounded bg-[#8b2525]" />
            <div className="w-4 h-4 rounded bg-[#ef4444]" />
          </div>
          <span className="text-xs text-[#A1A1AA]">Mais</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-[#A1A1AA]">Maior gasto</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#ef4444]">
            {maxSpending.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
          <span className="text-sm text-[#A1A1AA]">dia {maxSpending.day}</span>
        </div>
      </div>
    </div>
  )
}
