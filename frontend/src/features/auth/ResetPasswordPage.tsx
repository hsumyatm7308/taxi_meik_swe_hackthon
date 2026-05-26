import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { newPasswordSchema } from '@/utils/validation'
import { authApi } from '@/api'
import { useToast } from '@/providers'

export function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { token: token || '', email: '', password: '', password_confirmation: '' },
  })

  const onSubmit = async (data: any) => {
    try {
      setLoading(true)
      await authApi.resetPassword(data)
      addToast('Password reset successful!', 'success')
      navigate('/login')
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Reset failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" {...register('password')} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" {...register('password_confirmation')} />
              {errors.password_confirmation && <p className="text-xs text-red-500">{errors.password_confirmation.message as string}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
            <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">Back to Login</Link>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
