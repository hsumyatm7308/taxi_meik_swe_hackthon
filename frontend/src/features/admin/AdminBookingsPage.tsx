import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { bookingsApi } from '@/api'
import type { Booking } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'
import { Car, Calendar, DollarSign, User } from 'lucide-react'

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadBookings()
  }, [activeTab])

  const loadBookings = async () => {
    try {
      const params: any = {}
      if (activeTab !== 'all') params.status = activeTab
      const res = await bookingsApi.getAll(params)
      setBookings(res.data)
    } catch {
      // handle
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSkeleton type="list" count={8} />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Bookings</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="requested">Requested</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          {bookings.length === 0 ? (
            <EmptyState title="No bookings" />
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Car className="w-5 h-5" /></div>
                          <div>
                            <p className="font-medium">Booking #{booking.id}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {booking.car?.brand || 'N/A'}</span>
                              <span className="flex items-center gap-1"><User className="w-3 h-3" /> Driver: {booking.driver?.name || 'N/A'}</span>
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(booking.start_date)}</span>
                              <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {formatCurrency(booking.total_amount)}</span>
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={booking.status} type="booking" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
