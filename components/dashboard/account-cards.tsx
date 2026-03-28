"use client"

import { motion } from "framer-motion"
import { Wallet, TrendingUp, CreditCard, Landmark, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface AccountCardsProps {
  saldoTotal: number
  totalReceitas: number
  totalDespesas: number
  saldoMes: number
}

const cardStyles = [
  { icon: Wallet, color: "from-[#CCFF00] to-[#22c55e]", label: "Saldo Total" },
  { icon: TrendingUp, color: "from-[#3b82f6] to-[#14b8a6]", label: "Receitas" },
  { icon: CreditCard, color: "from-[#f59e0b] to-[#ef4444]", label: "Despesas" },
  { icon: Landmark, color: "from-[#ec4899] to-[#f43f5e]", label: "Saldo do Mes" },
]

function money(value: number) {
  return `R$ ${Math.abs(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
}

export function AccountCards({
  saldoTotal,
  totalReceitas,
  totalDespesas,
  saldoMes,
}: AccountCardsProps) {
  const values = [saldoTotal, totalReceitas, totalDespesas * -1, saldoMes]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardStyles.map((card, index) => {
        const value = values[index]
        const positive = value >= 0

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 hover:border-[#CCFF00]/30 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  positive ? "bg-[#CCFF00]/10 text-[#CCFF00]" : "bg-red-500/10 text-red-400"
                }`}
              >
                {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {positive ? "Positivo" : "Negativo"}
              </div>
            </div>

            <p className="text-sm text-[#A1A1AA] mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${value < 0 ? "text-red-400" : "text-white"}`}>
              {value < 0 ? "- " : ""}
              {money(value)}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}
