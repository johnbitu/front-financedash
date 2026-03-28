"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { motion } from "framer-motion"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from "recharts"
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react"

const allocationData = [
  { name: "Renda Fixa", value: 40, color: "#CCFF00" },
  { name: "Acoes", value: 25, color: "#3b82f6" },
  { name: "FIIs", value: 20, color: "#ec4899" },
  { name: "Crypto", value: 10, color: "#f59e0b" },
  { name: "Caixa", value: 5, color: "#A1A1AA" },
]

const marketIndices = [
  {
    name: "Selic",
    value: "10.75%",
    change: 0,
    sparkline: [10.5, 10.5, 10.75, 10.75, 10.75, 10.75, 10.75],
  },
  {
    name: "CDI",
    value: "10.65%",
    change: 0.05,
    sparkline: [10.5, 10.55, 10.6, 10.6, 10.65, 10.65, 10.65],
  },
  {
    name: "Ibovespa",
    value: "128.450",
    change: 1.24,
    sparkline: [125000, 126500, 125800, 127200, 128000, 127800, 128450],
  },
  {
    name: "Dolar",
    value: "R$ 4.97",
    change: -0.32,
    sparkline: [5.05, 5.02, 5.0, 4.98, 4.99, 4.97, 4.97],
  },
  {
    name: "Bitcoin",
    value: "$67.450",
    change: 2.85,
    sparkline: [62000, 64000, 65500, 64800, 66200, 67000, 67450],
  },
  {
    name: "IPCA",
    value: "4.62%",
    change: -0.15,
    sparkline: [4.8, 4.75, 4.7, 4.68, 4.65, 4.63, 4.62],
  },
]

const investments = [
  { name: "Tesouro Selic 2029", type: "Renda Fixa", value: 15000, return: 12.5, allocation: 25 },
  { name: "CDB Banco XP 120%", type: "Renda Fixa", value: 10000, return: 14.2, allocation: 17 },
  { name: "PETR4", type: "Acoes", value: 8500, return: 8.7, allocation: 14 },
  { name: "VALE3", type: "Acoes", value: 6500, return: -2.3, allocation: 11 },
  { name: "XPML11", type: "FIIs", value: 7200, return: 6.8, allocation: 12 },
  { name: "HGLG11", type: "FIIs", value: 5000, return: 5.2, allocation: 8 },
  { name: "Bitcoin", type: "Crypto", value: 4500, return: 45.6, allocation: 8 },
  { name: "Ethereum", type: "Crypto", value: 2300, return: 32.1, allocation: 4 },
]

export default function InvestimentosPage() {
  const totalInvested = investments.reduce((acc, inv) => acc + inv.value, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Investimentos</h1>
            <p className="text-[#A1A1AA] mt-1">Gerencie sua carteira de investimentos</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-sm text-white hover:border-[#CCFF00]/30 transition-colors">
              Exportar
            </button>
            <button className="px-4 py-2.5 bg-[#CCFF00] rounded-xl text-sm text-black font-medium hover:bg-[#b8e600] transition-colors">
              + Novo Aporte
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6"
          >
            <p className="text-sm text-[#A1A1AA]">Patrimonio Total</p>
            <p className="text-3xl font-bold text-white mt-2">
              R$ {totalInvested.toLocaleString("pt-BR")}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[#CCFF00] text-sm font-medium">+12.5%</span>
              <span className="text-[#A1A1AA] text-sm">vs mes anterior</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6"
          >
            <p className="text-sm text-[#A1A1AA]">Rendimento Total</p>
            <p className="text-3xl font-bold text-[#CCFF00] mt-2">R$ 8.745</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[#CCFF00] text-sm font-medium">+18.2%</span>
              <span className="text-[#A1A1AA] text-sm">no ano</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6"
          >
            <p className="text-sm text-[#A1A1AA]">Dividendos Recebidos</p>
            <p className="text-3xl font-bold text-white mt-2">R$ 1.234</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[#CCFF00] text-sm font-medium">+5.8%</span>
              <span className="text-[#A1A1AA] text-sm">yield anual</span>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart - Asset Allocation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Alocacao de Ativos</h3>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">100%</p>
                  <p className="text-xs text-[#A1A1AA]">Alocado</p>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {allocationData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-white">{item.name}</span>
                  </div>
                  <span className="text-sm text-[#A1A1AA]">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Market Indices with Sparklines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 lg:col-span-2"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Indices de Mercado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketIndices.map((index) => (
                <div
                  key={index.name}
                  className="flex items-center justify-between p-4 bg-[#1a1a1a]/50 rounded-xl hover:bg-[#1a1a1a] transition-colors"
                >
                  <div>
                    <p className="text-sm text-[#A1A1AA]">{index.name}</p>
                    <p className="text-lg font-semibold text-white mt-1">{index.value}</p>
                    <div
                      className={`flex items-center gap-1 mt-1 text-sm ${
                        index.change >= 0 ? "text-[#CCFF00]" : "text-red-500"
                      }`}
                    >
                      {index.change >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {index.change >= 0 ? "+" : ""}
                      {index.change}%
                    </div>
                  </div>
                  <div className="w-20 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={index.sparkline.map((v, i) => ({ v, i }))}>
                        <Line
                          type="monotone"
                          dataKey="v"
                          stroke={index.change >= 0 ? "#CCFF00" : "#ef4444"}
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Investment List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Meus Ativos</h3>
            <button className="text-sm text-[#CCFF00] hover:underline flex items-center gap-1">
              Ver detalhes
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left text-xs text-[#A1A1AA] font-medium pb-4">Ativo</th>
                  <th className="text-left text-xs text-[#A1A1AA] font-medium pb-4">Tipo</th>
                  <th className="text-right text-xs text-[#A1A1AA] font-medium pb-4">Valor</th>
                  <th className="text-right text-xs text-[#A1A1AA] font-medium pb-4">Retorno</th>
                  <th className="text-right text-xs text-[#A1A1AA] font-medium pb-4">Alocacao</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv, i) => (
                  <tr
                    key={inv.name}
                    className="border-b border-[#1a1a1a]/50 hover:bg-[#1a1a1a]/30 transition-colors"
                  >
                    <td className="py-4">
                      <span className="text-sm font-medium text-white">{inv.name}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-[#A1A1AA]">{inv.type}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-sm text-white">
                        R$ {inv.value.toLocaleString("pt-BR")}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span
                        className={`text-sm font-medium ${
                          inv.return >= 0 ? "text-[#CCFF00]" : "text-red-500"
                        }`}
                      >
                        {inv.return >= 0 ? "+" : ""}
                        {inv.return}%
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#CCFF00] rounded-full"
                            style={{ width: `${inv.allocation}%` }}
                          />
                        </div>
                        <span className="text-sm text-[#A1A1AA] w-8">{inv.allocation}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
