import api from '@/lib/api'
import type { DashboardResumoResponse } from '@/types'

export const dashboardService = {
  async resumo(): Promise<DashboardResumoResponse> {
    const response = await api.get<DashboardResumoResponse>('/dashboard/resumo')
    return response.data
  },
}

export default dashboardService
