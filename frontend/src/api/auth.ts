import apiClient from './client'
import type { AuthResponse, LoginRequest, RegisterOwnerRequest, RegisterDriverRequest, User } from '@/types'

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/login', data)
    return res.data.data
  },

  registerOwner: async (data: RegisterOwnerRequest): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/register/owner', data)
    return res.data.data
  },

  registerDriver: async (data: RegisterDriverRequest): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/register/driver', data)
    return res.data.data
  },

  registerRequest: async (data: any): Promise<{ success: boolean; tempToken: string }> => {
    const res = await apiClient.post('/register-request', data)
    return res.data
  },

  registerVerify: async (tempToken: string, code: string): Promise<{ success: boolean }> => {
    const res = await apiClient.post('/register-verify', { tempToken, code })
    return res.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  me: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me')
    return res.data.data
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email })
  },

  resetPassword: async (data: { token: string; email: string; password: string; password_confirmation: string }): Promise<void> => {
    await apiClient.post('/auth/reset-password', data)
  },

  verifyEmail: async (id: number, hash: string): Promise<void> => {
    await apiClient.get(`/auth/email/verify/${id}/${hash}`)
  },

  resendVerification: async (): Promise<void> => {
    await apiClient.post('/auth/email/resend')
  },
}
