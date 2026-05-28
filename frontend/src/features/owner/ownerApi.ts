import apiClient from '@/api/client'
import type { OwnerDashboardStats } from '@/types'

export const ownersApi = {
  getDashboard: async (): Promise<OwnerDashboardStats> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600))
    
    return {
      total_cars: 4,
      verified_cars: 3,
      active_rentals: 2,
      pending_bookings: 1,
      total_earnings: 12000000,
      monthly_earnings: [
        { month: 'Jan', amount: 350000 },
        { month: 'Feb', amount: 420000 },
        { month: 'Mar', amount: 310000 },
        { month: 'Apr', amount: 580000 },
        { month: 'May', amount: 480000 },
        { month: 'Jun', amount: 620000 },
      ],
      recent_bookings: [
        {
          id: 101,
          car_id: 1,
          driver_id: 2,
          owner_id: 3,
          start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 150000,
          status: 'active',
          driver_notes: 'Need car early morning',
          owner_notes: null,
          rejection_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          car: {
            id: 1,
            owner_id: 3,
            brand: 'Toyota',
            model: 'Probox',
            year: 2014,
            color: 'White',
            license_plate: 'YGN-1A-1234',
            seat_capacity: 5,
            fuel_type: 'cng',
            car_type: 'sedan',
            transmission: 'Automatic',
            mileage: 120000,
            daily_rate: 35000,
            weekly_rate: 220000,
            monthly_rate: 800000,
            deposit_amount: 50000,
            location: 'Downtown Yangon',
            city: 'Yangon',
            description: 'Well maintained taxi',
            features: ['AC', 'Power Steering'],
            status: 'verified',
            is_available: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        },
        {
          id: 102,
          car_id: 2,
          driver_id: 4,
          owner_id: 3,
          start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 90000,
          status: 'requested',
          driver_notes: null,
          owner_notes: null,
          rejection_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          car: {
            id: 2,
            owner_id: 3,
            brand: 'Honda',
            model: 'Fit',
            year: 2016,
            color: 'Silver',
            license_plate: 'YGN-2B-5678',
            seat_capacity: 5,
            fuel_type: 'petrol',
            car_type: 'hatchback',
            transmission: 'Automatic',
            mileage: 85000,
            daily_rate: 45000,
            weekly_rate: null,
            monthly_rate: null,
            deposit_amount: 100000,
            location: 'Bahan',
            city: 'Yangon',
            description: 'Clean and comfortable',
            features: ['AC', 'Bluetooth', 'Reverse Camera'],
            status: 'verified',
            is_available: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        }
      ] as any
    }
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
