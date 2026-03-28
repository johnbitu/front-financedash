"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { motion } from "framer-motion"
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Palette,
  Smartphone,
  ChevronRight,
  Toggle,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const settingsSections = [
  {
    title: "Conta",
    items: [
      { icon: User, label: "Perfil", description: "Editar informacoes pessoais" },
      { icon: Shield, label: "Seguranca", description: "Senha e autenticacao" },
      { icon: Bell, label: "Notificacoes", description: "Preferencias de alertas" },
    ],
  },
  {
    title: "Preferencias",
    items: [
      { icon: Palette, label: "Aparencia", description: "Tema e personalizacao" },
      { icon: Globe, label: "Idioma e Regiao", description: "Portugues (Brasil)" },
      { icon: Smartphone, label: "Dispositivos", description: "Gerenciar conexoes" },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { icon: CreditCard, label: "Metodos de Pagamento", description: "Cartoes e contas" },
    ],
  },
]

export default function ConfiguracoesPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  })

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Configuracoes</h1>
          <p className="text-[#A1A1AA] mt-1">Gerencie suas preferencias</p>
        </div>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#1a1a1a]">
              <h3 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider">
                {section.title}
              </h3>
            </div>
            <div className="divide-y divide-[#1a1a1a]">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#1a1a1a]/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-[#A1A1AA]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-[#A1A1AA]">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#A1A1AA]" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Notification Toggles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-[#1a1a1a]">
            <h3 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider">
              Notificacoes Rapidas
            </h3>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {Object.entries(notifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-white capitalize">
                    Notificacoes por {key === "push" ? "Push" : key.toUpperCase()}
                  </p>
                  <p className="text-xs text-[#A1A1AA]">
                    Receber alertas via {key === "push" ? "aplicativo" : key}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof prev],
                    }))
                  }
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    value ? "bg-[#CCFF00]" : "bg-[#1a1a1a]"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 w-4 h-4 rounded-full transition-all",
                      value ? "left-7 bg-black" : "left-1 bg-[#A1A1AA]"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
