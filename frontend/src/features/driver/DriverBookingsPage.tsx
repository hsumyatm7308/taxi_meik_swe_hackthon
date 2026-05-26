import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { bookingsApi } from '@/api'
import type { Booking } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'
import { Car, Calendar, DollarSign } from 'lucide-react'

export function DriverBookingsPage() {
  const navigate = useNavigate()
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
      const res = await bookingsApi.getMyBookings(params)
      setBookings(res.data)
    } catch {
      // handle
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSkeleton type="list" count={5} />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Bookings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="requested">Requested</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {bookings.length === 0 ? (
            <EmptyState title="No bookings" description="Browse cars to make a booking." action={<Button onClick={() => navigate('/driver/cars')}>Browse Cars</Button>} />
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/driver/bookings/${booking.id}`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Car className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{booking.car ? `${booking.car.brand} ${booking.car.model}` : `Booking #${booking.id}`}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(booking.start_date)} - {formatDate(booking.end_date)}</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {formatCurrency(booking.total_amount)}</span>
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
