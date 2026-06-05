import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { bookingsApi, apiCache } from '@/api'
import type { Booking } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'
import { Car, Calendar, DollarSign, User } from 'lucide-react'

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(() => !apiCache.has('/admin/bookings'))
  const [activeTab, setActiveTab] = useState('all')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadBookings()
  }, [activeTab])

  const loadBookings = async () => {
    try {
      const params: any = {}
      if (activeTab !== 'all') params.status = activeTab
      
      const hasCache = apiCache.has('/admin/bookings', params)
      if (!hasCache) {
        setLoading(true)
      }
      const res = await bookingsApi.getAll(params)
      setBookings(res.data)
    } catch {
      // handle
    } finally {
      setLoading(false)
    }
  }

  const handleAdminAction = async (booking: any, action: 'accept' | 'reject' | 'agreement') => {
    try {
      setProcessingId(booking.id)
      if (action === 'accept') {
        await bookingsApi.adminAcceptBooking(booking.id)
      } else if (action === 'reject') {
        await bookingsApi.adminRejectBooking(booking.id, 'Rejected by admin')
      } else {
        await bookingsApi.sendAgreement(booking.id)
      }
      await loadBookings()
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) return <LoadingSkeleton type="list" count={8} />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Bookings</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger value="all" className="text-slate-600 data-[state=active]:bg-primary data-[state=active]:text-white">All</TabsTrigger>
          <TabsTrigger value="requested" className="text-slate-600 data-[state=active]:bg-primary data-[state=active]:text-white">Requested</TabsTrigger>
          <TabsTrigger value="active" className="text-slate-600 data-[state=active]:bg-primary data-[state=active]:text-white">Active</TabsTrigger>
          <TabsTrigger value="completed" className="text-slate-600 data-[state=active]:bg-primary data-[state=active]:text-white">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          {bookings.length === 0 ? (
            <EmptyState title="No bookings" />
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="hover:shadow-md transition-shadow border border-slate-100 overflow-hidden">
                    <CardContent className="p-5 space-y-4">
                      {/* Top Bar: Booking ID & Status & Action Buttons */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800">Booking</span>
                              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                #{booking.id.substring(0, 8)}...
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Created on {formatDate(booking.created_at || booking.start_date)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex flex-col items-end text-right">
                            <StatusBadge status={booking.status} type="booking" />
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              Owner: <span className="font-medium text-slate-600">{booking.owner_approval_status || 'PENDING'}</span> / Admin: <span className="font-medium text-slate-600">{booking.admin_approval_status || 'PENDING'}</span>
                            </span>
                          </div>

                          {booking.owner_approval_status === 'APPROVED' && booking.admin_approval_status === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="success"
                                disabled={processingId === booking.id}
                                onClick={() => handleAdminAction(booking, 'accept')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={processingId === booking.id}
                                onClick={() => handleAdminAction(booking, 'reject')}
                                className="font-medium shadow-sm"
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {booking.admin_approval_status === 'APPROVED' && !booking.agreement_sent_at && (
                            <Button
                              size="sm"
                              disabled={processingId === booking.id}
                              onClick={() => handleAdminAction(booking, 'agreement')}
                              className="font-medium bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                            >
                              Send Agreement
                            </Button>
                          )}
                          {booking.agreement_sent_at && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                              Agreement Sent
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info Sections: Car, Driver, and Owner Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        {/* Car Details */}
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Car className="w-3.5 h-3.5 text-amber-500" /> Vehicle Details
                          </p>
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-800">{booking.car?.brand} {booking.car?.model}</p>
                            <p className="text-xs text-slate-600">Plate: <span className="font-mono font-medium">{booking.car?.license_plate || 'N/A'}</span></p>
                            <p className="text-xs text-slate-600">Daily Rate: <span className="font-semibold text-amber-600">{formatCurrency(booking.total_amount)}</span></p>
                          </div>
                        </div>

                        {/* Driver Details */}
                        <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-blue-500" /> Driver (Renter)
                          </p>
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-800">{booking.driver?.name || 'N/A'}</p>
                            <p className="text-xs text-slate-600">Phone: <span className="font-medium">{booking.driver?.phone || 'N/A'}</span></p>
                            <p className="text-xs text-slate-600 truncate">Email: {booking.driver?.email || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Owner Details */}
                        <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-emerald-500" /> Owner (Lessor)
                          </p>
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-800">{booking.owner?.name || 'N/A'}</p>
                            <p className="text-xs text-slate-600">Phone: <span className="font-medium">{booking.owner?.phone || 'N/A'}</span></p>
                            <p className="text-xs text-slate-600 truncate">Email: {booking.owner?.email || 'N/A'}</p>
                          </div>
                        </div>
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
