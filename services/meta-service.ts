import api from '@/lib/api'
import type {
  CriarMetaRequest,
  DepositarMetaRequest,
  ProgressoMeta,
  ResumoMeta,
  StatusMeta,
} from '@/types'

export const metaService = {
  async criar(data: CriarMetaRequest): Promise<ResumoMeta> {
    const response = await api.post<ResumoMeta>('/goals', data)
    return response.data
  },

  async listar(status?: StatusMeta): Promise<ResumoMeta[]> {
    const params = status ? { status } : {}
    const response = await api.get<ResumoMeta[]>('/goals', { params })
    return response.data
  },

  async buscarPorId(id: number): Promise<ResumoMeta> {
    const response = await api.get<ResumoMeta>(`/goals/${id}`)
    return response.data
  },

  async atualizar(id: number, data: CriarMetaRequest): Promise<ResumoMeta> {
    const response = await api.put<ResumoMeta>(`/goals/${id}`, data)
    return response.data
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/goals/${id}`)
  },

  async depositar(id: number, data: DepositarMetaRequest): Promise<ResumoMeta> {
    const response = await api.patch<ResumoMeta>(`/goals/${id}/depositar`, data)
    return response.data
  },

  async progresso(id: number): Promise<ProgressoMeta> {
    const response = await api.get<ProgressoMeta>(`/goals/${id}/progresso`)
    return response.data
  },
}

export default metaService
