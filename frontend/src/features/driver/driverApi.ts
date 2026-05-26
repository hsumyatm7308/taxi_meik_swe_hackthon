import apiClient from '@/api/client'
import type { DriverDashboardStats } from '@/types'

export const driversApi = {
  getDashboard: async (): Promise<DriverDashboardStats> => {
    const res = await apiClient.get('/driver/dashboard')
    return res.data.data
  },
}
