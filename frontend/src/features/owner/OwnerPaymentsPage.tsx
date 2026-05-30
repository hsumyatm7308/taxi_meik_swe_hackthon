import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, CreditCard, DollarSign, ExternalLink, Eye, ReceiptText, Search, Upload, UserRound } from 'lucide-react'
import { paymentsApi } from '@/api'
import type { Payment } from '@/types'
import { PAYMENT_METHODS } from '@/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/EmptyState'
import { FileUploader } from '@/components/shared/FileUploader'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/providers'
import { formatCurrency, formatDate } from '@/utils/format'

export function OwnerPaymentsPage() {
  const { addToast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('kbzpay')
  const [uploadingId, setUploadingId] = useState<string | number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [proofPayment, setProofPayment] = useState<Payment | null>(null)

  const availablePaymentMethods = PAYMENT_METHODS.filter((method) =>
    ['kbzpay', 'wavepay', 'ayapay'].includes(method.value),
  )

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      const res = await paymentsApi.getOwnerPayments()
      setPayments(res.data)
    } catch {
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (payment: Payment, file: File) => {
    try {
      setUploadingId(payment.id)
      const formData = new FormData()
      formData.append('method', paymentMethod)
      formData.append('screenshot', file)
      await paymentsApi.submitPayment(payment.booking_id, formData)
      addToast('Owner commission submitted for review', 'success')
      loadPayments()
    } catch (error: any) {
      addToast(error?.response?.data?.error || 'Payment upload failed', 'error')
    } finally {
      setUploadingId(null)
    }
  }

  const filteredPayments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) return payments

    return payments.filter((payment) =>
      [
        payment.booking_id,
        payment.transfer_from_name,
        payment.transfer_to_name,
        payment.driver_name,
        payment.owner_name,
        payment.method,
        payment.status,
      ].some((value) => String(value || '').toLowerCase().includes(query)),
    )
  }, [payments, searchTerm])

  if (loading) return <LoadingSkeleton type="list" />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Commission Payments</h1>
        <p className="text-sm text-muted-foreground">Track owner commission proof and payment review status.</p>
      </div>

      {payments.length === 0 ? (
        <EmptyState title="No owner payments" description="Commission payments will appear after bookings are approved." />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search booking or name"
                className="pl-9"
              />
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <EmptyState title="No matching payments" description="Try another search term." />
          ) : (
            <div className="grid gap-3">
              {filteredPayments.map((payment) => {
                const canUpload = ['incomplete', 'failed'].includes(payment.status)
                const paymentPurpose = payment.payment_purpose === 'owner_commission' ? 'Owner commission' : 'Payment'
                const commissionRate = Math.round((payment.commission_rate || 0) * 100)

                return (
                  <motion.div key={payment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                      <CardContent className="space-y-4 p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <DollarSign className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 space-y-2">
                              <div>
                                <p className="text-sm font-semibold">Booking #{payment.booking_id}</p>
                                <p className="text-xs text-muted-foreground">{paymentPurpose}</p>
                              </div>
                              <p className="text-xl font-semibold text-foreground">{formatCurrency(payment.amount)}</p>
                              <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                                <p><span className="text-foreground">From:</span> {payment.transfer_from_name || 'Unknown'}</p>
                                <p><span className="text-foreground">To:</span> {payment.transfer_to_name || 'Taxi Meik Swe Agency'}</p>
                                {payment.driver_name && <p><span className="text-foreground">Driver:</span> {payment.driver_name}</p>}
                                <p><span className="text-foreground">Method:</span> {payment.method || 'Not submitted'}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {commissionRate}% commission
                                {payment.commission_amount ? ` (${formatCurrency(payment.commission_amount)})` : ''}
                                {' '}· {payment.paid_at ? `Paid ${formatDate(payment.paid_at)}` : 'Awaiting proof'}
                              </p>
                            </div>
                          </div>

                            <div className="flex shrink-0 items-center gap-2 self-start">
                              {payment.screenshot_url && (
                              <Button size="sm" variant="outline" onClick={() => setProofPayment(payment)}>
                                  <Eye className="h-4 w-4" />
                                  View proof
                              </Button>
                            )}
                            <StatusBadge status={payment.status} type="payment" />
                          </div>
                        </div>

                        {canUpload && (
                          <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Upload className="h-4 w-4 text-primary" />
                              Submit commission proof
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {availablePaymentMethods.map((method) => (
                                <Button
                                  key={method.value}
                                  type="button"
                                  size="sm"
                                  variant={paymentMethod === method.value ? 'default' : 'outline'}
                                  onClick={() => setPaymentMethod(method.value)}
                                >
                                  <span className="mr-1">{method.icon}</span>
                                  {method.label}
                                </Button>
                              ))}
                            </div>
                            <FileUploader
                              label={uploadingId === payment.id ? 'Uploading...' : 'Upload owner commission proof'}
                              uploading={uploadingId === payment.id}
                              onUpload={(file) => handleUpload(payment, file)}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <PaymentProofDialog payment={proofPayment} onOpenChange={(open) => !open && setProofPayment(null)} />
    </div>
  )
}

function PaymentProofDialog({
  payment,
  onOpenChange,
}: {
  payment: Payment | null
  onOpenChange: (open: boolean) => void
}) {
  const commissionRate = Math.round((payment?.commission_rate || 0) * 100)

  return (
    <Dialog open={!!payment} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-2rem)] overflow-hidden border-slate-200 bg-white p-0 shadow-2xl shadow-slate-950/20 sm:max-w-5xl">
        <DialogHeader className="border-b border-slate-200 bg-slate-50 px-5 py-4 pr-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <ReceiptText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl text-slate-950">Payment Proof</DialogTitle>
                <DialogDescription className="mt-1 text-slate-500">
                  {payment ? `Booking #${payment.booking_id}` : 'Payment proof'}
                </DialogDescription>
              </div>
            </div>
            {payment && <StatusBadge status={payment.status} type="payment" />}
          </div>
        </DialogHeader>

        {payment && (
          <div className="grid max-h-[calc(92vh-88px)] overflow-y-auto bg-white lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-h-[360px] items-center justify-center bg-slate-950 p-4 sm:min-h-[520px]">
              {payment.screenshot_url ? (
                <div className="flex h-full w-full items-center justify-center rounded-lg border border-white/10 bg-slate-900 p-2 shadow-inner">
                  <img
                    src={payment.screenshot_url}
                    alt={`Payment proof for booking ${payment.booking_id}`}
                    className="max-h-[68vh] w-full rounded-md object-contain shadow-xl shadow-slate-950/40"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-300">
                  <ReceiptText className="h-8 w-8" />
                  <p className="text-sm">No proof image available.</p>
                </div>
              )}
            </div>

            <div className="space-y-5 border-t border-slate-200 bg-slate-50/70 p-5 lg:border-l lg:border-t-0">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-medium uppercase text-emerald-700">Amount submitted</p>
                <p className="mt-1 text-3xl font-semibold text-emerald-950">{formatCurrency(payment.amount)}</p>
                <p className="mt-2 text-xs text-emerald-700">
                  {commissionRate}% commission
                  {payment.commission_amount ? ` · ${formatCurrency(payment.commission_amount)}` : ''}
                </p>
              </div>

              <div className="grid gap-3 text-sm">
                <PaymentProofDetail icon={<UserRound className="h-4 w-4" />} label="From" value={payment.transfer_from_name || 'Unknown'} />
                <PaymentProofDetail icon={<UserRound className="h-4 w-4" />} label="To" value={payment.transfer_to_name || 'Taxi Meik Swe Agency'} />
                <PaymentProofDetail icon={<CreditCard className="h-4 w-4" />} label="Method" value={payment.method || 'Not submitted'} />
                <PaymentProofDetail icon={<CalendarDays className="h-4 w-4" />} label="Paid" value={payment.paid_at ? formatDate(payment.paid_at) : 'Awaiting proof'} />
              </div>

              {payment.screenshot_url && (
                <Button className="w-full bg-slate-950 text-white hover:bg-slate-800" asChild>
                  <a href={payment.screenshot_url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open full size
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function PaymentProofDetail({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
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
