import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User, LoginRequest, RegisterOwnerRequest, RegisterDriverRequest } from '@/types'
import { UserRole } from '@/types'
import { authApi } from '@/api'

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
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  const fetchUser = useCallback(async () => {
    if (!token) {
      setIsLoading(false)
      return
    }
    try {
      const userData = await authApi.me()
      setUser(userData)
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(async (data: LoginRequest) => {
    const res = await authApi.login(data)
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res.user))
    setToken(res.token)
    setUser(res.user)
  }, [])

  const registerOwner = useCallback(async (data: RegisterOwnerRequest) => {
    const res = await authApi.registerOwner(data)
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res.user))
    setToken(res.token)
    setUser(res.user)
  }, [])

  const registerDriver = useCallback(async (data: RegisterDriverRequest) => {
    const res = await authApi.registerDriver(data)
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res.user))
    setToken(res.token)
    setUser(res.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
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
