import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { adminApi } from '@/api'
import type { AdminAction } from '@/types'
import { formatDateTime } from '@/utils/format'
import { ScrollText } from 'lucide-react'

export function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AdminAction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getAuditLog().then(setLogs).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton type="list" count={10} />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Log</h1>
      {logs.length === 0 ? (
        <EmptyState title="No audit logs" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-4 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p>{log.description}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{log.action_type}</Badge>
                      <span className="text-xs text-muted-foreground">{log.target_type} #{log.target_id}</span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
