import apiClient from '@/api/client'
import type { OwnerDashboardStats } from '@/types'

export const ownersApi = {
  getDashboard: async (): Promise<OwnerDashboardStats> => {
    const res = await apiClient.get('/owner/dashboard')
    return res.data.data
  },

  getEarnings: async (): Promise<{ total: number; monthly: { month: string; amount: number }[] }> => {
    const res = await apiClient.get('/owner/earnings')
    return res.data.data
  },
}
