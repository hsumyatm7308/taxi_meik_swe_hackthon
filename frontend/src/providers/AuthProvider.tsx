import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User, LoginRequest, RegisterOwnerRequest, RegisterDriverRequest } from '@/types'
import { UserRole } from '@/types'

// import { authClient } from '@/lib/auth-client'
// import { authApi } from '@/api'

const MOCK_USER: User = {
  id: 1,
  name: 'Demo Owner',
  email: 'dev@taximeik.com',
  phone: '0912345678',
  role: UserRole.Owner,
  email_verified_at: new Date().toISOString(),
  verification_status: 'unverified',
  suspension_reason: null,
  profile_photo_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  registerOwner: (data: RegisterOwnerRequest) => Promise<void>
  registerDriver: (data: RegisterDriverRequest) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_USER)
  const [token, setToken] = useState<string | null>('mock-token')
  const [isLoading] = useState(false)

  const isAuthenticated = !!user && !!token

  const login = useCallback(async (_data: LoginRequest) => {
    setUser(MOCK_USER)
    setToken('mock-token')
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('user', JSON.stringify(MOCK_USER))
  }, [])

  const registerOwner = useCallback(async (_data: RegisterOwnerRequest) => {
  }, [])

  const registerDriver = useCallback(async (_data: RegisterDriverRequest) => {
  }, [])

  const logout = useCallback(async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        registerOwner,
        registerDriver,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRole() {
  const { user } = useAuth()
  return {
    isAdmin: user?.role === UserRole.Admin,
    isOwner: user?.role === UserRole.Owner,
    isDriver: user?.role === UserRole.Driver,
    role: user?.role,
  }
}
