import api from '@/lib/api'
import type {
  AtualizarFaturaCartaoRequest,
  CriarCartaoRequest,
  ResumoCartao,
  ResumoFaturaCartao,
} from '@/types'

export const cartaoService = {
  async criar(data: CriarCartaoRequest): Promise<ResumoCartao> {
    const response = await api.post<ResumoCartao>('/cards', data)
    return response.data
  },

  async listar(): Promise<ResumoCartao[]> {
    const response = await api.get<ResumoCartao[]>('/cards')
    return response.data
  },

  async buscarPorId(id: number): Promise<ResumoCartao> {
    const response = await api.get<ResumoCartao>(`/cards/${id}`)
    return response.data
  },

  async atualizar(id: number, data: CriarCartaoRequest): Promise<ResumoCartao> {
    const response = await api.put<ResumoCartao>(`/cards/${id}`, data)
    return response.data
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/cards/${id}`)
  },

  async listarFaturas(cardId: number): Promise<ResumoFaturaCartao[]> {
    const response = await api.get<ResumoFaturaCartao[]>(`/cards/${cardId}/invoices`)
    return response.data
  },

  async buscarFatura(cardId: number, invoiceId: number): Promise<ResumoFaturaCartao> {
    const response = await api.get<ResumoFaturaCartao>(`/cards/${cardId}/invoices/${invoiceId}`)
    return response.data
  },

  async fecharFatura(cardId: number, invoiceId: number): Promise<ResumoFaturaCartao> {
    const response = await api.patch<ResumoFaturaCartao>(`/cards/${cardId}/invoices/${invoiceId}/fechar`)
    return response.data
  },

  async pagarFatura(cardId: number, invoiceId: number): Promise<ResumoFaturaCartao> {
    const response = await api.patch<ResumoFaturaCartao>(`/cards/${cardId}/invoices/${invoiceId}/pagar`)
    return response.data
  },

  async atualizarFatura(
    cardId: number,
    invoiceId: number,
    data: AtualizarFaturaCartaoRequest
  ): Promise<ResumoFaturaCartao> {
    const response = await api.put<ResumoFaturaCartao>(`/cards/${cardId}/invoices/${invoiceId}`, data)
    return response.data
  },

  async excluirFatura(cardId: number, invoiceId: number): Promise<void> {
    await api.delete(`/cards/${cardId}/invoices/${invoiceId}`)
  },
}

export default cartaoService
