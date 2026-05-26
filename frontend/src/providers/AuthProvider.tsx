import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User, LoginRequest, RegisterOwnerRequest, RegisterDriverRequest } from '@/types'
import { UserRole } from '@/types'
import { authClient } from '@/lib/auth-client'
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
    try {
      const sessionRes = await authClient.getSession()
      if (sessionRes && sessionRes.data?.user) {
        const u = sessionRes.data.user as unknown as User
        setUser(u)
        setToken('session')
        localStorage.setItem('token', 'session')
        localStorage.setItem('user', JSON.stringify(u))
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
      }
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(async (data: LoginRequest) => {
    let email = data.email

    if (!email && data.phone) {
      const emailRes = await authApi.getEmailByPhone(data.phone)
      email = emailRes.email
    }

    if (!email) {
      throw new Error("Email or Phone number is required to sign in")
    }

    const res = await authClient.signIn.email({
      email,
      password: data.password,
    })

    if (res.error) {
      throw new Error(res.error.message || "Invalid credentials")
    }

    const sessionRes = await authClient.getSession()
    if (sessionRes && sessionRes.data?.user) {
      const u = sessionRes.data.user as unknown as User
      setUser(u)
      setToken('session')
      localStorage.setItem('token', 'session')
      localStorage.setItem('user', JSON.stringify(u))
    }
  }, [])

  const registerOwner = useCallback(async (data: RegisterOwnerRequest) => {
    // Handled custom multi-step registration in the UI
  }, [])

  const registerDriver = useCallback(async (data: RegisterDriverRequest) => {
    // Handled custom multi-step registration in the UI
  }, [])

  const logout = useCallback(async () => {
    try {
      await authClient.signOut()
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
