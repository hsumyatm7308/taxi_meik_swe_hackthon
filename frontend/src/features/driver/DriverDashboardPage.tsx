import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Car, CalendarCheck, Clock, DollarSign,
  ShieldAlert, ShieldEllipsis, XCircle,
  ArrowRight, Search, Star, MapPin,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatsCard } from '@/components/shared/StatsCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useAuth } from '@/providers'
import { MOCK_CARS, MOCK_BOOKINGS } from '@/mock-data/driver'
import { formatCurrency, formatDate } from '@/utils/format'

const KYC_REQUIRED = ['verified', 'trusted']

function KYCAlert({ status }: { status: string }) {
  if (KYC_REQUIRED.includes(status)) return null

  const config: Record<string, { icon: React.ReactNode; color: string; title: string; desc: string }> = {
    unverified: {
      icon: <ShieldAlert className="w-5 h-5" />,
      color: 'bg-amber-50 border-amber-200 text-amber-800',
      title: 'KYC Verification Required',
      desc: 'Please upload your documents to start booking cars.',
    },
    pending: {
      icon: <ShieldEllipsis className="w-5 h-5" />,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      title: 'KYC Under Review',
      desc: 'Your documents are being reviewed.',
    },
    rejected: {
      icon: <XCircle className="w-5 h-5" />,
      color: 'bg-red-50 border-red-200 text-red-800',
      title: 'KYC Verification Rejected',
      desc: 'Some documents were rejected. Please re-upload them.',
    },
  }

  const c = config[status] || config.unverified

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl border p-4 flex items-start gap-3 ${c.color}`}>
      <div className="shrink-0 mt-0.5">{c.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{c.title}</p>
        <p className="text-xs mt-0.5 opacity-80">{c.desc}</p>
        <Link to="/driver/documents">
          <Button size="sm" variant="link" className="h-auto p-0 mt-1 text-xs font-medium">
            Go to KYC <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

export function DriverDashboardPage() {
  const { user } = useAuth()

  const activeBookings = MOCK_BOOKINGS.filter((b) => b.status === 'active' || b.status === 'requested')
  const completedBookings = MOCK_BOOKINGS.filter((b) => b.status === 'completed')
  const totalSpent = MOCK_BOOKINGS.filter((b) => b.status === 'completed').reduce((sum, b) => sum + b.total_amount, 0)
  const recommendedCars = MOCK_CARS.filter((c) => c.is_available).slice(0, 4)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome back, {user?.name?.split(' ')[0] || 'Driver'}
        </p>
      </div>

      {user && <KYCAlert status={user.verification_status} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard title="Active Rentals" value={activeBookings.length} icon={<CalendarCheck className="w-5 h-5" />} />
        <StatsCard title="Completed" value={completedBookings.length} icon={<Clock className="w-5 h-5" />} />
        <StatsCard title="Total Spent" value={formatCurrency(totalSpent)} icon={<DollarSign className="w-5 h-5" />} />
        <StatsCard title="Cars Available" value={MOCK_CARS.filter((c) => c.is_available).length} icon={<Car className="w-5 h-5" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">My Bookings</h2>
              <Link to="/driver/bookings">
                <Button size="sm" variant="ghost" className="text-xs gap-1">
                  View All <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            {MOCK_BOOKINGS.length > 0 ? (
              <div className="space-y-3">
                {MOCK_BOOKINGS.slice(0, 5).map((b) => (
                  <div key={b.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{b.car?.brand} {b.car?.model}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(b.start_date)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold">{formatCurrency(b.total_amount)}</span>
                      <StatusBadge status={b.status} type="booking" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No bookings yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Recommended Cars</h2>
              <Link to="/driver/cars">
                <Button size="sm" variant="ghost" className="text-xs gap-1">
                  Browse All <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recommendedCars.map((car) => (
                <Link key={car.id} to={`/cars/${car.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-16 h-12 rounded-md bg-muted overflow-hidden shrink-0">
                    <img src={car.photos?.[0]?.url || ''} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{car.brand} {car.model}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {car.city}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-primary">{formatCurrency(car.daily_rate)}<span className="text-xs text-muted-foreground font-normal">/d</span></p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="font-semibold text-sm mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to="/driver/cars">
              <Button variant="outline" className="w-full h-20 flex-col gap-1 text-xs">
                <Search className="w-5 h-5" />
                Browse Cars
              </Button>
            </Link>
            <Link to="/driver/bookings">
              <Button variant="outline" className="w-full h-20 flex-col gap-1 text-xs">
                <CalendarCheck className="w-5 h-5" />
                My Booking
              </Button>
            </Link>
            {!KYC_REQUIRED.includes(user?.verification_status || '') && (
              <Link to="/driver/documents">
                <Button variant="outline" className="w-full h-20 flex-col gap-1 text-xs">
                  <ShieldAlert className="w-5 h-5" />
                  Complete KYC
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
