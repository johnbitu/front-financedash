"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { motion } from "framer-motion"
import {
  Search,
  MessageCircle,
  FileText,
  Video,
  Mail,
  Phone,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react"

const helpCategories = [
  {
    icon: FileText,
    title: "Documentacao",
    description: "Guias e tutoriais completos",
    articles: 45,
  },
  {
    icon: Video,
    title: "Video Aulas",
    description: "Aprenda com videos passo a passo",
    articles: 12,
  },
  {
    icon: MessageCircle,
    title: "FAQ",
    description: "Perguntas frequentes",
    articles: 28,
  },
]

const popularArticles = [
  { title: "Como adicionar uma nova conta bancaria?", views: 1250 },
  { title: "Configurando metas de orcamento", views: 980 },
  { title: "Integracao com bancos brasileiros", views: 856 },
  { title: "Exportando relatorios em PDF", views: 742 },
  { title: "Seguranca da sua conta", views: 698 },
]

export default function AjudaPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Central de Ajuda</h1>
          <p className="text-[#A1A1AA] mt-2">
            Como podemos ajudar voce hoje?
          </p>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Buscar na central de ajuda..."
            className="w-full pl-16 pr-6 py-5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl text-white placeholder:text-[#A1A1AA] outline-none focus:border-[#CCFF00]/30 transition-colors text-lg"
          />
        </motion.div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {helpCategories.map((category, index) => (
            <motion.button
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 text-left hover:border-[#CCFF00]/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#CCFF00]/10 flex items-center justify-center mb-4 group-hover:bg-[#CCFF00]/20 transition-colors">
                <category.icon className="w-6 h-6 text-[#CCFF00]" />
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-[#CCFF00] transition-colors">
                {category.title}
              </h3>
              <p className="text-sm text-[#A1A1AA] mt-1">{category.description}</p>
              <p className="text-xs text-[#CCFF00] mt-3">{category.articles} artigos</p>
            </motion.button>
          ))}
        </div>

        {/* Popular Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Artigos Populares</h3>
            <button className="text-sm text-[#CCFF00] hover:underline flex items-center gap-1">
              Ver todos
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {popularArticles.map((article) => (
              <button
                key={article.title}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#1a1a1a]/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-[#A1A1AA]" />
                  <span className="text-sm text-white">{article.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#A1A1AA]">
                    {article.views.toLocaleString()} visualizacoes
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#A1A1AA]" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Contact Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#CCFF00] flex items-center justify-center">
                <Mail className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Email</h3>
                <p className="text-sm text-[#A1A1AA]">Resposta em ate 24h</p>
              </div>
            </div>
            <button className="w-full py-3 bg-[#1a1a1a] rounded-xl text-sm text-white hover:bg-[#252525] transition-colors">
              suporte@pierre.finance
            </button>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#CCFF00] flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Chat ao Vivo</h3>
                <p className="text-sm text-[#A1A1AA]">Disponivel 9h - 18h</p>
              </div>
            </div>
            <button className="w-full py-3 bg-[#CCFF00] rounded-xl text-sm text-black font-medium hover:bg-[#b8e600] transition-colors">
              Iniciar Conversa
            </button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
