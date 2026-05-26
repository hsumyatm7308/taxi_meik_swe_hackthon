import { Navigate } from 'react-router-dom'
import { useAuth } from '@/providers'
import { UserRole } from '@/types'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'

interface GuestRouteProps {
  children: React.ReactNode
}

/** Redirects authenticated users to their role dashboard. */
export function GuestRoute({ children }: GuestRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md px-4">
          <LoadingSkeleton type="detail" />
        </div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    // Redirect to the correct dashboard based on role
    switch (user.role) {
      case UserRole.Owner:
        return <Navigate to="/owner" replace />
      case UserRole.Driver:
        return <Navigate to="/driver" replace />
      case UserRole.Admin:
        return <Navigate to="/admin" replace />
      default:
        return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
