import apiClient from './client'
import type { Review } from '@/types'

export const reviewsApi = {
  create: async (bookingId: number, data: { rating: number; comment?: string }): Promise<Review> => {
    const res = await apiClient.post(`/bookings/${bookingId}/reviews`, data)
    return res.data.data
  },

  getBookingReviews: async (bookingId: number): Promise<Review[]> => {
    const res = await apiClient.get(`/bookings/${bookingId}/reviews`)
    return res.data.data
  },

  getMyReviews: async (): Promise<Review[]> => {
    const res = await apiClient.get('/my-reviews')
    return res.data.data
  },

  getOwnerReviews: async (): Promise<Review[]> => {
    const res = await apiClient.get('/owner/reviews')
    return res.data.data
  },
}
