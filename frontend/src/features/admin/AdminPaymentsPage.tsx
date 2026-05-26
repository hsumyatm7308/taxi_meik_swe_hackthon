import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { paymentsApi } from '@/api'
import { useToast } from '@/providers'
import type { Payment } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'
import { CheckCircle, XCircle, DollarSign } from 'lucide-react'

export function AdminPaymentsPage() {
  const { addToast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      const data = await paymentsApi.getPendingPayments()
      setPayments(data)
    } catch {
      // handle
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (id: number) => {
    try {
      setProcessing(id)
      await paymentsApi.confirmPayment(id)
      addToast('Payment confirmed', 'success')
      setPayments((prev) => prev.filter((p) => p.id !== id))
    } catch {
      addToast('Failed to confirm', 'error')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: number) => {
    try {
      setProcessing(id)
      await paymentsApi.rejectPayment(id, 'Invalid payment')
      addToast('Payment rejected', 'info')
      setPayments((prev) => prev.filter((p) => p.id !== id))
    } catch {
      addToast('Failed to reject', 'error')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) return <LoadingSkeleton type="list" count={5} />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payment Approvals</h1>
      {payments.length === 0 ? (
        <EmptyState title="No pending payments" description="All payments have been processed." />
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <motion.div key={payment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><DollarSign className="w-5 h-5" /></div>
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-muted-foreground capitalize">{payment.method} &middot; Booking #{payment.booking_id} &middot; {formatDate(payment.paid_at)}</p>
                        {payment.screenshot_url && (
                          <img src={payment.screenshot_url} alt="Payment proof" className="mt-2 h-20 rounded-lg object-cover" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={payment.status} type="payment" />
                      <Button size="sm" variant="success" onClick={() => handleConfirm(payment.id)} disabled={processing === payment.id}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Confirm
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(payment.id)} disabled={processing === payment.id}>
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
