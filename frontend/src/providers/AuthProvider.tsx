/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, LoginRequest, RegisterOwnerRequest, RegisterDriverRequest } from '@/types'
import { UserRole } from '@/types'

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

interface DemoAccount {
  phone: string
  password: string
  user: User
}

const AUTH_TOKEN_KEY = 'token'
const AUTH_USER_KEY = 'user'
const DEMO_ACCOUNTS_KEY = 'demo-accounts'

const nowIso = () => new Date().toISOString()

const createUser = (data: {
  name: string
  email: string
  phone: string
  role: UserRole
}): User => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  name: data.name,
  email: data.email,
  phone: data.phone,
  role: data.role,
  email_verified_at: null,
  verification_status: 'pending',
  suspension_reason: null,
  profile_photo_url: null,
  created_at: nowIso(),
  updated_at: nowIso(),
})

const seedDemoAccounts = (): DemoAccount[] => [
  {
    phone: '0912345678',
    password: 'Demo@1234',
    user: createUser({
      name: 'Demo Owner',
      email: 'owner@demo.local',
      phone: '0912345678',
      role: UserRole.Owner,
    }),
  },
  {
    phone: '0923456789',
    password: 'Demo@1234',
    user: createUser({
      name: 'Demo Driver',
      email: 'driver@demo.local',
      phone: '0923456789',
      role: UserRole.Driver,
    }),
  },
]

const readDemoAccounts = (): DemoAccount[] => {
  const raw = localStorage.getItem(DEMO_ACCOUNTS_KEY)
  if (!raw) {
    const seed = seedDemoAccounts()
    localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(seed))
    return seed
  }

  try {
    const parsed = JSON.parse(raw) as DemoAccount[]
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
  } catch {
    // fall through to reseed
  }

  const seed = seedDemoAccounts()
  localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(seed))
  return seed
}

const writeDemoAccounts = (accounts: DemoAccount[]) => {
  localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts))
}

const setSession = (user: User) => {
  const token = `demo-${user.role}-${user.id}`
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  return token
}

const clearSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

const buildOwnerUser = (data: RegisterOwnerRequest): User =>
  createUser({
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: UserRole.Owner,
  })

const buildDriverUser = (data: RegisterDriverRequest): User =>
  createUser({
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: UserRole.Driver,
  })

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(AUTH_USER_KEY)
    if (!storedUser) {
      return null
    }

    try {
      return JSON.parse(storedUser) as User
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY))
  const [isLoading] = useState(false)

  const isAuthenticated = !!user && !!token

  const login = useCallback(async (data: LoginRequest) => {
    const accounts = readDemoAccounts()
    const matchedAccount = accounts.find(
      (account) => account.phone === data.phone && account.password === data.password,
    )

    if (matchedAccount) {
      const nextToken = setSession(matchedAccount.user)
      setToken(nextToken)
      setUser(matchedAccount.user)
      return
    }

    const fallbackUser = createUser({
      name: 'Demo User',
      email: 'demo@demo.local',
      phone: data.phone,
      role: UserRole.Owner,
    })
    const nextToken = setSession(fallbackUser)
    setToken(nextToken)
    setUser(fallbackUser)

    writeDemoAccounts([
      ...accounts,
      {
        phone: data.phone,
        password: data.password,
        user: fallbackUser,
      },
    ])
  }, [])

  const registerOwner = useCallback(async (data: RegisterOwnerRequest) => {
    const userData = buildOwnerUser(data)
    const accounts = readDemoAccounts()
    writeDemoAccounts([
      ...accounts.filter((account) => account.phone !== data.phone),
      {
        phone: data.phone,
        password: data.password,
        user: userData,
      },
    ])
    const nextToken = setSession(userData)
    setToken(nextToken)
    setUser(userData)
  }, [])

  const registerDriver = useCallback(async (data: RegisterDriverRequest) => {
    const userData = buildDriverUser(data)
    const accounts = readDemoAccounts()
    writeDemoAccounts([
      ...accounts.filter((account) => account.phone !== data.phone),
      {
        phone: data.phone,
        password: data.password,
        user: userData,
      },
    ])
    const nextToken = setSession(userData)
    setToken(nextToken)
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    clearSession()
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser))
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
