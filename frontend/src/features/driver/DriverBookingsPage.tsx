import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { KYCLock } from '@/components/shared/KYCLock'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/providers'
import { MOCK_BOOKINGS } from '@/mock-data/driver'
import { formatDate, formatCurrency } from '@/utils/format'
import { Car, Calendar, DollarSign, XCircle } from 'lucide-react'

const KYC_REQUIRED = ['verified', 'trusted']

export function DriverBookingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [localBookings, setLocalBookings] = useState(MOCK_BOOKINGS)

  const filtered = useMemo(() => {
    if (activeTab === 'all') return localBookings
    return localBookings.filter((b) => b.status === activeTab)
  }, [activeTab, localBookings])

  const handleCancel = () => {
    if (cancelId) {
      setLocalBookings((prev) => prev.map((b) => b.id === cancelId ? { ...b, status: 'cancelled' } : b))
      setCancelId(null)
    }
  }

  const handleRemove = (id: number) => {
    setLocalBookings((prev) => prev.filter((b) => b.id !== id))
  }

  const tabCounts = {
    all: localBookings.length,
    requested: localBookings.filter((b) => b.status === 'requested').length,
    active: localBookings.filter((b) => b.status === 'active').length,
    completed: localBookings.filter((b) => b.status === 'completed').length,
    cancelled: localBookings.filter((b) => b.status === 'cancelled').length,
  }

  const content = (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Booking</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          {(['all', 'requested', 'active', 'completed', 'cancelled'] as const).map((tab) => (
            <TabsTrigger key={tab} value={tab} className="relative">
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-1.5 text-xs text-muted-foreground">({tabCounts[tab]})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">No bookings</p>
              <p className="text-sm">Browse cars to make a booking.</p>
              <Button size="sm" className="mt-3" onClick={() => navigate('/driver/cars')}>Browse Cars</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filtered.map((booking) => (
                  <motion.div key={booking.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Car className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{booking.car?.brand} {booking.car?.model}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(booking.start_date)} - {formatDate(booking.end_date)}</span>
                              <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {formatCurrency(booking.total_amount)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <StatusBadge status={booking.status} type="booking" />
                            <div className="flex gap-1">
                              {(booking.status === 'requested' || booking.status === 'active') && (
                                <Button size="sm" variant="ghost" className="text-red-500 h-7 px-2 text-xs" onClick={() => setCancelId(booking.id)}>
                                  <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                                </Button>
                              )}
                              {(booking.status === 'cancelled' || booking.status === 'completed') && (
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground" onClick={() => handleRemove(booking.id)}>
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={cancelId !== null} onOpenChange={(o) => { if (!o) setCancelId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking?</DialogTitle>
            <DialogDescription>This action cannot be undone. The booking will be cancelled immediately.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button onClick={() => setCancelId(null)} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              Keep Booking
            </button>
            <button onClick={handleCancel} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-500 text-white hover:bg-red-600 h-10 px-4 py-2">
              Yes, Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  if (user && !KYC_REQUIRED.includes(user.verification_status)) {
    return <KYCLock feature="My Booking">{content}</KYCLock>
  }

  return content
}
