import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Car, CalendarCheck, Landmark, TrendingUp, Shield } from 'lucide-react'
import { StatsCard } from '@/components/shared/StatsCard'
import { BookingCard } from '@/components/shared/BookingCard'
import { CarCard } from '@/components/shared/CarCard'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { driversApi } from './driverApi'
import type { DriverDashboardStats } from '@/types'
import { useNavigate } from 'react-router-dom'

export function DriverDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DriverDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const data = await driversApi.getDashboard()
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
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <p className="text-muted-foreground">Manage your bookings and rentals</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Bookings" value={stats?.active_bookings || 0} icon={<CalendarCheck className="w-5 h-5" />} />
        <StatsCard title="Completed" value={stats?.completed_bookings || 0} icon={<TrendingUp className="w-5 h-5" />} />
        <StatsCard title="Pending" value={stats?.pending_bookings || 0} icon={<Car className="w-5 h-5" />} />
        <StatsCard
          title="Deposit Status"
          value={stats?.deposit_status || 'N/A'}
          icon={<Landmark className="w-5 h-5" />}
        />
      </div>

      {stats?.verification_progress !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Shield className="w-5 h-5" /> Verification Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-3">
              <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${Math.min(stats.verification_progress, 100)}%` }} />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{stats.verification_progress}% complete</p>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">Recommended Cars</h2>
        {stats?.recommended_cars && stats.recommended_cars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.recommended_cars.map((car) => (
              <CarCard key={car.id} car={car} onView={(id) => navigate(`/cars/${id}`)} onBook={(id) => navigate(`/driver/book?car=${id}`)} />
            ))}
          </div>
        ) : (
          <EmptyState title="No car suggestions" description="Cars will be recommended based on your preferences." />
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
        {stats?.recent_bookings && stats.recent_bookings.length > 0 ? (
          <div className="space-y-3">
            {stats.recent_bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} onView={(id) => navigate(`/driver/bookings/${id}`)} />
            ))}
          </div>
        ) : (
          <EmptyState title="No bookings yet" description="Browse available cars and make your first booking." />
        )}
      </div>
    </div>
  )
}
