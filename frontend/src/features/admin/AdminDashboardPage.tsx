import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Car, DollarSign, AlertTriangle, CalendarCheck, FileText, Shield } from 'lucide-react'
import { StatsCard } from '@/components/shared/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { adminApi } from '@/api'
import { formatCurrency, formatDateTime } from '@/utils/format'
import type { AdminDashboardStats } from '@/types'

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const data = await adminApi.getDashboardStats()
      setStats(data)
    } catch {
      // handle
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSkeleton type="detail" count={6} />

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={stats?.total_users || 0} icon={<Users className="w-5 h-5" />} />
        <StatsCard title="Total Revenue" value={formatCurrency(stats?.total_revenue || 0)} icon={<DollarSign className="w-5 h-5" />} />
        <StatsCard title="Active Bookings" value={stats?.active_bookings || 0} icon={<CalendarCheck className="w-5 h-5" />} />
        <StatsCard title="Active Disputes" value={stats?.active_disputes || 0} icon={<AlertTriangle className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Pending Owner Verifications" value={stats?.pending_owner_verifications || 0} icon={<Shield className="w-5 h-5" />} />
        <StatsCard title="Pending Driver Verifications" value={stats?.pending_driver_verifications || 0} icon={<Shield className="w-5 h-5" />} />
        <StatsCard title="Pending Car Verifications" value={stats?.pending_car_verifications || 0} icon={<Car className="w-5 h-5" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.revenue_chart && stats.revenue_chart.length > 0 ? (
              <div className="space-y-2">
                {stats.revenue_chart.map((m) => (
                  <div key={m.month} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{m.month}</span>
                    <span className="font-medium">{formatCurrency(m.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No revenue data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recent_activities && stats.recent_activities.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_activities.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p>{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(activity.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activities</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Verify Owners', count: stats?.pending_owner_verifications, href: '/admin/verifications/owners' },
            { label: 'Verify Drivers', count: stats?.pending_driver_verifications, href: '/admin/verifications/drivers' },
            { label: 'Pending Payments', count: stats?.pending_payment_approvals, href: '/admin/payments' },
            { label: 'Active Disputes', count: stats?.active_disputes, href: '/admin/disputes' },
          ].map((action) => (
            <a key={action.label} href={action.href} className="p-4 rounded-xl border bg-card hover:shadow-md transition-all text-center">
              <p className="text-sm font-medium">{action.label}</p>
              {(action.count ?? 0) > 0 && <Badge variant="destructive" className="mt-2">{action.count}</Badge>}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
