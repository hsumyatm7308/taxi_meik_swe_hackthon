import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/providers'
import type { UserRole } from '@/types'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { AlertTriangle } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: UserRole[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md px-4">
          <LoadingSkeleton type="detail" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user?.verification_status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Account Suspended</h1>
          <p className="text-muted-foreground mb-2">
            Your account has been suspended.
          </p>
          {user.suspension_reason && (
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              Reason: {user.suspension_reason}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />
  }

  return <>{children}</>
}
