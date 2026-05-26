import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileUploader } from '@/components/shared/FileUploader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { usersApi } from '@/api'
import { useToast } from '@/providers'
import type { OwnerDocument } from '@/types'
import { DOCUMENT_TYPES } from '@/constants'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export function OwnerDocumentsPage() {
  const { addToast } = useToast()
  const [documents, setDocuments] = useState<OwnerDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const data = await usersApi.getOwnerDocuments()
      setDocuments(data)
    } catch {
      // handle
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (type: string, file: File) => {
    try {
      setUploading(type)
      const doc = await usersApi.uploadOwnerDocument(type, file)
      setDocuments((prev) => [...prev.filter((d) => d.type !== type), doc])
      addToast(`${type} uploaded successfully`, 'success')
    } catch {
      addToast('Upload failed', 'error')
    } finally {
      setUploading(null)
    }
  }

  const getDocStatus = (type: string) => {
    return documents.find((d) => d.type === type)
  }

  if (loading) return <LoadingSkeleton type="card" count={4} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Owner Documents</h1>
        <p className="text-muted-foreground">Upload your verification documents</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {DOCUMENT_TYPES.map((doc) => {
          const existing = getDocStatus(doc.key)
          return (
            <motion.div key={doc.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{doc.label}</CardTitle>
                    {existing && <StatusBadge status={existing.status} type="document" />}
                  </div>
                </CardHeader>
                <CardContent>
                  {existing?.status === 'approved' ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 p-3 bg-emerald-50 rounded-lg">
                      <CheckCircle className="w-4 h-4" /> Approved
                    </div>
                  ) : existing?.status === 'rejected' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-red-600 p-3 bg-red-50 rounded-lg">
                        <XCircle className="w-4 h-4" /> Rejected
                      </div>
                      {existing.admin_notes && <p className="text-xs text-muted-foreground">Reason: {existing.admin_notes}</p>}
                      <FileUploader
                        label="Re-upload document"
                        onUpload={(file) => handleUpload(doc.key, file)}
                        uploading={uploading === doc.key}
                      />
                    </div>
                  ) : existing?.status === 'pending' ? (
                    <div className="flex items-center gap-2 text-sm text-yellow-600 p-3 bg-yellow-50 rounded-lg">
                      <Clock className="w-4 h-4" /> Under review
                    </div>
                  ) : (
                    <FileUploader
                      label={`Upload ${doc.label}`}
                      onUpload={(file) => handleUpload(doc.key, file)}
                      uploading={uploading === doc.key}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
