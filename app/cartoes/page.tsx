"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { CreditCard, Lock, Eye, EyeOff, Copy, Wifi } from "lucide-react"
import { useState } from "react"

const invoiceHistory = [
  { month: "Set", value: 2800 },
  { month: "Out", value: 3200 },
  { month: "Nov", value: 2950 },
  { month: "Dez", value: 4100 },
  { month: "Jan", value: 3500 },
  { month: "Fev", value: 2890 },
  { month: "Mar", value: 3250 },
]

const cards = [
  {
    id: 1,
    name: "Pierre Black",
    number: "5234 **** **** 8901",
    fullNumber: "5234 5678 9012 8901",
    expiry: "12/28",
    cvv: "***",
    limit: 15000,
    used: 3250,
    brand: "Mastercard",
    color: "from-[#1a1a1a] to-[#0a0a0a]",
    accent: "#CCFF00",
  },
  {
    id: 2,
    name: "Pierre Gold",
    number: "4532 **** **** 7654",
    fullNumber: "4532 1234 5678 7654",
    expiry: "08/27",
    cvv: "***",
    limit: 8000,
    used: 5200,
    brand: "Visa",
    color: "from-[#f59e0b] to-[#b45309]",
    accent: "#fcd34d",
  },
]

const recentPurchases = [
  { id: 1, merchant: "Apple Store", category: "Eletronicos", amount: 1299.00, date: "25 Mar", installments: "3x" },
  { id: 2, merchant: "iFood", category: "Alimentacao", amount: 78.50, date: "24 Mar", installments: null },
  { id: 3, merchant: "Spotify", category: "Assinaturas", amount: 21.90, date: "23 Mar", installments: null },
  { id: 4, merchant: "Uber", category: "Transporte", amount: 45.00, date: "22 Mar", installments: null },
  { id: 5, merchant: "Amazon", category: "Compras", amount: 450.00, date: "20 Mar", installments: "2x" },
]

export default function CartoesPage() {
  const [selectedCard, setSelectedCard] = useState(cards[0])
  const [showNumber, setShowNumber] = useState(false)

  const usedPercentage = (selectedCard.used / selectedCard.limit) * 100

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Cartoes</h1>
            <p className="text-[#A1A1AA] mt-1">Gerencie seus cartoes e faturas</p>
          </div>
          <button className="px-4 py-2.5 bg-[#CCFF00] rounded-xl text-sm text-black font-medium hover:bg-[#b8e600] transition-colors">
            + Solicitar Cartao
          </button>
        </div>

        {/* Cards Carousel */}
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedCard(card)}
              className={`shrink-0 w-80 h-48 bg-gradient-to-br ${card.color} rounded-2xl p-6 cursor-pointer border-2 transition-all ${
                selectedCard.id === card.id
                  ? "border-[#CCFF00]"
                  : "border-transparent hover:border-[#CCFF00]/30"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[#A1A1AA] text-sm">{card.name}</p>
                  <p className="text-white font-semibold mt-1">{card.brand}</p>
                </div>
                <Wifi className="w-6 h-6 text-[#A1A1AA] rotate-90" />
              </div>

              <div className="mt-8">
                <p className="text-white text-lg tracking-widest font-mono">
                  {showNumber && selectedCard.id === card.id
                    ? card.fullNumber
                    : card.number}
                </p>
              </div>

              <div className="mt-4 flex justify-between items-end">
                <div>
                  <p className="text-[#A1A1AA] text-xs">Validade</p>
                  <p className="text-white text-sm">{card.expiry}</p>
                </div>
                <div
                  className="w-10 h-10 rounded-full"
                  style={{ backgroundColor: card.accent }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Card Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNumber(!showNumber)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-sm text-white hover:border-[#CCFF00]/30 transition-colors"
          >
            {showNumber ? (
              <EyeOff className="w-4 h-4 text-[#A1A1AA]" />
            ) : (
              <Eye className="w-4 h-4 text-[#A1A1AA]" />
            )}
            {showNumber ? "Ocultar" : "Mostrar"} numero
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-sm text-white hover:border-[#CCFF00]/30 transition-colors">
            <Copy className="w-4 h-4 text-[#A1A1AA]" />
            Copiar numero
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-sm text-white hover:border-[#CCFF00]/30 transition-colors">
            <Lock className="w-4 h-4 text-[#A1A1AA]" />
            Bloquear cartao
          </button>
        </div>

        {/* Credit Limit Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Limite de Credito</h3>
              <p className="text-sm text-[#A1A1AA] mt-1">{selectedCard.name}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                R$ {selectedCard.used.toLocaleString("pt-BR")}
              </p>
              <p className="text-sm text-[#A1A1AA]">
                de R$ {selectedCard.limit.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="relative h-4 bg-[#1a1a1a] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usedPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                usedPercentage > 80
                  ? "bg-red-500"
                  : usedPercentage > 50
                  ? "bg-[#f59e0b]"
                  : "bg-[#CCFF00]"
              }`}
            />
          </div>

          <div className="flex justify-between mt-4">
            <div>
              <p className="text-sm text-[#A1A1AA]">Usado</p>
              <p className="text-lg font-semibold text-white">
                {usedPercentage.toFixed(0)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#A1A1AA]">Disponivel</p>
              <p className="text-lg font-semibold text-[#CCFF00]">
                R$ {(selectedCard.limit - selectedCard.used).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice History Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Historico de Faturas</h3>
                <p className="text-sm text-[#A1A1AA] mt-1">Ultimos 7 meses</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#A1A1AA]">Fatura atual</p>
                <p className="text-xl font-bold text-white">R$ 3.250</p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={invoiceHistory}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#A1A1AA", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#A1A1AA", fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => [
                      `R$ ${value.toLocaleString("pt-BR")}`,
                      "Fatura",
                    ]}
                    cursor={{ fill: "rgba(204, 255, 0, 0.1)" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#CCFF00"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Purchases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Compras Recentes</h3>

            <div className="space-y-4">
              {recentPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-4 bg-[#1a1a1a]/50 rounded-xl hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-[#A1A1AA]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{purchase.merchant}</p>
                      <p className="text-xs text-[#A1A1AA]">{purchase.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      R$ {purchase.amount.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-[#A1A1AA]">
                      {purchase.date}
                      {purchase.installments && (
                        <span className="ml-2 text-[#CCFF00]">{purchase.installments}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
