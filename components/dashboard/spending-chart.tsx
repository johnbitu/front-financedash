"use client"

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { TransactionSummary } from "@/lib/api-types"

interface SpendingChartProps {
  transactions: TransactionSummary[]
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

export function SpendingChart({ transactions }: SpendingChartProps) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthExpenses = transactions
    .filter((tx) => tx.tipo === "DESPESA")
    .filter((tx) => {
      const date = toDate(tx.dataTransacao)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

  const totalsByDay = new Map<number, number>()
  monthExpenses.forEach((tx) => {
    const day = toDate(tx.dataTransacao).getDate()
    totalsByDay.set(day, (totalsByDay.get(day) ?? 0) + Math.abs(Number(tx.valor)))
  })

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  let running = 0
  const data = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1
    running += totalsByDay.get(day) ?? 0
    return { name: String(day), gasto: running }
  })

  const totalSpent = running
  const meta = Math.max(totalSpent * 1.2, 1)

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Ritmo de Gastos</h3>
          <p className="text-sm text-[#A1A1AA] mt-1">Acumulado do mes atual</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#CCFF00]" />
            <span className="text-xs text-[#A1A1AA]">Gasto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#A1A1AA]/30" />
            <span className="text-xs text-[#A1A1AA]">Meta</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#CCFF00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#A1A1AA", fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A1A1AA", fontSize: 12 }}
              tickFormatter={(value) => `${Math.round(value / 1000)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "12px",
                color: "#fff",
              }}
              formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, ""]}
              labelStyle={{ color: "#A1A1AA" }}
            />
            <Area type="monotone" dataKey={() => meta} stroke="#A1A1AA" strokeWidth={1} strokeDasharray="5 5" fill="transparent" />
            <Area type="monotone" dataKey="gasto" stroke="#CCFF00" strokeWidth={2} fillOpacity={1} fill="url(#colorGasto)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl">
        <div>
          <p className="text-sm text-[#A1A1AA]">Total gasto</p>
          <p className="text-2xl font-bold text-white">
            R$ {totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#A1A1AA]">Restante da meta</p>
          <p className="text-2xl font-bold text-[#CCFF00]">
            R$ {Math.max(meta - totalSpent, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  )
}
