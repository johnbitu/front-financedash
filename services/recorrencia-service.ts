import api from '@/lib/api'
import type {
  CriarRecorrenciaRequest,
  HistoricoRecorrencia,
  ResumoRecorrencia,
} from '@/types'

export const recorrenciaService = {
  async criar(data: CriarRecorrenciaRequest): Promise<ResumoRecorrencia> {
    const response = await api.post<ResumoRecorrencia>('/recurrences', data)
    return response.data
  },

  async listar(ativo?: boolean): Promise<ResumoRecorrencia[]> {
    const params = ativo === undefined ? {} : { ativo }
    const response = await api.get<ResumoRecorrencia[]>('/recurrences', { params })
    return response.data
  },

  async buscarPorId(id: number): Promise<ResumoRecorrencia> {
    const response = await api.get<ResumoRecorrencia>(`/recurrences/${id}`)
    return response.data
  },

  async atualizar(id: number, data: CriarRecorrenciaRequest): Promise<ResumoRecorrencia> {
    const response = await api.put<ResumoRecorrencia>(`/recurrences/${id}`, data)
    return response.data
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/recurrences/${id}`)
  },

  async executar(id: number): Promise<void> {
    await api.post(`/recurrences/${id}/executar`)
  },

  async historico(id: number): Promise<HistoricoRecorrencia> {
    const response = await api.get<HistoricoRecorrencia>(`/recurrences/${id}/historico`)
    return response.data
  },
}

export default recorrenciaService
