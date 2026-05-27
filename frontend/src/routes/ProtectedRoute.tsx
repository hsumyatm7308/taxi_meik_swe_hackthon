import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: UserRole[]
}

export function ProtectedRoute({ children, _roles }: ProtectedRouteProps) {
  return <>{children}</>
}
