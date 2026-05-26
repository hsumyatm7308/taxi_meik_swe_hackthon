import apiClient from './client'
import type { Inspection } from '@/types'

export const inspectionsApi = {
  create: async (bookingId: number, data: FormData): Promise<Inspection> => {
    const res = await apiClient.post(`/bookings/${bookingId}/inspections`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  getBookingInspections: async (bookingId: number): Promise<{ pre: Inspection | null; post: Inspection | null }> => {
    const res = await apiClient.get(`/bookings/${bookingId}/inspections`)
    return res.data.data
  },

  signInspection: async (id: number): Promise<Inspection> => {
    const res = await apiClient.post(`/inspections/${id}/sign`)
    return res.data.data
  },
}
