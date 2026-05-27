import apiClient from './client'
import type { AuthResponse, LoginRequest, RegisterOwnerRequest, RegisterDriverRequest, User } from '@/types'

export const authApi = {
  login: async (_data: LoginRequest): Promise<AuthResponse> => {
    throw new Error('Backend under maintenance. Login is disabled.')
  },

  registerOwner: async (_data: RegisterOwnerRequest): Promise<AuthResponse> => {
    throw new Error('Backend under maintenance. Registration is disabled.')
  },

  registerDriver: async (_data: RegisterDriverRequest): Promise<AuthResponse> => {
    throw new Error('Backend under maintenance. Registration is disabled.')
  },

  registerRequest: async (_data: any): Promise<{ success: boolean; tempToken: string; code?: string }> => {
    throw new Error('Backend under maintenance. Registration is disabled.')
  },

  registerVerify: async (_tempToken: string, _code: string): Promise<{ success: boolean }> => {
    throw new Error('Backend under maintenance. Registration is disabled.')
  },

  getEmailByPhone: async (_phone: string): Promise<{ email: string }> => {
    throw new Error('Backend under maintenance. Login is disabled.')
  },

  logout: async (): Promise<void> => {
    // no-op during maintenance
  },

  me: async (): Promise<User> => {
    throw new Error('Backend under maintenance.')
  },

  forgotPassword: async (_email: string): Promise<void> => {
    throw new Error('Backend under maintenance. Password reset is disabled.')
  },

  resetPassword: async (_data: { token: string; email: string; password: string; password_confirmation: string }): Promise<void> => {
    throw new Error('Backend under maintenance. Password reset is disabled.')
  },

  verifyEmail: async (_id: number, _hash: string): Promise<void> => {
    throw new Error('Backend under maintenance.')
  },

  resendVerification: async (): Promise<void> => {
    throw new Error('Backend under maintenance.')
  },
}
