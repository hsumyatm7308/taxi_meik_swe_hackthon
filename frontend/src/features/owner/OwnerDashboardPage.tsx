import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Car, CalendarCheck, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { StatsCard } from '@/components/shared/StatsCard'
import { BookingCard } from '@/components/shared/BookingCard'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ownersApi } from './ownerApi'
import type { OwnerDashboardStats } from '@/types'
import { formatCurrency } from '@/utils/format'

export function OwnerDashboardPage() {
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const data = await ownersApi.getDashboard()
      setStats(data)
    } catch {
      // handle
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSkeleton type="detail" count={4} />

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Owner Dashboard</h1>
        <p className="text-muted-foreground">Manage your cars and track earnings</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Cars" value={stats?.total_cars || 0} icon={<Car className="w-5 h-5" />} />
        <StatsCard title="Verified Cars" value={stats?.verified_cars || 0} icon={<TrendingUp className="w-5 h-5" />} />
        <StatsCard title="Active Rentals" value={stats?.active_rentals || 0} icon={<CalendarCheck className="w-5 h-5" />} />
        <StatsCard title="Pending Bookings" value={stats?.pending_bookings || 0} icon={<AlertCircle className="w-5 h-5" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">{formatCurrency(stats?.total_earnings || 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.monthly_earnings && stats.monthly_earnings.length > 0 ? (
              <div className="space-y-2">
                {stats.monthly_earnings.map((m) => (
                  <div key={m.month} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{m.month}</span>
                    <span className="font-medium">{formatCurrency(m.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No earnings data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
        {stats?.recent_bookings && stats.recent_bookings.length > 0 ? (
          <div className="space-y-3">
            {stats.recent_bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <EmptyState title="No bookings yet" description="Your booking requests will appear here" />
        )}
      </div>
    </div>
  )
}
