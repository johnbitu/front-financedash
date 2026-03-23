import api from '@/lib/api'
import contaService from '@/services/conta-service'
import type {
  CriarTransacaoRequest,
  AtualizarTransacaoRequest,
  ResumoTransacao,
  FiltroTransacao,
  PaginatedResponse,
  ResumoDashboard,
} from '@/types'

interface BackendTransaction {
  id: number
  tipo: 'RECEITA' | 'DESPESA'
  valor: number
  descricao: string
  dataTransacao: string
  observacao?: string
  criadoEm: string
  accountId: number
  accountNome: string
  categoryId: number
  categoryNome: string
}

interface BackendCreateOrUpdateTransactionRequest {
  accountId: number
  categoryId?: number
  tipo: string
  valor: number
  descricao: string
  dataTransacao: string
  observacao?: string
}

const monthLabel = (dateString: string): string => {
  const date = new Date(`${dateString}T00:00:00`)
  return new Intl.DateTimeFormat('pt-BR', { month: 'short' })
    .format(date)
    .replace('.', '')
}

const yearMonthKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const mapBackendTransaction = (tx: BackendTransaction): ResumoTransacao => ({
  id: tx.id,
  tipo: tx.tipo,
  valor: tx.valor,
  descricao: tx.descricao,
  data: tx.dataTransacao,
  observacoes: tx.observacao,
  criadoEm: tx.criadoEm,
  atualizadoEm: tx.criadoEm,
  contaId: tx.accountId,
  contaNome: tx.accountNome,
  categoriaId: tx.categoryId,
  categoriaNome: tx.categoryNome,
})

const mapRequestToBackend = (
  data: CriarTransacaoRequest | AtualizarTransacaoRequest
): BackendCreateOrUpdateTransactionRequest => ({
  accountId: data.contaId as number,
  categoryId: data.categoriaId,
  tipo: data.tipo as string,
  valor: data.valor as number,
  descricao: data.descricao as string,
  dataTransacao: data.data as string,
  observacao: data.observacoes,
})

const normalizeListResponse = (
  data: PaginatedResponse<BackendTransaction> | BackendTransaction[]
): PaginatedResponse<ResumoTransacao> => {
  if (Array.isArray(data)) {
    const mapped = data.map(mapBackendTransaction)
    return {
      content: mapped,
      totalElements: mapped.length,
      totalPages: 1,
      size: mapped.length,
      number: 0,
      first: true,
      last: true,
    }
  }
  return {
    ...data,
    content: data.content.map(mapBackendTransaction),
  }
}

export const transacaoService = {
  /**
   * Lista transações com filtros e paginação
   */
  async listar(filtros?: FiltroTransacao): Promise<PaginatedResponse<ResumoTransacao>> {
    const params: Record<string, string | number | undefined> = {}
    
    if (filtros) {
      if (filtros.tipo) params.tipo = filtros.tipo
      if (filtros.contaId) params.contaId = filtros.contaId
      if (filtros.categoriaId) params.categoriaId = filtros.categoriaId
      if (filtros.dataInicio) params.dataInicio = filtros.dataInicio
      if (filtros.dataFim) params.dataFim = filtros.dataFim
      if (filtros.page !== undefined) params.page = filtros.page
      if (filtros.size !== undefined) params.size = filtros.size
    }

    const response = await api.get<PaginatedResponse<BackendTransaction> | BackendTransaction[]>('/transactions', { params })
    return normalizeListResponse(response.data)
  },

  /**
   * Busca uma transação por ID
   */
  async buscarPorId(id: number): Promise<ResumoTransacao> {
    const response = await api.get<BackendTransaction>(`/transactions/${id}`)
    return mapBackendTransaction(response.data)
  },

  /**
   * Cria uma nova transação
   */
  async criar(data: CriarTransacaoRequest): Promise<ResumoTransacao> {
    const payload = mapRequestToBackend(data)
    const response = await api.post<BackendTransaction>('/transactions', payload)
    return mapBackendTransaction(response.data)
  },

  /**
   * Atualiza uma transação existente
   */
  async atualizar(id: number, data: AtualizarTransacaoRequest): Promise<ResumoTransacao> {
    const payload = mapRequestToBackend(data)
    const response = await api.put<BackendTransaction>(`/transactions/${id}`, payload)
    return mapBackendTransaction(response.data)
  },

  /**
   * Exclui uma transação
   */
  async excluir(id: number): Promise<void> {
    await api.delete(`/transactions/${id}`)
  },

  /**
   * Busca dados do dashboard (resumo financeiro)
   */
  async dashboard(): Promise<ResumoDashboard> {
    const [transacoesResult, contas] = await Promise.all([
      this.listar({ size: 1000 }),
      contaService.listar(),
    ])
    const activeAccountIds = new Set(
      contas.filter((conta) => conta.ativo).map((conta) => conta.id)
    )
    const content = transacoesResult.content.filter((t) =>
      activeAccountIds.has(t.contaId)
    )

    const ordered = [...content].sort((a, b) => b.data.localeCompare(a.data))
    const transacoesRecentes = ordered.slice(0, 5)

    const totalReceitas = content
      .filter((t) => t.tipo === 'RECEITA')
      .reduce((sum, t) => sum + t.valor, 0)
    const totalDespesas = content
      .filter((t) => t.tipo === 'DESPESA')
      .reduce((sum, t) => sum + t.valor, 0)

    const monthlyMap = new Map<string, { receitas: number; despesas: number }>()
    content.forEach((t) => {
      const key = t.data.slice(0, 7)
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { receitas: 0, despesas: 0 })
      }
      const slot = monthlyMap.get(key)!
      if (t.tipo === 'RECEITA') slot.receitas += t.valor
      else slot.despesas += t.valor
    })

    const mesesParaExibir = 6
    const hoje = new Date()
    const dadosMensais = Array.from({ length: mesesParaExibir }, (_, index) => {
      const date = new Date(hoje.getFullYear(), hoje.getMonth() - (mesesParaExibir - 1 - index), 1)
      const key = yearMonthKey(date)
      const values = monthlyMap.get(key) ?? { receitas: 0, despesas: 0 }

      return {
        mes: monthLabel(`${key}-01`),
        receitas: values.receitas,
        despesas: values.despesas,
      }
    })

    return {
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
      transacoesRecentes,
      dadosMensais,
    }
  },
}

export default transacaoService
