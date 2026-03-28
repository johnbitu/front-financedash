"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { motion } from "framer-motion"
import { ArrowUpRight, Plus } from "lucide-react"

const categories = [
  { emoji: "🏠", name: "Moradia", spent: 2800, budget: 3000, color: "#CCFF00" },
  { emoji: "🍔", name: "Alimentacao", spent: 1250, budget: 1500, color: "#CCFF00" },
  { emoji: "🚗", name: "Transporte", spent: 680, budget: 800, color: "#CCFF00" },
  { emoji: "🎬", name: "Entretenimento", spent: 520, budget: 400, color: "#ef4444" },
  { emoji: "💊", name: "Saude", spent: 350, budget: 500, color: "#CCFF00" },
  { emoji: "👕", name: "Vestuario", spent: 420, budget: 600, color: "#CCFF00" },
  { emoji: "📚", name: "Educacao", spent: 280, budget: 400, color: "#CCFF00" },
  { emoji: "💅", name: "Beleza", spent: 180, budget: 200, color: "#CCFF00" },
  { emoji: "🎮", name: "Games", spent: 150, budget: 150, color: "#f59e0b" },
  { emoji: "📱", name: "Assinaturas", spent: 320, budget: 350, color: "#CCFF00" },
  { emoji: "🐕", name: "Pet", spent: 200, budget: 250, color: "#CCFF00" },
  { emoji: "✈️", name: "Viagens", spent: 0, budget: 500, color: "#CCFF00" },
]

export default function CategoriasPage() {
  const totalSpent = categories.reduce((acc, cat) => acc + cat.spent, 0)
  const totalBudget = categories.reduce((acc, cat) => acc + cat.budget, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Categorias</h1>
            <p className="text-[#A1A1AA] mt-1">Acompanhe seus gastos por categoria</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#CCFF00] rounded-xl text-sm text-black font-medium hover:bg-[#b8e600] transition-colors">
            <Plus className="w-4 h-4" />
            Nova Categoria
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6"
          >
            <p className="text-sm text-[#A1A1AA]">Total Gasto</p>
            <p className="text-3xl font-bold text-white mt-2">
              R$ {totalSpent.toLocaleString("pt-BR")}
            </p>
            <p className="text-sm text-[#A1A1AA] mt-2">
              de R$ {totalBudget.toLocaleString("pt-BR")} planejado
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6"
          >
            <p className="text-sm text-[#A1A1AA]">Dentro do Orcamento</p>
            <p className="text-3xl font-bold text-[#CCFF00] mt-2">
              {categories.filter((c) => c.spent <= c.budget).length}
            </p>
            <p className="text-sm text-[#A1A1AA] mt-2">de {categories.length} categorias</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6"
          >
            <p className="text-sm text-[#A1A1AA]">Orcamento Restante</p>
            <p className="text-3xl font-bold text-white mt-2">
              R$ {(totalBudget - totalSpent).toLocaleString("pt-BR")}
            </p>
            <p className="text-sm text-[#A1A1AA] mt-2">
              {((1 - totalSpent / totalBudget) * 100).toFixed(0)}% disponivel
            </p>
          </motion.div>
        </div>

        {/* Categories List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Todas as Categorias</h3>
            <button className="text-sm text-[#CCFF00] hover:underline flex items-center gap-1">
              Editar orcamentos
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {categories.map((category, index) => {
              const percentage = (category.spent / category.budget) * 100
              const isOverBudget = category.spent > category.budget
              const isWarning = percentage >= 90 && percentage <= 100

              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-[#CCFF00] transition-colors">
                          {category.name}
                        </p>
                        <p className="text-xs text-[#A1A1AA]">
                          R$ {category.spent.toLocaleString("pt-BR")} de R${" "}
                          {category.budget.toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          isOverBudget
                            ? "text-red-500"
                            : isWarning
                            ? "text-[#f59e0b]"
                            : "text-[#CCFF00]"
                        }`}
                      >
                        {percentage.toFixed(0)}%
                      </p>
                      <p className="text-xs text-[#A1A1AA]">
                        {isOverBudget
                          ? `R$ ${(category.spent - category.budget).toLocaleString(
                              "pt-BR"
                            )} acima`
                          : `R$ ${(category.budget - category.spent).toLocaleString(
                              "pt-BR"
                            )} restante`}
                      </p>
                    </div>
                  </div>

                  <div className="relative h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05 }}
                      className={`h-full rounded-full ${
                        isOverBudget
                          ? "bg-red-500"
                          : isWarning
                          ? "bg-[#f59e0b]"
                          : "bg-[#CCFF00]"
                      }`}
                    />
                    {isOverBudget && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage - 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.05 + 0.4 }}
                        className="absolute right-0 top-0 h-full bg-red-500/50 rounded-full"
                        style={{ right: 0 }}
                      />
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
