import api from '@/lib/api'
import type {
  LoginRequest,
  LoginResponse,
  RegistroRequest,
  RefreshTokenResponse,
  RefreshTokenRequest,
  UserInfo,
} from '@/types'

export const authService = {
  /**
   * Realiza login do usuário
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  /**
   * Registra um novo usuário
   */
  async register(data: RegistroRequest): Promise<UserInfo> {
    const response = await api.post<UserInfo>('/auth/register', data)
    return response.data
  },

  /**
   * Renova o token de acesso
   */
  async refresh(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh', data)
    return response.data
  },

  /**
   * Realiza logout (invalidação no servidor, se houver)
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignora erros de logout no servidor
    }
  },
}

export default authService

