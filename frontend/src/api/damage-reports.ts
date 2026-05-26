import apiClient from './client'
import type { DamageReport } from '@/types'

export const damageReportsApi = {
  create: async (bookingId: number, data: FormData): Promise<DamageReport> => {
    const res = await apiClient.post(`/bookings/${bookingId}/damage-reports`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  getBookingReports: async (bookingId: number): Promise<DamageReport[]> => {
    const res = await apiClient.get(`/bookings/${bookingId}/damage-reports`)
    return res.data.data
  },

  getAll: async (): Promise<DamageReport[]> => {
    const res = await apiClient.get('/admin/damage-reports')
    return res.data.data
  },

  approve: async (id: number): Promise<DamageReport> => {
    const res = await apiClient.post(`/admin/damage-reports/${id}/approve`)
    return res.data.data
  },

  reject: async (id: number): Promise<DamageReport> => {
    const res = await apiClient.post(`/admin/damage-reports/${id}/reject`)
    return res.data.data
  },
}
