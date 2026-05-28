import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileUploader } from '@/components/shared/FileUploader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DOCUMENT_TYPES } from '@/constants'
import { useAuth } from '@/providers'
import { CheckCircle, FileCheck, ShieldCheck, Clock, Loader2 } from 'lucide-react'

const DRIVER_DOCS = DOCUMENT_TYPES.filter((d) => ['nrc_front', 'nrc_back', 'selfie', 'driving_license'].includes(d.key))

interface LocalDoc {
  type: string
  label: string
  fileName: string
  preview: string
}

export function DriverDocumentsPage() {
  const { user, updateUser } = useAuth()
  const [docs, setDocs] = useState<LocalDoc[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  const isVerified = user && ['verified', 'trusted'].includes(user.verification_status)

  const handleUpload = (type: string, label: string, file: File) => {
    setUploading(type)
    setTimeout(() => {
      setDocs((prev) => {
        const filtered = prev.filter((d) => d.type !== type)
        return [...filtered, { type, label, fileName: file.name, preview: URL.createObjectURL(file) }]
      })
      setUploading(null)
    }, 600)
  }

  const getDoc = (type: string) => docs.find((d) => d.type === type)
  const allUploaded = DRIVER_DOCS.every((d) => !!getDoc(d.key))

  const handleConfirmKYC = () => {
    setVerifying(true)
    setTimeout(() => {
      if (updateUser) {
        updateUser({
          ...user!,
          verification_status: 'verified' as any,
        })
      }
      setVerifying(false)
      setShowConfirm(false)
      setVerified(true)
    }, 1500)
  }

  if (verified || isVerified) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">KYC Verification</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your identity verification status</p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
            <ShieldCheck className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold mb-1">KYC Verified</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Your identity has been verified. You now have access to all features including booking cars and managing rentals.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">KYC Verification</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Upload your documents to verify your identity</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {DRIVER_DOCS.map((doc) => {
          const existing = getDoc(doc.key)
          return (
            <motion.div key={doc.key} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{doc.label}</CardTitle>
                    {existing && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <FileCheck className="w-3.5 h-3.5" /> Uploaded
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {existing ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="w-10 h-10 rounded-md bg-emerald-100 overflow-hidden shrink-0">
                        <img src={existing.preview} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{existing.fileName}</p>
                        <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                          <CheckCircle className="w-3 h-3" /> Ready for verification
                        </p>
                      </div>
                    </div>
                  ) : (
                    <FileUploader
                      label={`Upload ${doc.label}`}
                      onUpload={(file) => handleUpload(doc.key, doc.label, file)}
                      uploading={uploading === doc.key}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {allUploaded && !verified && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex justify-center pt-2">
            <Button size="lg" onClick={() => setShowConfirm(true)} className="gap-2 px-8">
              <ShieldCheck className="w-5 h-5" />
              Submit for KYC Verification
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm KYC Submission</DialogTitle>
            <DialogDescription>
              You are about to submit {docs.length} documents for identity verification.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            {docs.map((d) => (
              <div key={d.type} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{d.label}</span>
                <span className="text-muted-foreground ml-auto">{d.fileName}</span>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
            <p className="font-medium flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" /> What happens next?
            </p>
            <p className="text-xs text-blue-700">
              We will verify your KYC. This usually takes <strong>2 business days</strong>. You will be notified once your identity is verified.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <button onClick={() => setShowConfirm(false)} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              Cancel
            </button>
            <button onClick={handleConfirmKYC} disabled={verifying} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2">
              {verifying && <Loader2 className="w-4 h-4 animate-spin" />}
              {verifying ? 'Verifying...' : 'Confirm & Submit'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}