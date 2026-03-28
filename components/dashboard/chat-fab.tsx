"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Sparkles } from "lucide-react"

export function ChatFab() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#CCFF00] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Pierre AI</h3>
                  <p className="text-xs text-[#A1A1AA]">Assistente financeiro</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                <X className="w-4 h-4 text-[#A1A1AA]" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-md bg-[#CCFF00] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3 text-black" />
                </div>
                <div className="bg-[#1a1a1a] rounded-xl rounded-tl-md p-3 max-w-[85%]">
                  <p className="text-sm text-white">
                    Ola! Sou o Pierre, seu assistente financeiro. Como posso ajudar voce hoje?
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-md bg-[#CCFF00] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3 text-black" />
                </div>
                <div className="bg-[#1a1a1a] rounded-xl rounded-tl-md p-3 max-w-[85%]">
                  <p className="text-sm text-white">
                    Voce gastou R$ 2.450 este mes, 15% a menos que o mes passado.
                  </p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#1a1a1a]">
              <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-4 py-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-[#A1A1AA] outline-none"
                />
                <button className="p-2 rounded-lg bg-[#CCFF00] hover:bg-[#b8e600] transition-colors">
                  <Send className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#CCFF00] flex items-center justify-center shadow-lg shadow-[#CCFF00]/20 z-50"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-black" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6 text-black" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}
