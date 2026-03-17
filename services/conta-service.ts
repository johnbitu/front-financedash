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

const mapBackendAccount = (account: BackendAccountSummary): ResumoConta => ({
  id: account.id,
  nome: account.nome,
  tipo: account.tipo as ResumoConta['tipo'],
  saldoAtual: Number(account.saldoInicial),
  ativo: account.ativo,
  criadoEm: account.criadoEm,
  atualizadoEm: account.criadoEm,
})

export const contaService = {
  /**
   * Lista todas as contas do usuário
   */
  async listar(): Promise<ResumoConta[]> {
    const response = await api.get<BackendAccountSummary[]>('/accounts')
    return response.data.map(mapBackendAccount)
  },

  /**
   * Busca uma conta por ID
   */
  async buscarPorId(id: number): Promise<ResumoConta> {
    const response = await api.get<BackendAccountSummary>(`/accounts/${id}`)
    return mapBackendAccount(response.data)
  },

  /**
   * Cria uma nova conta
   */
  async criar(data: CriarContaRequest): Promise<ResumoConta> {
    const payload = {
      nome: data.nome,
      tipo: data.tipo,
      saldoInicial: data.saldoInicial,
    }
    const response = await api.post<BackendAccountSummary>('/accounts', payload)
    return mapBackendAccount(response.data)
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
    return mapBackendAccount(response.data)
  },

  /**
   * Exclui uma conta
   */
  async excluir(id: number): Promise<void> {
    await api.delete(`/accounts/${id}`)
  },
}

export default contaService
