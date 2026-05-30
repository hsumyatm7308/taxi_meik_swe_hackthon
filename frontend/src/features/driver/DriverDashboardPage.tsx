import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  CalendarCheck, Clock, DollarSign,
  ShieldAlert, ShieldEllipsis, XCircle,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/shared/StatsCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { bookingsApi, usersApi } from '@/api'
import { useAuth } from '@/providers'
import { isKycApproved, normalizeVerificationStatus } from '@/constants'
import type { Booking } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'

function getRecentMonthLabels() {
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' })
  const now = new Date()

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    return formatter.format(date)
  })
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getInclusiveRentalDays(startDate: string, endDate: string) {
  const start = startOfDay(new Date(startDate))
  const end = startOfDay(new Date(endDate))
  const diff = Math.max(0, end.getTime() - start.getTime())
  return Math.max(1, Math.round(diff / 86400000) + 1)
}

function getDailyBookingAmount(booking: Booking) {
  const carRate = booking.car?.rental_price || booking.car?.daily_rate
  if (carRate) return Number(carRate)

  return Number(booking.total_amount || 0) / getInclusiveRentalDays(booking.start_date, booking.end_date)
}

function isSameMonth(date: Date, monthIndex: number, year: number) {
  return date.getMonth() === monthIndex && date.getFullYear() === year
}

function KYCAlert({ status }: { status: string }) {
  const normalizedStatus = normalizeVerificationStatus(status)
  if (isKycApproved(normalizedStatus)) return null

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

  const c = config[normalizedStatus] || config.unverified

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
  const [bookings, setBookings] = useState<Booking[]>([])
  const [kycStatus, setKycStatus] = useState(user?.verification_status || 'unverified')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setKycStatus(user?.verification_status || 'unverified')
  }, [user?.verification_status])

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        const [bookingsRes, kycRes] = await Promise.allSettled([
          bookingsApi.getMyBookings(),
          usersApi.getKycStatus(),
        ])

        if (bookingsRes.status === 'fulfilled') {
          setBookings(bookingsRes.value.data || [])
        } else {
          setBookings([])
        }

        if (kycRes.status === 'fulfilled') {
          setKycStatus(kycRes.value?.kycStatus || user?.verification_status || 'unverified')
        }
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [user?.verification_status])

  const payableBookings = bookings.filter((booking) => !['requested', 'cancelled'].includes(booking.status))
  const today = startOfDay(new Date())
  const thisMonth = today.getMonth()
  const thisYear = today.getFullYear()
  const todayAmountToOwner = bookings
    .filter((booking) => ['accepted', 'payment_pending', 'active'].includes(booking.status))
    .filter((booking) => {
      const start = startOfDay(new Date(booking.start_date))
      const end = startOfDay(new Date(booking.end_date))
      return start <= today && today <= end
    })
    .reduce((sum, booking) => sum + getDailyBookingAmount(booking), 0)
  const monthAmount = payableBookings
    .filter((booking) => isSameMonth(new Date(booking.created_at), thisMonth, thisYear))
    .reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0)
  const yearAmount = payableBookings
    .filter((booking) => new Date(booking.created_at).getFullYear() === thisYear)
    .reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0)
  const monthLabels = getRecentMonthLabels()
  const monthlyAmounts = monthLabels.map((month) => ({
    month,
    amount: payableBookings.reduce((sum, booking) => {
      const bookingMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(booking.created_at))
      return bookingMonth === month ? sum + Number(booking.total_amount || 0) : sum
    }, 0),
  }))
  const totalBookings = bookings.length

  if (loading) return <LoadingSkeleton type="detail" count={3} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome back, {user?.name?.split(' ')[0] || 'Driver'}
        </p>
      </div>

      {user && <KYCAlert status={kycStatus} />}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <StatsCard title="Today To Owner" value={formatCurrency(todayAmountToOwner)} icon={<DollarSign className="w-5 h-5" />} />
        <StatsCard title="This Month" value={formatCurrency(monthAmount)} icon={<CalendarCheck className="w-5 h-5" />} />
        <StatsCard title="This Year" value={formatCurrency(yearAmount)} icon={<DollarSign className="w-5 h-5" />} />
        <StatsCard title="Requests Sent" value={totalBookings} icon={<Clock className="w-5 h-5" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] sm:gap-6">
        <Card className="overflow-hidden border-slate-200">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-950">Monthly Amounts</h2>
                <p className="text-xs text-muted-foreground">Rental amounts from your accepted, active, and completed bookings.</p>
              </div>
              <p className="text-lg font-semibold text-emerald-700">{formatCurrency(yearAmount)}</p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyAmounts} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                    width={44}
                  />
                  <Tooltip
                    cursor={{ fill: '#ecfdf5' }}
                    formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
                    labelClassName="text-xs text-slate-500"
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 24px rgb(15 23 42 / 0.08)',
                    }}
                  />
                  <Bar dataKey="amount" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Recent Bookings</h2>
              <Link to="/driver/bookings">
                <Button size="sm" variant="ghost" className="text-xs gap-1">
                  View All <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {booking.car?.brand} {booking.car?.model}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold">{formatCurrency(booking.total_amount)}</span>
                      <StatusBadge status={booking.status} type="booking" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent bookings</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
