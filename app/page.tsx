"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { AccountCards } from "@/components/dashboard/account-cards"
import { SpendingHeatmap } from "@/components/dashboard/spending-heatmap"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react"
import type { DashboardResponse, TransactionSummary } from "@/lib/api-types"
import { getDashboardSummary, listTransactions } from "@/lib/finance-service"
import { ApiError } from "@/lib/api-client"

function toDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

function money(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
}

const EMPTY_DASHBOARD: DashboardResponse = {
  saldoTotal: 0,
  totalReceitas: 0,
  totalDespesas: 0,
  saldoMes: 0,
  limiteCartaoTotal: 0,
  limiteCartaoUsado: 0,
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse>(EMPTY_DASHBOARD)
  const [transactions, setTransactions] = useState<TransactionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [summary, txs] = await Promise.all([getDashboardSummary(), listTransactions()])
      setDashboard(summary)
      setTransactions(txs)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.payload?.message ?? "Nao foi possivel carregar o dashboard.")
      } else {
        setError("Erro inesperado ao carregar o dashboard.")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => toDate(b.dataTransacao).getTime() - toDate(a.dataTransacao).getTime())
      .slice(0, 5)
  }, [transactions])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 flex items-center justify-between">
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={() => void loadData()}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-200 text-sm hover:bg-red-500/30"
            >
              Tentar novamente
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 text-[#A1A1AA] flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Carregando dados...
          </div>
        ) : null}

        <AccountCards
          saldoTotal={Number(dashboard.saldoTotal ?? 0)}
          totalReceitas={Number(dashboard.totalReceitas ?? 0)}
          totalDespesas={Number(dashboard.totalDespesas ?? 0)}
          saldoMes={Number(dashboard.saldoMes ?? 0)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingChart transactions={transactions} />
          <SpendingHeatmap transactions={transactions} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Transacoes Recentes</h3>
            <a href="/transacoes" className="text-sm text-[#CCFF00] hover:underline flex items-center gap-1">
              Ver todas
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-sm text-[#A1A1AA] p-4 rounded-xl bg-[#1a1a1a]/50">
              Nenhuma transacao encontrada.
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => {
                const amount = Number(transaction.valor ?? 0)
                const positive = transaction.tipo === "RECEITA"
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-[#1a1a1a]/50 rounded-xl hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${positive ? "bg-[#CCFF00]/10" : "bg-[#1a1a1a]"}`}>
                        {positive ? (
                          <ArrowUpRight className="w-5 h-5 text-[#CCFF00]" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-[#A1A1AA]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{transaction.descricao}</p>
                        <p className="text-xs text-[#A1A1AA]">{transaction.categoryNome ?? "Sem categoria"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${positive ? "text-[#CCFF00]" : "text-white"}`}>
                        {positive ? "+" : "-"} R$ {money(Math.abs(amount))}
                      </p>
                      <p className="text-xs text-[#A1A1AA]">
                        {toDate(transaction.dataTransacao).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
