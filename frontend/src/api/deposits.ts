import apiClient from './client'
import type { Deposit } from '@/types'

export const depositsApi = {
  submitDeposit: async (bookingId: number, data: FormData): Promise<Deposit> => {
    const res = await apiClient.post(`/bookings/${bookingId}/deposits`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  getBookingDeposit: async (bookingId: number): Promise<Deposit> => {
    const res = await apiClient.get(`/bookings/${bookingId}/deposits`)
    return res.data.data
  },

  getMyDeposits: async (): Promise<Deposit[]> => {
    const res = await apiClient.get('/driver/deposits')
    return res.data.data
  },

  getOwnerDeposits: async (): Promise<Deposit[]> => {
    const res = await apiClient.get('/owner/deposits')
    return res.data.data
  },

  freezeDeposit: async (id: number): Promise<Deposit> => {
    const res = await apiClient.post(`/admin/deposits/${id}/freeze`)
    return res.data.data
  },

  releaseDeposit: async (id: number): Promise<Deposit> => {
    const res = await apiClient.post(`/admin/deposits/${id}/release`)
    return res.data.data
  },

  deductDeposit: async (id: number, amount: number, reason: string): Promise<Deposit> => {
    const res = await apiClient.post(`/admin/deposits/${id}/deduct`, { amount, reason })
    return res.data.data
  },
}
