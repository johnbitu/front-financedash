import api from '@/lib/api'
import type { UserInfo } from '@/types'

export const usuarioService = {
  /**
   * Lista todos os usuarios (somente ADMIN)
   */
  async listar(): Promise<UserInfo[]> {
    const response = await api.get<UserInfo[]>('/users')
    return response.data
  },

  /**
   * Busca um usuario por ID (somente ADMIN)
   */
  async buscarPorId(id: number): Promise<UserInfo> {
    const users = await this.listar()
    const user = users.find((u) => u.id === id)
    if (!user) {
      throw new Error('Usuario nao encontrado')
    }
    return user
  },
}

export default usuarioService
