import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { adminApi, apiCache } from '@/api'
import { useToast } from '@/providers'
import type { User } from '@/types'
import { formatDate } from '@/utils/format'
import { Shield, ShieldOff, User as UserIcon, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function AdminUsersPage() {
  const { addToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(() => !apiCache.has('/admin/users', { role: roleFilter || undefined }))
  const [processing, setProcessing] = useState<string | number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadUsers()
  }, [roleFilter])


  const loadUsers = async () => {
    try {
      const params = { role: roleFilter || undefined }
      const hasCache = apiCache.has('/admin/users', params)
      if (!hasCache) {
        setLoading(true)
      }
      const data = await adminApi.getUsers(roleFilter || undefined)
      setUsers(data)
    } catch {
      // handle
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async (userId: string | number, reason: string) => {
    try {
      setProcessing(userId)
      await adminApi.suspendUser(userId, reason)
      addToast('User suspended', 'success')
      loadUsers()
    } catch {
      addToast('Failed to suspend', 'error')
    } finally {
      setProcessing(null)
    }
  }

  const handleUnsuspend = async (userId: string | number) => {
    try {
      setProcessing(userId)
      await adminApi.unsuspendUser(userId)
      addToast('User unsuspended', 'success')
      loadUsers()
    } catch {
      addToast('Failed to unsuspend', 'error')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) return <LoadingSkeleton type="list" count={8} />

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Tabs value={roleFilter} onValueChange={setRoleFilter}>
          <TabsList>
            <TabsTrigger value="">All</TabsTrigger>
            <TabsTrigger value="owner">Owners</TabsTrigger>
            <TabsTrigger value="driver">Drivers</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search users by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white border border-slate-200"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState title={searchQuery ? "No matching users found" : "No users found"} description={searchQuery ? "Try adjusting your search term." : undefined} />
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (

            <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><UserIcon className="w-5 h-5" /></div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-800">{user.name}</p>
                          <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
                            {user.role.toLowerCase()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{user.email} &middot; {user.phone || 'No phone'}</p>
                        
                        {/* Driver/Owner NRC & Address details */}
                        {(user.role === 'DRIVER' || user.role === 'OWNER') && (
                          <div className="mt-2 text-xs space-y-0.5 border-t border-slate-100 pt-2 font-medium text-slate-600">
                            {user.nrc_number && (
                              <p>
                                <span className="text-muted-foreground">NRC:</span>{' '}
                                <span className="text-slate-800 font-mono">{user.nrc_number}</span>
                              </p>
                            )}
                            {(user.address || user.township || user.city) && (
                              <p>
                                <span className="text-muted-foreground">Address:</span>{' '}
                                <span className="text-slate-800">
                                  {[user.address, user.township, user.city].filter(Boolean).join(', ')}
                                </span>
                              </p>
                            )}
                          </div>
                        )}
                        
                        <p className="text-[10px] text-muted-foreground mt-1">Joined {formatDate(user.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                      <StatusBadge status={user.verification_status} type="verification" />
                      {user.verification_status === 'suspended' ? (
                        <Button size="sm" variant="outline" onClick={() => handleUnsuspend(user.id)} disabled={processing === user.id}>
                          <Shield className="w-4 h-4 mr-1" /> Unsuspend
                        </Button>
                      ) : (
                        <Button size="sm" variant="destructive" onClick={() => handleSuspend(user.id, 'Admin action')} disabled={processing === user.id}>
                          <ShieldOff className="w-4 h-4 mr-1" /> Suspend
                        </Button>
                      )}
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
