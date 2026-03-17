import api from '@/lib/api'
import type {
  CriarCategoriaRequest,
  AtualizarCategoriaRequest,
  ResumoCategoria,
  TipoCategoria,
} from '@/types'

export const categoriaService = {
  /**
   * Lista todas as categorias do usuário
   */
  async listar(tipo?: TipoCategoria): Promise<ResumoCategoria[]> {
    const params = tipo ? { tipo } : {}
    const response = await api.get<ResumoCategoria[]>('/categories', { params })
    return response.data
  },

  /**
   * Busca uma categoria por ID
   */
  async buscarPorId(id: number): Promise<ResumoCategoria> {
    const response = await api.get<ResumoCategoria>(`/categories/${id}`)
    return response.data
  },

  /**
   * Cria uma nova categoria
   */
  async criar(data: CriarCategoriaRequest): Promise<ResumoCategoria> {
    const response = await api.post<ResumoCategoria>('/categories', data)
    return response.data
  },

  /**
   * Atualiza uma categoria existente
   */
  async atualizar(id: number, data: AtualizarCategoriaRequest): Promise<ResumoCategoria> {
    const response = await api.put<ResumoCategoria>(`/categories/${id}`, data)
    return response.data
  },

  /**
   * Exclui uma categoria
   */
  async excluir(id: number): Promise<void> {
    await api.delete(`/categories/${id}`)
  },
}

export default categoriaService
