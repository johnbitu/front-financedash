"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { motion } from "framer-motion"
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Hash,
  TrendingUp,
  TrendingDown,
  Wallet,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api-client"
import type {
  AccountSummary,
  CardSummary,
  CategorySummary,
  CreateTransactionRequest,
  TransactionSummary,
  TransactionType,
} from "@/lib/api-types"
import {
  createTransaction,
  listAccounts,
  listCards,
  listCategories,
  listTransactions,
} from "@/lib/finance-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function toDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

function asMoney(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
}

function isoDateNow() {
  return new Date().toISOString().slice(0, 10)
}

interface TransactionFormState {
  accountId: string
  categoryId: string
  cardId: string
  tipo: TransactionType
  valor: string
  descricao: string
  dataTransacao: string
  observacao: string
}

const INITIAL_FORM: TransactionFormState = {
  accountId: "",
  categoryId: "",
  cardId: "",
  tipo: "DESPESA",
  valor: "",
  descricao: "",
  dataTransacao: isoDateNow(),
  observacao: "",
}

export default function TransacoesPage() {
  const [transactions, setTransactions] = useState<TransactionSummary[]>([])
  const [accounts, setAccounts] = useState<AccountSummary[]>([])
  const [categories, setCategories] = useState<CategorySummary[]>([])
  const [cards, setCards] = useState<CardSummary[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"ALL" | TransactionType>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createForm, setCreateForm] = useState<TransactionFormState>(INITIAL_FORM)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [txs, accs, cats, crds] = await Promise.all([
        listTransactions(),
        listAccounts(),
        listCategories(),
        listCards(),
      ])
      setTransactions(txs)
      setAccounts(accs.filter((acc) => acc.ativo))
      setCategories(cats)
      setCards(crds.filter((card) => card.ativo))
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.payload?.message ?? "Nao foi possivel carregar as transacoes.")
      } else {
        setError("Erro inesperado ao carregar as transacoes.")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const orderedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => toDate(b.dataTransacao).getTime() - toDate(a.dataTransacao).getTime())
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    return orderedTransactions.filter((tx) => {
      const matchesSearch =
        tx.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.categoryNome ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.accountNome ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === "ALL" ? true : tx.tipo === typeFilter
      return matchesSearch && matchesType
    })
  }, [orderedTransactions, searchQuery, typeFilter])

  const paginatedTransactions = useMemo(() => {
    return filteredTransactions.slice((currentPage - 1) * perPage, currentPage * perPage)
  }, [filteredTransactions, currentPage, perPage])

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / perPage))

  const summary = useMemo(() => {
    const total = filteredTransactions.length
    const totalDespesas = filteredTransactions
      .filter((tx) => tx.tipo === "DESPESA")
      .reduce((acc, tx) => acc + Math.abs(Number(tx.valor)), 0)
    const totalReceitas = filteredTransactions
      .filter((tx) => tx.tipo === "RECEITA")
      .reduce((acc, tx) => acc + Number(tx.valor), 0)
    const saldo = totalReceitas - totalDespesas
    return { total, totalDespesas, totalReceitas, saldo }
  }, [filteredTransactions])

  async function onCreateTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateError(null)
    setCreateLoading(true)

    const payload: CreateTransactionRequest = {
      accountId: Number(createForm.accountId),
      categoryId: createForm.categoryId ? Number(createForm.categoryId) : null,
      cardId: createForm.cardId ? Number(createForm.cardId) : null,
      tipo: createForm.tipo,
      valor: Number(createForm.valor),
      descricao: createForm.descricao.trim(),
      dataTransacao: createForm.dataTransacao,
      observacao: createForm.observacao.trim() || null,
    }

    try {
      await createTransaction(payload)
      setShowCreateDialog(false)
      setCreateForm(INITIAL_FORM)
      await loadData()
    } catch (err) {
      if (err instanceof ApiError) {
        setCreateError(err.payload?.message ?? "Nao foi possivel criar a transacao.")
      } else {
        setCreateError("Erro inesperado ao criar a transacao.")
      }
    } finally {
      setCreateLoading(false)
    }
  }

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

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Buscar transacoes..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-sm text-white placeholder:text-[#A1A1AA] outline-none focus:border-[#2a2a2a] transition-colors"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as "ALL" | TransactionType)
              setCurrentPage(1)
            }}
            className="px-3 py-2.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-sm text-white outline-none"
          >
            <option value="ALL">Todos os tipos</option>
            <option value="DESPESA">Despesas</option>
            <option value="RECEITA">Receitas</option>
          </select>

          <button
            onClick={() => void loadData()}
            className="p-2.5 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-[#A1A1AA] hover:text-white"
            title="Atualizar"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>

          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-[#e5e5e5] transition-colors ml-auto"
          >
            <Plus className="w-4 h-4" />
            Nova Transacao
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[#A1A1AA] text-xs mb-1">
              <Hash className="w-3 h-3" />
              Total
            </div>
            <p className="text-2xl font-bold text-white">{summary.total}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[#A1A1AA] text-xs mb-1">
              <TrendingDown className="w-3 h-3" />
              Despesas
            </div>
            <p className="text-2xl font-bold text-[#ef4444]">R$ {asMoney(summary.totalDespesas)}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[#A1A1AA] text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              Receitas
            </div>
            <p className="text-2xl font-bold text-[#22c55e]">R$ {asMoney(summary.totalReceitas)}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[#A1A1AA] text-xs mb-1">
              <Wallet className="w-3 h-3" />
              Saldo
            </div>
            <p className={cn("text-2xl font-bold", summary.saldo >= 0 ? "text-[#22c55e]" : "text-[#ef4444]")}>
              R$ {asMoney(Math.abs(summary.saldo))}
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left text-xs text-[#A1A1AA] font-medium uppercase tracking-wider px-6 py-4">Descricao</th>
                  <th className="text-left text-xs text-[#A1A1AA] font-medium uppercase tracking-wider px-6 py-4">Categoria</th>
                  <th className="text-left text-xs text-[#A1A1AA] font-medium uppercase tracking-wider px-6 py-4">Conta</th>
                  <th className="text-left text-xs text-[#A1A1AA] font-medium uppercase tracking-wider px-6 py-4">Data</th>
                  <th className="text-right text-xs text-[#A1A1AA] font-medium uppercase tracking-wider px-6 py-4">Valor</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-sm text-[#A1A1AA]">Carregando transacoes...</td>
                  </tr>
                ) : paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-sm text-[#A1A1AA]">
                      Nenhuma transacao encontrada para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((transaction) => {
                    const positive = transaction.tipo === "RECEITA"
                    const amount = Math.abs(Number(transaction.valor))
                    return (
                      <tr
                        key={transaction.id}
                        className="border-b border-[#1a1a1a]/50 hover:bg-[#111] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1a1a1a]">
                              {positive ? (
                                <ArrowUpRight className="w-4 h-4 text-[#22c55e]" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4 text-[#ef4444]" />
                              )}
                            </div>
                            <span className="text-sm text-white font-medium">{transaction.descricao}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#A1A1AA]">{transaction.categoryNome ?? "Sem categoria"}</td>
                        <td className="px-6 py-4 text-sm text-[#A1A1AA]">{transaction.accountNome ?? "Sem conta"}</td>
                        <td className="px-6 py-4 text-sm text-[#A1A1AA]">{toDate(transaction.dataTransacao).toLocaleDateString("pt-BR")}</td>
                        <td className={cn("px-6 py-4 text-right text-sm font-semibold", positive ? "text-[#22c55e]" : "text-white")}>
                          {positive ? "+" : "-"} R$ {asMoney(amount)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#A1A1AA]">Por pagina</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="appearance-none px-3 py-1.5 pr-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#A1A1AA]">
                Mostrando {(currentPage - 1) * perPage + 1} a {Math.min(currentPage * perPage, filteredTransactions.length)} de{" "}
                {filteredTransactions.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-[#1a1a1a] text-[#A1A1AA] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 text-sm text-white">{currentPage}</span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-[#1a1a1a] text-[#A1A1AA] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-[#0a0a0a] border border-[#1a1a1a] text-white sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Nova Transacao</DialogTitle>
            </DialogHeader>

            <form onSubmit={onCreateTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm text-[#A1A1AA]">Tipo</span>
                  <select
                    value={createForm.tipo}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, tipo: e.target.value as TransactionType }))}
                    className="w-full px-3 py-2.5 bg-black border border-[#1a1a1a] rounded-lg text-sm text-white"
                  >
                    <option value="DESPESA">Despesa</option>
                    <option value="RECEITA">Receita</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-[#A1A1AA]">Valor</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={createForm.valor}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, valor: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-black border border-[#1a1a1a] rounded-lg text-sm text-white"
                  />
                </label>
              </div>

              <label className="space-y-2 block">
                <span className="text-sm text-[#A1A1AA]">Descricao</span>
                <input
                  required
                  maxLength={255}
                  value={createForm.descricao}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, descricao: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-black border border-[#1a1a1a] rounded-lg text-sm text-white"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm text-[#A1A1AA]">Data</span>
                  <input
                    type="date"
                    required
                    value={createForm.dataTransacao}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, dataTransacao: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-black border border-[#1a1a1a] rounded-lg text-sm text-white"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-[#A1A1AA]">Conta</span>
                  <select
                    required
                    value={createForm.accountId}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, accountId: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-black border border-[#1a1a1a] rounded-lg text-sm text-white"
                  >
                    <option value="">Selecione...</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.nome}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm text-[#A1A1AA]">Categoria</span>
                  <select
                    value={createForm.categoryId}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-black border border-[#1a1a1a] rounded-lg text-sm text-white"
                  >
                    <option value="">Sem categoria</option>
                    {categories
                      .filter((cat) => cat.tipo === createForm.tipo)
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.nome}
                        </option>
                      ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-[#A1A1AA]">Cartao</span>
                  <select
                    value={createForm.cardId}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, cardId: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-black border border-[#1a1a1a] rounded-lg text-sm text-white"
                  >
                    <option value="">Sem cartao</option>
                    {cards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.nome}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="space-y-2 block">
                <span className="text-sm text-[#A1A1AA]">Observacao</span>
                <textarea
                  value={createForm.observacao}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, observacao: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-black border border-[#1a1a1a] rounded-lg text-sm text-white"
                />
              </label>

              {createError ? (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {createError}
                </div>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDialog(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#1a1a1a] text-[#A1A1AA] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2.5 rounded-lg bg-[#CCFF00] text-black font-semibold hover:bg-[#b8e600] disabled:opacity-70"
                >
                  {createLoading ? "Salvando..." : "Salvar transacao"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
