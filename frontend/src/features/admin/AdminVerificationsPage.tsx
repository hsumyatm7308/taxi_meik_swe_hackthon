import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { adminApi } from '@/api'
import { useToast } from '@/providers'
import { formatDate } from '@/utils/format'
import {
  CheckCircle2, XCircle, Eye, User, Phone, Mail, Calendar,
  ShieldCheck, ShieldAlert, Clock, Loader2, ZoomIn, X,
  ChevronRight, History, ClipboardList, Car,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { API_BASE_URL } from '@/constants'

interface KYCDriver {
  id: string
  kycStatus: string
  nrcFrontUrl: string | null
  nrcBackUrl: string | null
  selfieUrl: string | null
  drivingLicenseFrontUrl: string | null
  drivingLicenseBackUrl: string | null
  nrcText: string | null
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    createdAt: string
    role?: string
  }
}

interface Props {
  type: 'owners' | 'drivers' | 'cars'
}

// ─── Shared Document Grid ─────────────────────────────────────────────────────
function DocumentGrid({ driver, onLightbox }: { driver: KYCDriver; onLightbox: (url: string) => void }) {
  const isOwner = driver.user.role === 'OWNER'
  const isCar = driver.user.role === 'CAR'
  
  let docs: { label: string; url: string | null }[] = []
  
  if (isCar) {
    docs = [
      { label: 'Owner Book', url: driver.nrcFrontUrl },
      { label: 'Front Image', url: driver.nrcBackUrl },
      { label: 'Back Image', url: driver.selfieUrl },
      { label: 'Left Image', url: driver.drivingLicenseFrontUrl },
      { label: 'Right Image', url: driver.drivingLicenseBackUrl },
    ]
  } else {
    docs = [
      { label: 'NRC Front Side', url: driver.nrcFrontUrl },
      { label: 'NRC Back Side', url: driver.nrcBackUrl },
      { label: 'Selfie / Photo', url: driver.selfieUrl },
    ]
    if (!isOwner) {
      docs.push(
        { label: 'Driving License Front', url: driver.drivingLicenseFrontUrl },
        { label: 'Driving License Back', url: driver.drivingLicenseBackUrl }
      )
    }
  }

  return (
    <div className={cn(
      "grid gap-4",
      isOwner ? "grid-cols-1 md:grid-cols-3" : isCar ? "grid-cols-1 md:grid-cols-3 lg:grid-cols-5" : "grid-cols-1 md:grid-cols-3"
    )}>
      {docs.map(({ label, url }) => (
        <div key={label} className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
          {url ? (
            <div
              className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 group cursor-zoom-in"
              onClick={() => onLightbox(url)}
            >
              <img src={url} alt={label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white" />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-slate-200 aspect-video flex items-center justify-center">
              <p className="text-xs text-muted-foreground">Not uploaded</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Driver Info Strip ────────────────────────────────────────────────────────
function DriverInfoStrip({ driver }: { driver: KYCDriver }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {driver.user.role === 'CAR' ? (
          <Car className="w-4 h-4 shrink-0" />
        ) : (
          <User className="w-4 h-4 shrink-0" />
        )}
        <span className="font-medium text-foreground truncate">{driver.user.name}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Mail className="w-4 h-4 shrink-0" />
        <span className="truncate">{driver.user.email}</span>
      </div>
      {driver.user.phone && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="w-4 h-4 shrink-0" />
          <span>{driver.user.phone}</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="w-4 h-4 shrink-0" />
        <span>Joined {formatDate(driver.user.createdAt)}</span>
      </div>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function KycBadge({ status }: { status: string }) {
  if (status === 'APPROVED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
      </span>
    )
  }
  if (status === 'REJECTED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200/60">
        <XCircle className="w-3.5 h-3.5" /> Rejected
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/50">
      <Clock className="w-3.5 h-3.5" /> Pending Review
    </span>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
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
        alt="Document preview"
        className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  )
}

const mapOwnerToKycDriver = (owner: any): KYCDriver => {
  const nrcFrontDoc = owner.owner_documents?.find((d: any) => d.type === 'nrc_front')
  const nrcBackDoc = owner.owner_documents?.find((d: any) => d.type === 'nrc_back')
  
  const getOwnerDocUrl = (url: string | null) => {
    if (!url) return null
    if (/^(https?:\/\/|data:|blob:)/i.test(url)) return url
    const backendBase = API_BASE_URL.replace('/api', '')
    return `${backendBase}${url.startsWith('/') ? url : `/${url}`}`
  }

  const statusMap: Record<string, string> = {
    verified: 'APPROVED',
    rejected: 'REJECTED',
    pending: 'PENDING'
  }

  return {
    id: owner.id,
    kycStatus: statusMap[owner.verification_status] || 'PENDING',
    nrcFrontUrl: nrcFrontDoc ? getOwnerDocUrl(nrcFrontDoc.file_url) : null,
    nrcBackUrl: nrcBackDoc ? getOwnerDocUrl(nrcBackDoc.file_url) : null,
    selfieUrl: getOwnerDocUrl(owner.profile_photo_url),
    drivingLicenseFrontUrl: null,
    drivingLicenseBackUrl: null,
    nrcText: owner.rejection_reason || null,
    updatedAt: owner.updated_at,
    user: {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      phone: owner.phone || '',
      createdAt: owner.created_at,
      role: 'OWNER'
    }
  }
}

const mapCarToKycDriver = (car: any): KYCDriver => {
  const statusMap: Record<string, string> = {
    verified: 'APPROVED',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    pending: 'PENDING'
  }

  const getCarDocUrl = (url: string | null) => {
    if (!url) return null
    if (/^(https?:\/\/|data:|blob:)/i.test(url)) return url
    const backendBase = API_BASE_URL.replace('/api', '')
    return `${backendBase}${url.startsWith('/') ? url : `/${url}`}`
  }

  return {
    id: car.id,
    kycStatus: statusMap[car.status] || 'PENDING',
    nrcFrontUrl: car.owner_book ? getCarDocUrl(car.owner_book) : null,
    nrcBackUrl: car.images?.front_image ? getCarDocUrl(car.images.front_image) : null,
    selfieUrl: car.images?.back_image ? getCarDocUrl(car.images.back_image) : null,
    drivingLicenseFrontUrl: car.images?.left_image ? getCarDocUrl(car.images.left_image) : null,
    drivingLicenseBackUrl: car.images?.right_image ? getCarDocUrl(car.images.right_image) : null,
    nrcText: null,
    updatedAt: car.updated_at,
    user: {
      id: car.id,
      name: `${car.brand} ${car.model}`,
      email: `Owner: ${car.owner?.name || 'Unknown'}`,
      phone: car.owner?.phone || '',
      createdAt: car.created_at,
      role: 'CAR'
    }
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminVerificationsPage({ type }: Props) {
  const { addToast } = useToast()

  // Pending tab state
  const [pending, setPending] = useState<KYCDriver[]>([])
  const [pendingLoading, setPendingLoading] = useState(true)

  // History tab state
  const [history, setHistory] = useState<KYCDriver[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyFetched, setHistoryFetched] = useState(false)

  // Shared modal state
  const [selectedDriver, setSelectedDriver] = useState<KYCDriver | null>(null)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  // Other types state
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const title =
    type === 'owners' ? 'Owner Verifications' :
    type === 'drivers' ? 'Driver KYC Verifications' :
    'Car Verifications'

  const loadPending = useCallback(async () => {
    try {
      setPendingLoading(true)
      if (type === 'owners') {
        const data = await adminApi.getPendingOwners()
        setPending((data || []).map(mapOwnerToKycDriver))
      } else if (type === 'cars') {
        const data = await adminApi.getPendingCars()
        setPending((data || []).map(mapCarToKycDriver))
      } else {
        const data = await adminApi.getPendingDrivers()
        setPending(data || [])
      }
    } catch {
      setPending([])
    } finally {
      setPendingLoading(false)
    }
  }, [type])

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true)
      if (type === 'owners') {
        const data = await adminApi.getOwnersHistory()
        setHistory((data || []).map(mapOwnerToKycDriver))
      } else if (type === 'cars') {
        const data = await adminApi.getCarsHistory()
        setHistory((data || []).map(mapCarToKycDriver))
      } else {
        const data = await adminApi.getKYCHistory()
        setHistory(data || [])
      }
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
      setHistoryFetched(true)
    }
  }, [type])

  useEffect(() => {
    setHistoryFetched(false)
    loadPending()
  }, [type, loadPending])

  const openReview = (driver: KYCDriver, readOnly: boolean) => {
    setSelectedDriver(driver)
    setIsReadOnly(readOnly)
  }

  const handleApprove = async () => {
    if (!selectedDriver) return
    try {
      setProcessing(true)
      if (type === 'owners') {
        await adminApi.verifyOwner(selectedDriver.id, 'verified')
        addToast(`✅ ${selectedDriver.user.name}'s account has been verified.`, 'success')
      } else if (type === 'cars') {
        await adminApi.verifyCar(selectedDriver.id, 'verified')
        addToast(`✅ ${selectedDriver.user.name} has been verified.`, 'success')
      } else {
        await adminApi.reviewDriverKYC(selectedDriver.id, 'APPROVED')
        addToast(`✅ ${selectedDriver.user.name}'s KYC has been approved.`, 'success')
      }
      setPending((prev) => prev.filter((d) => d.id !== selectedDriver.id))
      setSelectedDriver(null)
      // Invalidate history cache so it refreshes next time
      setHistoryFetched(false)
    } catch {
      addToast('Failed to approve. Please try again.', 'error')
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectConfirm = async () => {
    if (!selectedDriver) return
    try {
      setProcessing(true)
      if (type === 'owners') {
        await adminApi.verifyOwner(selectedDriver.id, 'rejected', rejectionReason || undefined)
        addToast(`❌ ${selectedDriver.user.name}'s verification request has been rejected.`, 'success')
      } else if (type === 'cars') {
        await adminApi.verifyCar(selectedDriver.id, 'rejected', rejectionReason || undefined)
        addToast(`❌ ${selectedDriver.user.name}'s verification request has been rejected.`, 'success')
      } else {
        await adminApi.reviewDriverKYC(selectedDriver.id, 'REJECTED', rejectionReason || undefined)
        addToast(`❌ ${selectedDriver.user.name}'s KYC has been rejected.`, 'success')
      }
      setPending((prev) => prev.filter((d) => d.id !== selectedDriver.id))
      setSelectedDriver(null)
      setShowRejectDialog(false)
      setRejectionReason('')
      setHistoryFetched(false)
    } catch {
      addToast('Failed to reject. Please try again.', 'error')
    } finally {
      setProcessing(false)
    }
  }

  // ─── Driver, Owner, & Car — Tabbed View ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage {type === 'owners' ? 'owner' : type === 'cars' ? 'vehicle' : 'driver'} identity verification requests
        </p>
      </div>

      <Tabs defaultValue="pending" onValueChange={(tab) => {
        if (tab === 'history' && !historyFetched) loadHistory()
      }}>
        <TabsList className="mb-2">
          <TabsTrigger
            value="pending"
            className="gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Pending
            {pending.length > 0 && (
              <span className="ml-1 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-primary/10 px-1 text-[10px] font-bold leading-none text-primary">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="gap-2"
          >
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* ── Pending Tab ── */}
        <TabsContent value="pending">
          <div className="flex justify-end mb-3">
            <Button variant="outline" size="sm" onClick={loadPending} disabled={pendingLoading}>
              Refresh
            </Button>
          </div>

          {pendingLoading ? (
            <LoadingSkeleton type="list" count={4} />
          ) : pending.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-lg">All clear!</p>
                  <p className="text-sm text-muted-foreground">
                    No pending {type === 'owners' ? 'owner' : type === 'cars' ? 'vehicle' : 'driver KYC'} verifications.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {pending.map((driver) => (
                  <motion.div key={driver.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <Card
                      className="hover:shadow-md transition-shadow cursor-pointer border border-slate-100"
                      onClick={() => openReview(driver, false)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                              {driver.user.role === 'CAR' ? (
                                <Car className="w-5 h-5 text-amber-600" />
                              ) : (
                                <User className="w-5 h-5 text-amber-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{driver.user.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{driver.user.email}</p>
                              {driver.user.phone && <p className="text-xs text-muted-foreground">{driver.user.phone}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="hidden sm:flex flex-col items-end text-right">
                              <KycBadge status={driver.kycStatus} />
                              <p className="text-xs text-muted-foreground mt-1">Submitted {formatDate(driver.updatedAt)}</p>
                            </div>
                            <Button size="sm" variant="outline" className="gap-1.5">
                              <Eye className="w-3.5 h-3.5" /> Review <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
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

        {/* ── History Tab ── */}
        <TabsContent value="history">
          <div className="flex justify-end mb-3">
            <Button variant="outline" size="sm" onClick={loadHistory} disabled={historyLoading}>
              Refresh
            </Button>
          </div>

          {historyLoading ? (
            <LoadingSkeleton type="list" count={4} />
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-3">
              <History className="w-10 h-10 text-muted-foreground/40" />
              <div>
                <p className="font-semibold">No history yet</p>
                <p className="text-sm text-muted-foreground">
                  Approved or rejected {type === 'owners' ? 'owners' : type === 'cars' ? 'vehicles' : 'drivers'} will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((driver) => (
                <motion.div key={driver.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card
                    className="hover:shadow-md transition-shadow cursor-pointer border border-slate-100"
                    onClick={() => openReview(driver, true)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                            driver.kycStatus === 'APPROVED'
                              ? "bg-emerald-100"
                              : "bg-red-100"
                          )}>
                            {driver.kycStatus === 'APPROVED'
                              ? <ShieldCheck className="w-5 h-5 text-emerald-600" />
                              : <ShieldAlert className="w-5 h-5 text-red-600" />
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{driver.user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{driver.user.email}</p>
                            {driver.kycStatus === 'REJECTED' && driver.nrcText && (
                              <p className="text-xs text-red-500 mt-0.5 truncate">Reason: {driver.nrcText}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="hidden sm:flex flex-col items-end text-right">
                            <KycBadge status={driver.kycStatus} />
                            <p className="text-xs text-muted-foreground mt-1">
                              {driver.kycStatus === 'APPROVED' ? 'Approved' : 'Rejected'} {formatDate(driver.updatedAt)}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground">
                            <Eye className="w-3.5 h-3.5" /> View <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
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

      {/* ─── KYC Review / Detail Modal ─────────────────────────────────────── */}
      <Dialog open={!!selectedDriver} onOpenChange={(o) => { if (!o) setSelectedDriver(null) }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto pb-10">
          {selectedDriver && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {isReadOnly ? (
                    <>
                      <KycBadge status={selectedDriver.kycStatus} />
                      <span className="ml-1">
                        {type === 'owners' ? 'Owner Verification' : type === 'cars' ? 'Car Verification' : 'KYC Record'} — {selectedDriver.user.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-5 h-5 text-amber-500" />
                      {type === 'owners' ? 'Owner Review' : type === 'cars' ? 'Car Review' : 'KYC Review'} — {selectedDriver.user.name}
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {isReadOnly
                    ? 'Read-only view of the submitted documents and final decision.'
                    : `Inspect the submitted ${type === 'cars' ? 'vehicle' : 'identity'} documents, then approve or reject this ${type === 'owners' ? 'owner' : type === 'cars' ? 'car' : 'driver'}.`}
                </DialogDescription>
              </DialogHeader>

              <DriverInfoStrip driver={selectedDriver} />

              {/* Rejection reason banner (history only) */}
              {isReadOnly && selectedDriver.kycStatus === 'REJECTED' && selectedDriver.nrcText && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200/60 text-sm">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-700">Rejection Reason</p>
                    <p className="text-red-600 mt-0.5">{selectedDriver.nrcText}</p>
                  </div>
                </div>
              )}

              <DocumentGrid driver={selectedDriver} onLightbox={setLightboxUrl} />

              <DialogFooter className="gap-2 pt-2">
                {isReadOnly ? (
                  <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900" onClick={() => setSelectedDriver(null)}>
                    Close
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900" onClick={() => setSelectedDriver(null)} disabled={processing}>
                      Close
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowRejectDialog(true)}
                      disabled={processing}
                      className="gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={processing}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {processing
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                        : <><CheckCircle2 className="w-4 h-4" /> Approve</>
                      }
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Reject Reason Dialog ──────────────────────────────────────────── */}
      <Dialog open={showRejectDialog} onOpenChange={(o) => { if (!o) { setShowRejectDialog(false); setRejectionReason('') } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="w-5 h-5" /> Reject {type === 'owners' ? 'Owner Verification' : type === 'cars' ? 'Car Verification' : 'KYC Submission'}
            </DialogTitle>
            <DialogDescription>
              Optionally provide a short reason for rejection. The {type === 'owners' ? 'owner' : type === 'cars' ? 'car owner' : 'driver'} will need to re-submit their documents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Rejection Reason <span className="text-muted-foreground">(optional)</span></label>
            <textarea
              className={cn(
                "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
                "ring-offset-background placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "resize-none h-24"
              )}
              placeholder="e.g. Images are blurry or document has expired..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900" onClick={() => { setShowRejectDialog(false); setRejectionReason('') }} disabled={processing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm} disabled={processing} className="gap-2">
              {processing
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Rejecting...</>
                : <><XCircle className="w-4 h-4" /> Confirm Reject</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Lightbox ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxUrl && <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
      </AnimatePresence>
    </div>
  )
}
