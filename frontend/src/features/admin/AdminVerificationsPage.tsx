import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminApi } from '@/api'
import { useToast } from '@/providers'
import type { User, Car } from '@/types'
import { formatDate } from '@/utils/format'
import { CheckCircle, XCircle, Eye } from 'lucide-react'

interface Props {
  type: 'owners' | 'drivers' | 'cars'
}

export function AdminVerificationsPage({ type }: Props) {
  const { addToast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [processing, setProcessing] = useState<number | null>(null)

  useEffect(() => {
    loadItems()
  }, [type, activeTab])

  const loadItems = async () => {
    try {
      setLoading(true)
      let data: any[]
      if (type === 'owners') data = await adminApi.getPendingOwners()
      else if (type === 'drivers') data = await adminApi.getPendingDrivers()
      else data = await adminApi.getPendingCars()
      setItems(data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id: number, status: string) => {
    try {
      setProcessing(id)
      if (type === 'owners') {
        await adminApi.verifyOwner(id, status)
      } else if (type === 'drivers') {
        await adminApi.verifyDriver(id, status)
      } else {
        await adminApi.verifyCar(id, status)
      }
      addToast(`Verified successfully`, 'success')
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch {
      addToast('Verification failed', 'error')
    } finally {
      setProcessing(null)
    }
  }

  const title = type === 'owners' ? 'Owner Verifications' : type === 'drivers' ? 'Driver Verifications' : 'Car Verifications'

  if (loading) return <div className="space-y-6"><h1 className="text-2xl font-bold">{title}</h1><LoadingSkeleton type="list" count={5} /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>

      {items.length === 0 ? (
        <EmptyState title="All clear" description={`No pending ${type} verifications.`} />
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name || `${item.brand} ${item.model}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.email || `${item.city} - ${item.license_plate || 'No plate'}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Joined {formatDate(item.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.verification_status || item.status || 'pending'} type="verification" />
                      <Button size="sm" variant="success" onClick={() => handleVerify(item.id, 'verified')} disabled={processing === item.id}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleVerify(item.id, 'rejected')} disabled={processing === item.id}>
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
