import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { paymentsApi, apiCache } from '@/api'
import { useToast } from '@/providers'
import type { Payment } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'
import { CheckCircle, XCircle, DollarSign, ZoomIn, X, Clock, History, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function AdminPaymentsPage() {
  const { addToast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(() => !apiCache.has('/admin/payments/pending'))
  const [processing, setProcessing] = useState<string | number | null>(null)
  const [activeTab, setActiveTab] = useState('history')
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // History state
  const [historyPayments, setHistoryPayments] = useState<Payment[]>([])
  const [historyLoading, setHistoryLoading] = useState(() => !apiCache.has('/admin/payments/history'))
  const [historyFetched, setHistoryFetched] = useState(false)

  useEffect(() => {
    loadPayments()
    loadHistory()
  }, [])

  const loadPayments = async () => {
    try {
      const hasCache = apiCache.has('/admin/payments/pending')
      if (!hasCache) {
        setLoading(true)
      }
      const data = await paymentsApi.getPendingPayments()
      setPayments(data)
    } catch {
      // handle
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      const hasCache = apiCache.has('/admin/payments/history')
      if (!hasCache) {
        setHistoryLoading(true)
      }
      const data = await paymentsApi.getPaymentsHistory()
      setHistoryPayments(data)
      setHistoryFetched(true)
    } catch {
      addToast('Failed to load history', 'error')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleConfirm = async (id: string | number) => {
    try {
      setProcessing(id)
      await paymentsApi.confirmPayment(id)
      addToast('Payment confirmed', 'success')
      setPayments((prev) => prev.filter((p) => p.id !== id))
      setHistoryFetched(false) // Invalidate history cache so it re-fetches
    } catch {
      addToast('Failed to confirm', 'error')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: string | number) => {
    try {
      setProcessing(id)
      await paymentsApi.rejectPayment(id, 'Invalid payment')
      addToast('Payment rejected', 'info')
      setPayments((prev) => prev.filter((p) => p.id !== id))
      setHistoryFetched(false) // Invalidate history cache so it re-fetches
    } catch {
      addToast('Failed to reject', 'error')
    } finally {
      setProcessing(null)
    }
  }

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      (p.transfer_from_name || '').toLowerCase().includes(q) ||
      (p.transfer_to_name || '').toLowerCase().includes(q) ||
      (p.driver_name || '').toLowerCase().includes(q) ||
      (p.owner_name || '').toLowerCase().includes(q) ||
      (p.transaction_id || '').toLowerCase().includes(q)
    )
  })

  const filteredHistory = historyPayments.filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      (p.transfer_from_name || '').toLowerCase().includes(q) ||
      (p.transfer_to_name || '').toLowerCase().includes(q) ||
      (p.driver_name || '').toLowerCase().includes(q) ||
      (p.owner_name || '').toLowerCase().includes(q) ||
      (p.transaction_id || '').toLowerCase().includes(q)
    )
  })

  const pendingDriverPayments = filteredPayments.filter((payment) => (payment.payer_role || 'DRIVER') === 'DRIVER')
  const pendingOwnerPayments = filteredPayments.filter((payment) => payment.payer_role === 'OWNER')

  const counts = {
    allPending: filteredPayments.length,
    driverPayments: pendingDriverPayments.length,
    ownerPayments: pendingOwnerPayments.length,
    history: filteredHistory.length,
  }

  const renderPaymentList = (items: Payment[], isHistory: boolean) => {
    return (
      <div className="space-y-3">
        {items.map((payment) => (
          <motion.div key={payment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="hover:shadow-md transition-shadow border border-slate-100 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isHistory
                        ? payment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        : 'bg-primary/10 text-primary'
                    }`}><DollarSign className="w-5 h-5" /></div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800 text-base">{formatCurrency(payment.amount)}</p>
                        {payment.transaction_id && (
                          <span className="text-[10px] font-mono bg-slate-500/10 text-slate-700 px-2 py-0.5 rounded border border-slate-200/20 font-semibold">
                            TxID: {payment.transaction_id}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium capitalize">
                        {payment.method} &middot; {payment.payer_role || 'DRIVER'} &middot; Booking #{payment.booking_id} &middot; {formatDate(payment.paid_at)}
                      </p>
                      <p className="text-xs text-slate-600">
                        From <span className="font-medium text-slate-800">{payment.transfer_from_name || 'Unknown'}</span> to <span className="font-medium text-slate-800">{payment.transfer_to_name || 'Taxi Meik Swe Agency'}</span>
                      </p>
                      {(payment.driver_name || payment.owner_name) && (
                        <p className="text-xs text-slate-500">
                          Driver: <span className="font-medium text-slate-700">{payment.driver_name || 'N/A'}</span> &middot; Owner: <span className="font-medium text-slate-700">{payment.owner_name || 'N/A'}</span>
                        </p>
                      )}
                      {payment.commission_rate !== undefined && (
                        <p className="text-xs text-slate-500">
                          Commission: <span className="font-semibold text-slate-700">{Math.round((payment.commission_rate || 0) * 100)}%</span>
                          {payment.commission_amount ? ` (${formatCurrency(payment.commission_amount)})` : ''}
                        </p>
                      )}
                      {isHistory && payment.admin_notes && (
                        <div className={`mt-3 p-3 rounded-lg border text-xs max-w-xl ${
                          payment.status === 'confirmed'
                            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                            : 'bg-red-50/50 border-red-100 text-red-800'
                        }`}>
                          <p className="font-semibold mb-0.5">
                            {payment.status === 'confirmed' ? 'Confirmation Notes' : 'Rejection Reason'}
                          </p>
                          <p className="opacity-90">{payment.admin_notes}</p>
                        </div>
                      )}
                      {payment.screenshot_url && (
                        <div className="mt-3">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Receipt Screenshot</p>
                          <div
                            className="relative rounded-lg overflow-hidden border border-slate-200 w-28 aspect-[3/4] bg-slate-100 group cursor-zoom-in"
                            onClick={() => setLightboxUrl(payment.screenshot_url!)}
                          >
                            <img src={payment.screenshot_url} alt="Payment proof" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {isHistory ? (
                    <div className="flex flex-col items-start lg:items-end gap-1 pl-[52px] lg:pl-0 self-start lg:self-auto text-left lg:text-right">
                      <StatusBadge status={payment.status} type="payment" />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Processed {formatDate(payment.confirmed_at || payment.updated_at)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 pl-[52px] lg:pl-0 self-start lg:self-auto">
                      <StatusBadge status={payment.status} type="payment" />
                      <Button size="sm" variant="success" onClick={() => handleConfirm(payment.id)} disabled={processing === payment.id}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Confirm
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(payment.id)} disabled={processing === payment.id}>
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments Approvals</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Process pending rental payments / owner commission, and view transaction history.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search payments by user name or TxID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white border border-slate-200"
        />
      </div>

      <Tabs className="w-full min-w-0" value={activeTab} onValueChange={(val) => {
        setActiveTab(val)
        if (val === 'history' && !historyFetched) {
          loadHistory()
        }
      }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 min-w-0 w-full">
          <div className="w-full min-w-0 overflow-x-auto scrollbar-thin pb-1">
            <TabsList className="w-max justify-start flex-nowrap">
              <TabsTrigger value="history" className="shrink-0">History ({counts.history})</TabsTrigger>
              <TabsTrigger value="driver-payments" className="shrink-0">Driver Payments ({counts.driverPayments})</TabsTrigger>
              <TabsTrigger value="owner-payments" className="shrink-0">Owner Commission ({counts.ownerPayments})</TabsTrigger>
              <TabsTrigger value="all-pending" className="shrink-0">All Pending ({counts.allPending})</TabsTrigger>
            </TabsList>
          </div>
          <Button variant="outline" size="sm" className="self-end sm:self-auto shrink-0" onClick={() => { loadPayments(); loadHistory(); }} disabled={loading || historyLoading}>
            Refresh
          </Button>
        </div>

        <TabsContent value="history" className="mt-0">
          {historyLoading ? (
            <LoadingSkeleton type="list" count={5} />
          ) : filteredHistory.length === 0 ? (
            <EmptyState
              title={searchQuery ? "No matching payment history" : "No payment history"}
              description={searchQuery ? "Try adjusting your search query." : "No processed payments found."}
            />
          ) : (
            renderPaymentList(filteredHistory, true)
          )}
        </TabsContent>

        <TabsContent value="driver-payments" className="mt-0">
          {loading ? (
            <LoadingSkeleton type="list" count={5} />
          ) : pendingDriverPayments.length === 0 ? (
            <EmptyState
              title={searchQuery ? "No matching driver payments" : "No pending driver payments"}
              description={searchQuery ? "Try adjusting your search query." : "All driver payments have been processed."}
            />
          ) : (
            renderPaymentList(pendingDriverPayments, false)
          )}
        </TabsContent>

        <TabsContent value="owner-payments" className="mt-0">
          {loading ? (
            <LoadingSkeleton type="list" count={5} />
          ) : pendingOwnerPayments.length === 0 ? (
            <EmptyState
              title={searchQuery ? "No matching owner commission" : "No pending owner commission"}
              description={searchQuery ? "Try adjusting your search query." : "All owner commission payments have been processed."}
            />
          ) : (
            renderPaymentList(pendingOwnerPayments, false)
          )}
        </TabsContent>

        <TabsContent value="all-pending" className="mt-0">
          {loading ? (
            <LoadingSkeleton type="list" count={5} />
          ) : filteredPayments.length === 0 ? (
            <EmptyState
              title={searchQuery ? "No matching pending payments" : "No pending payments"}
              description={searchQuery ? "Try adjusting your search query." : "All payments in this section have been processed."}
            />
          ) : (
            renderPaymentList(filteredPayments, false)
          )}
        </TabsContent>
      </Tabs>


      {/* ─── Lightbox ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxUrl && <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
      </AnimatePresence>
    </div>
  )
}


function Lightbox({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors" onClick={onClose}>
        <X className="w-8 h-8" />
      </button>
      <motion.img
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        src={url}
        alt="Payment proof preview"
        className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  )
}
