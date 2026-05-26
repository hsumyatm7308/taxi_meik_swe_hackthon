import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, DollarSign, Car, User, Shield, AlertTriangle, Star, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FileUploader } from '@/components/shared/FileUploader'
import { bookingsApi, paymentsApi, depositsApi, damageReportsApi, disputesApi, reviewsApi } from '@/api'
import { useAuth, useToast } from '@/providers'
import type { Booking, Payment, Deposit } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'

export function DriverBookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showDepositForm, setShowDepositForm] = useState(false)

  useEffect(() => {
    if (id) loadBooking(Number(id))
  }, [id])

  const loadBooking = async (bookingId: number) => {
    try {
      const data = await bookingsApi.getDriverBooking(bookingId)
      setBooking(data)
    } catch {
      navigate('/driver/bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!booking) return
    try {
      await bookingsApi.cancelBooking(booking.id)
      addToast('Booking cancelled', 'success')
      loadBooking(booking.id)
      setCancelOpen(false)
    } catch {
      addToast('Failed to cancel', 'error')
    }
  }

  const handlePaymentUpload = async (file: File) => {
    if (!booking) return
    try {
      const formData = new FormData()
      formData.append('method', 'kbzpay')
      formData.append('screenshot', file)
      await paymentsApi.submitPayment(booking.id, formData)
      addToast('Payment submitted for review', 'success')
      setShowPaymentForm(false)
      loadBooking(booking.id)
    } catch {
      addToast('Payment upload failed', 'error')
    }
  }

  const handleDepositUpload = async (file: File) => {
    if (!booking) return
    try {
      const formData = new FormData()
      formData.append('payment_method', 'kbzpay')
      formData.append('screenshot', file)
      await depositsApi.submitDeposit(booking.id, formData)
      addToast('Deposit submitted', 'success')
      setShowDepositForm(false)
      loadBooking(booking.id)
    } catch {
      addToast('Deposit upload failed', 'error')
    }
  }

  if (loading) return <LoadingSkeleton type="detail" />
  if (!booking) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Booking #{booking.id}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{booking.car?.brand} {booking.car?.model}</p>
              </div>
              <StatusBadge status={booking.status} type="booking" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Owner</p>
                <p className="font-medium">{booking.owner?.name || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="font-semibold text-primary">{formatCurrency(booking.total_amount)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="font-medium">{formatDate(booking.start_date)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">End Date</p>
                <p className="font-medium">{formatDate(booking.end_date)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {booking.status === 'requested' && (
                <Button variant="destructive" onClick={() => setCancelOpen(true)}>Cancel Booking</Button>
              )}
              {booking.status === 'accepted' && !showPaymentForm && (
                <Button onClick={() => setShowPaymentForm(true)}><DollarSign className="w-4 h-4 mr-2" /> Submit Payment</Button>
              )}
              {booking.status === 'payment_pending' && !showDepositForm && (
                <Button onClick={() => setShowDepositForm(true)}><Shield className="w-4 h-4 mr-2" /> Submit Deposit</Button>
              )}
              {booking.status === 'completed' && (
                <Button onClick={() => navigate(`/driver/reviews?booking=${booking.id}`)}><Star className="w-4 h-4 mr-2" /> Leave Review</Button>
              )}
            </div>

            {showPaymentForm && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Upload Payment Screenshot</h3>
                  <FileUploader label="Upload payment proof" onUpload={handlePaymentUpload} />
                </CardContent>
              </Card>
            )}

            {showDepositForm && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Upload Deposit Screenshot</h3>
                  <FileUploader label="Upload deposit proof" onUpload={handleDepositUpload} />
                </CardContent>
              </Card>
            )}

            {booking.driver_notes && (
              <div>
                <p className="text-sm font-medium">Notes</p>
                <p className="text-sm text-muted-foreground">{booking.driver_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking?"
        variant="destructive"
        confirmLabel="Cancel Booking"
        onConfirm={handleCancel}
      />
    </div>
  )
}
