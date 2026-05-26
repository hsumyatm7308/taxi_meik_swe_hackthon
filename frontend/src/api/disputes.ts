import apiClient from './client'
import type { Dispute, DisputeTimeline } from '@/types'

export const disputesApi = {
  create: async (bookingId: number, data: { reason: string }): Promise<Dispute> => {
    const res = await apiClient.post(`/bookings/${bookingId}/disputes`, data)
    return res.data.data
  },

  getBookingDisputes: async (bookingId: number): Promise<Dispute[]> => {
    const res = await apiClient.get(`/bookings/${bookingId}/disputes`)
    return res.data.data
  },

  getAll: async (): Promise<Dispute[]> => {
    const res = await apiClient.get('/admin/disputes')
    return res.data.data
  },

  getById: async (id: number): Promise<Dispute> => {
    const res = await apiClient.get(`/disputes/${id}`)
    return res.data.data
  },

  getTimeline: async (disputeId: number): Promise<DisputeTimeline[]> => {
    const res = await apiClient.get(`/disputes/${disputeId}/timeline`)
    return res.data.data
  },

  resolve: async (id: number, data: { resolution: string; deposit_deduction?: number }): Promise<Dispute> => {
    const res = await apiClient.post(`/admin/disputes/${id}/resolve`, data)
    return res.data.data
  },

  addNote: async (disputeId: number, notes: string): Promise<DisputeTimeline> => {
    const res = await apiClient.post(`/disputes/${disputeId}/notes`, { notes })
    return res.data.data
  },
}
