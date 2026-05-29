import apiClient from '@/api/client'
import type { Booking, Car, OwnerDashboardStats, PaginatedResponse } from '@/types'

const AGENCY_COMMISSION_RATE = 0.1

function getMonthLabels() {
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' })
  const now = new Date()

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    return formatter.format(date)
  })
}

function withProfit(stats: Omit<OwnerDashboardStats, 'agency_commission_rate' | 'agency_profit' | 'driver_total_paid' | 'owner_net_earning'>, bookings: Booking[] = stats.recent_bookings): OwnerDashboardStats {
  const payableBookings = bookings.filter((booking) => booking.status !== 'requested' && booking.status !== 'cancelled')
  const driverTotalPaid = payableBookings.reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0)
  const agencyProfit = Math.round(driverTotalPaid * AGENCY_COMMISSION_RATE)

  return {
    ...stats,
    agency_commission_rate: AGENCY_COMMISSION_RATE,
    driver_total_paid: driverTotalPaid,
    agency_profit: agencyProfit,
    owner_net_earning: driverTotalPaid - agencyProfit,
  }
}

export const ownersApi = {
  getDashboard: async (): Promise<OwnerDashboardStats> => {
    const [carsRes, bookingsRes] = await Promise.all([
      apiClient.get<{ data: Car[] }>('/owner/cars'),
      apiClient.get<PaginatedResponse<Booking>>('/owner/bookings'),
    ])

    const cars = carsRes.data.data || []
    const bookings = bookingsRes.data.data || []
    const activeStatuses = new Set(['accepted', 'payment_pending', 'active'])
    const monthLabels = getMonthLabels()
    const monthlyTotals = new Map(monthLabels.map((month) => [month, 0]))

    bookings.forEach((booking) => {
      if (booking.status === 'cancelled' || booking.status === 'requested') return

      const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(booking.created_at))
      if (monthlyTotals.has(month)) {
        monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + Number(booking.total_amount || 0))
      }
    })

    return withProfit({
      total_cars: cars.length,
      verified_cars: cars.filter((car) => car.status === 'verified' || car.admin_approval_status === 'APPROVED').length,
      active_rentals: bookings.filter((booking) => activeStatuses.has(String(booking.status))).length,
      pending_bookings: bookings.filter((booking) => booking.status === 'requested').length,
      total_earnings: bookings
        .filter((booking) => booking.status !== 'requested' && booking.status !== 'cancelled')
        .reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0),
      monthly_earnings: monthLabels.map((month) => ({ month, amount: monthlyTotals.get(month) || 0 })),
      recent_bookings: bookings.slice(0, 5),
    }, bookings)
  },

  getEarnings: async (): Promise<{ total: number; monthly: { month: string; amount: number }[] }> => {
    await new Promise(resolve => setTimeout(resolve, 600))
    return {
      total: 1250000,
      monthly: [
        { month: 'Jan', amount: 350000 },
        { month: 'Feb', amount: 420000 },
        { month: 'Mar', amount: 310000 },
        { month: 'Apr', amount: 580000 },
        { month: 'May', amount: 480000 },
        { month: 'Jun', amount: 620000 },
      ]
    }
  },
}
