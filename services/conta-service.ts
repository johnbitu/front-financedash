import api from '@/lib/api'
import type {
  CriarContaRequest,
  AtualizarContaRequest,
  ResumoConta,
} from '@/types'

interface BackendAccountSummary {
  id: number
  nome: string
  tipo: string
  saldoInicial: number
  ativo: boolean
  criadoEm: string
}

interface BackendAccountSummaryWithBalance extends BackendAccountSummary {
  saldoAtual: number
}

const mapBackendAccount = (
  account: BackendAccountSummary | BackendAccountSummaryWithBalance
): ResumoConta => ({
  id: account.id,
  nome: account.nome,
  tipo: account.tipo as ResumoConta['tipo'],
  saldoAtual: Number('saldoAtual' in account ? account.saldoAtual : account.saldoInicial),
  ativo: account.ativo,
  criadoEm: account.criadoEm,
  atualizadoEm: account.criadoEm,
})

const buscarComSaldo = async (
  id: number,
  fallback?: BackendAccountSummary
): Promise<ResumoConta> => {
  try {
    const response = await api.get<BackendAccountSummaryWithBalance>(`/accounts/${id}/saldo`)
    return mapBackendAccount(response.data)
  } catch (error) {
    if (fallback) {
      return mapBackendAccount(fallback)
    }
    throw error
  }
}

export const contaService = {
  /**
   * Lista todas as contas do usuário
   */
  async listar(): Promise<ResumoConta[]> {
    const response = await api.get<BackendAccountSummary[]>('/accounts')
    return Promise.all(response.data.map((account) => buscarComSaldo(account.id, account)))
  },

  /**
   * Busca uma conta por ID
   */
  async buscarPorId(id: number): Promise<ResumoConta> {
    return buscarComSaldo(id)
  },

  /**
   * Cria uma nova conta
   */
  async criar(data: CriarContaRequest): Promise<ResumoConta> {
    const payload = {
      nome: data.nome,
      tipo: data.tipo,
      saldoInicial: data.saldoInicial,
      ativo: data.ativo,
    }
    const response = await api.post<BackendAccountSummary>('/accounts', payload)
    return buscarComSaldo(response.data.id, response.data)
  },

  /**
   * Atualiza uma conta existente
   */
  async atualizar(id: number, data: AtualizarContaRequest): Promise<ResumoConta> {
    const payload = {
      nome: data.nome,
      tipo: data.tipo,
      saldoInicial: data.saldoInicial,
      ativo: data.ativo,
    }
    const response = await api.put<BackendAccountSummary>(`/accounts/${id}`, payload)
    return buscarComSaldo(response.data.id, response.data)
  },

  /**
   * Exclui uma conta
   */
  async excluir(id: number): Promise<void> {
    await api.delete(`/accounts/${id}`)
  },
}

export default contaService
