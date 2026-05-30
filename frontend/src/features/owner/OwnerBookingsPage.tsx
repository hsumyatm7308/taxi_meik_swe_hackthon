import { memo, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { KYCLock } from '@/components/shared/KYCLock'
import { bookingsApi } from '@/api'
import { useToast } from '@/providers'
import type { Booking, User as UserType } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'
import { Calendar, Car, DollarSign, Eye, Hash, Mail, Phone, ShieldCheck, SlidersHorizontal, User } from 'lucide-react'

const BOOKING_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'requested', label: 'Requested' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
] as const

type BookingFilter = (typeof BOOKING_FILTERS)[number]['value']
type BookingAction = 'accept' | 'reject'

const isBookingFilter = (value: string): value is BookingFilter =>
  BOOKING_FILTERS.some((filter) => filter.value === value)

export function OwnerBookingsPage() {
  return (
    <KYCLock feature="Bookings">
      <OwnerBookingsContent />
    </KYCLock>
  )
}

function OwnerBookingsContent() {
  const { addToast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<BookingFilter>('all')
  const [actionId, setActionId] = useState<string | number | null>(null)
  const [actionType, setActionType] = useState<BookingAction | null>(null)
  const [driverDetailBooking, setDriverDetailBooking] = useState<Booking | null>(null)
  const [processing, setProcessing] = useState(false)

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') return bookings
    return bookings.filter((booking) => booking.status === activeTab)
  }, [activeTab, bookings])

  const handleTabChange = useCallback((value: string) => {
    if (isBookingFilter(value)) setActiveTab(value)
  }, [])

  const loadBookings = useCallback(async () => {
    try {
      const res = await bookingsApi.getOwnerBookings()
      setBookings(res.data)
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const handleRequestAction = useCallback((id: string | number, type: BookingAction) => {
    setActionId(id)
    setActionType(type)
  }, [])

  const handleViewDriver = useCallback((booking: Booking) => {
    setDriverDetailBooking(booking)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setActionId(null)
    setActionType(null)
  }, [])

  const handleAction = useCallback(async () => {
    if (!actionId) return
    try {
      setProcessing(true)
      if (actionType === 'accept') {
        await bookingsApi.acceptBooking(actionId)
        addToast('Booking accepted', 'success')
      } else {
        await bookingsApi.rejectBooking(actionId, 'Rejected by owner')
        addToast('Booking rejected', 'info')
      }
      handleCloseDialog()
      loadBookings()
    } catch {
      addToast('Action failed', 'error')
    } finally {
      setProcessing(false)
    }
  }, [actionId, actionType, addToast, handleCloseDialog, loadBookings])

  if (loading) return <LoadingSkeleton type="list" count={4} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Booking Requests</h1>
        <p className="text-sm text-muted-foreground">Review driver booking requests and track payment status.</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <BookingFilterTabs />

        <TabsContent value={activeTab} className="mt-4">
          {filteredBookings.length === 0 ? (
            <EmptyState title="No bookings" description="You will see booking requests here" />
          ) : (
            <BookingList
              bookings={filteredBookings}
              onRequestAction={handleRequestAction}
              onViewDriver={handleViewDriver}
            />
          )}
        </TabsContent>
      </Tabs>

      <DriverDetailDialog booking={driverDetailBooking} onOpenChange={(open) => !open && setDriverDetailBooking(null)} />

      <ConfirmDialog
        open={!!actionId}
        onOpenChange={handleCloseDialog}
        title={actionType === 'accept' ? 'Accept Booking' : 'Reject Booking'}
        description={actionType === 'accept' ? 'Confirm this booking request?' : 'Reject this booking request?'}
        variant={actionType === 'accept' ? 'default' : 'destructive'}
        confirmLabel={actionType === 'accept' ? 'Accept' : 'Reject'}
        onConfirm={handleAction}
        loading={processing}
      />
    </div>
  )
}

const BookingFilterTabs = memo(function BookingFilterTabs() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
          <SlidersHorizontal className="h-4 w-4" />
        </div>
        Filter bookings
      </div>
      <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1 sm:w-auto">
        {BOOKING_FILTERS.map((filter) => (
          <TabsTrigger
            key={filter.value}
            value={filter.value}
            className="rounded-md px-3 py-2 text-xs font-semibold text-slate-500 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            {filter.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  )
})

const BookingList = memo(function BookingList({
  bookings,
  onRequestAction,
  onViewDriver,
}: {
  bookings: Booking[]
  onRequestAction: (id: string | number, type: BookingAction) => void
  onViewDriver: (booking: Booking) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {bookings.map((booking) => (
        <BookingRequestCard
          key={booking.id}
          booking={booking}
          onRequestAction={onRequestAction}
          onViewDriver={onViewDriver}
        />
      ))}
    </div>
  )
})

const BookingRequestCard = memo(function BookingRequestCard({
  booking,
  onRequestAction,
  onViewDriver,
}: {
  booking: Booking
  onRequestAction: (id: string | number, type: BookingAction) => void
  onViewDriver: (booking: Booking) => void
}) {
  const driverName = booking.driver?.name || `Driver #${booking.driver_id}`
  const carName = booking.car ? `${booking.car.brand} ${booking.car.model}` : `Car #${booking.car_id}`
  const paymentStatus = booking.owner_payment_status || booking.owner_payment?.status || 'incomplete'

  const handleAccept = useCallback(() => {
    onRequestAction(booking.id, 'accept')
  }, [booking.id, onRequestAction])

  const handleReject = useCallback(() => {
    onRequestAction(booking.id, 'reject')
  }, [booking.id, onRequestAction])

  const handleViewDriver = useCallback(() => {
    onViewDriver(booking)
  }, [booking, onViewDriver])

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full">
      <Card className="flex h-full overflow-hidden border-slate-200 bg-white transition-shadow hover:shadow-md">
        <CardContent className="flex w-full flex-col p-0">
          <div className="flex flex-1 flex-col p-4">
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-base font-semibold text-slate-950">{driverName}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        Requested {formatDate(booking.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Booking #{booking.id}</p>
                  </div>
                  <BookingSummary booking={booking} carName={carName} />
                  <DriverContact booking={booking} />
                </div>
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-xs font-medium uppercase text-emerald-700">Total amount</p>
                <p className="mt-1 text-xl font-semibold text-emerald-950">{formatCurrency(booking.total_amount)}</p>
              </div>
            </div>

            {booking.driver_notes && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {booking.driver_notes}
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={booking.status} type="booking" />
              <StatusBadge status={paymentStatus} type="payment" />
            </div>
            <div className="grid gap-2">
              <Button size="sm" variant="outline" onClick={handleViewDriver}>
                <Eye className="h-4 w-4" />
                Driver info
              </Button>
              {booking.status === 'requested' && (
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="success" onClick={handleAccept}>Accept</Button>
                  <Button size="sm" variant="destructive" onClick={handleReject}>Reject</Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})

function DriverDetailDialog({
  booking,
  onOpenChange,
}: {
  booking: Booking | null
  onOpenChange: (open: boolean) => void
}) {
  const driver = booking?.driver
  const driverName = driver?.name || (booking ? `Driver #${booking.driver_id}` : 'Driver')

  return (
    <Dialog open={!!booking} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-2rem)] overflow-hidden border-slate-200 bg-white p-0 shadow-2xl shadow-slate-950/20 sm:max-w-2xl">
        <DialogHeader className="border-b border-slate-200 bg-slate-50 px-5 py-4 pr-12">
          <div className="flex items-start gap-3">
            <DriverAvatar driver={driver} name={driverName} />
            <div className="min-w-0">
              <DialogTitle className="truncate text-xl text-slate-950">{driverName}</DialogTitle>
              <DialogDescription className="mt-1 text-slate-500">
                {booking ? `Driver information for booking #${booking.id}` : 'Driver information'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {booking && (
          <div className="max-h-[calc(92vh-88px)] space-y-5 overflow-y-auto bg-slate-50/70 p-5">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-emerald-700">Driver profile</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-950">{driverName}</p>
                </div>
                {driver?.verification_status && (
                  <StatusBadge status={driver.verification_status} type="verification" />
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DriverDetailItem icon={<Hash className="h-4 w-4" />} label="Driver ID" value={String(booking.driver_id)} />
              <DriverDetailItem icon={<Phone className="h-4 w-4" />} label="Phone" value={driver?.phone || 'Not provided'} />
              <DriverDetailItem icon={<Mail className="h-4 w-4" />} label="Email" value={driver?.email || 'Not provided'} />
              <DriverDetailItem icon={<ShieldCheck className="h-4 w-4" />} label="Verification" value={driver?.verification_status || 'Unknown'} />
              <DriverDetailItem icon={<Calendar className="h-4 w-4" />} label="Joined" value={driver?.created_at ? formatDate(driver.created_at) : 'Unknown'} />
              <DriverDetailItem icon={<Calendar className="h-4 w-4" />} label="Last updated" value={driver?.updated_at ? formatDate(driver.updated_at) : 'Unknown'} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DriverDetailItem icon={<Car className="h-4 w-4" />} label="Requested car" value={booking.car ? `${booking.car.brand} ${booking.car.model}` : `Car #${booking.car_id}`} />
              <DriverDetailItem icon={<DollarSign className="h-4 w-4" />} label="Booking amount" value={formatCurrency(booking.total_amount)} />
              <DriverDetailItem icon={<Calendar className="h-4 w-4" />} label="Start date" value={formatDate(booking.start_date)} />
            </div>

            {(booking.driver_notes || booking.rejection_reason) && (
              <div className="space-y-3">
                {booking.driver_notes && (
                  <DriverNote label="Driver notes" value={booking.driver_notes} />
                )}
                {booking.rejection_reason && (
                  <DriverNote label="Rejection reason" value={booking.rejection_reason} />
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DriverAvatar({ driver, name }: { driver?: UserType; name: string }) {
  const fallback = name.trim().charAt(0).toUpperCase() || 'D'

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-emerald-100 text-emerald-700">
      {driver?.profile_photo_url ? (
        <img src={driver.profile_photo_url} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-lg font-semibold">{fallback}</span>
      )}
    </div>
  )
}

function DriverDetailItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 break-words font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  )
}

function DriverNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-700">{value}</p>
    </div>
  )
}

const DriverContact = memo(function DriverContact({ booking }: { booking: Booking }) {
  const driver = booking.driver

  if (!driver?.phone && !driver?.email && !driver?.verification_status) return null

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
      {driver.phone && (
        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {driver.phone}</span>
      )}
      {driver.email && (
        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {driver.email}</span>
      )}
      {driver.verification_status && (
        <span className="flex items-center gap-1 capitalize"><ShieldCheck className="h-3 w-3" /> {driver.verification_status}</span>
      )}
    </div>
  )
})

const BookingSummary = memo(function BookingSummary({
  booking,
  carName,
}: {
  booking: Booking
  carName: string
}) {
  return (
    <div className="grid gap-2 text-sm text-slate-600">
      <span className="flex items-center gap-1">
        <Car className="h-4 w-4 text-slate-500" />
        <span className="font-medium text-slate-950">{carName}</span>
      </span>
      <span className="flex items-center gap-1">
        <Calendar className="h-4 w-4 text-slate-500" />
        {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
      </span>
    </div>
  )
})
