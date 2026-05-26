import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { passwordResetSchema } from '@/utils/validation'
import { authApi } from '@/api'
import { useToast } from '@/providers'

export function ForgotPasswordPage() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(passwordResetSchema),
  })

  const onSubmit = async (data: { email: string }) => {
    try {
      setLoading(true)
      await authApi.forgotPassword(data.email)
      setSent(true)
      addToast('Password reset link sent to your email', 'success')
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to send reset link', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a reset link</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">Check your email for the password reset link.</p>
              <Link to="/login"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Login</Button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input type="email" placeholder="you@email.com" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message as string}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
