import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { UserPlus, Car, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { registerOwnerSchema, registerDriverSchema } from '@/utils/validation'
import { useAuth, useToast } from '@/providers'
import { MYANMAR_CITIES } from '@/constants'
import { cn } from '@/lib/utils'
import { authApi } from '@/api'

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const { addToast } = useToast()
  const [role, setRole] = useState<'owner' | 'driver'>(searchParams.get('role') === 'driver' ? 'driver' : 'owner')
  const [loading, setLoading] = useState(false)

  const [showOtpModal, setShowOtpModal] = useState(false)
  const [tempToken, setTempToken] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [savedFormData, setSavedFormData] = useState<any>(null)

  const schema = role === 'owner' ? registerOwnerSchema : registerDriverSchema
  type FormData = typeof role extends 'owner' ? ReturnType<typeof registerOwnerSchema.parse> : ReturnType<typeof registerDriverSchema.parse>

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: any) => {
    try {
      setLoading(true)
      setSavedFormData(data)
      
      const response = await authApi.registerRequest({
        ...data,
        role: role.toUpperCase()
      })

      if (response.success) {
        setTempToken(response.tempToken)
        setShowOtpModal(true)
        addToast('Verification code sent to your phone!', 'info')
      }
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempToken || otpCode.length !== 6) return

    try {
      setOtpLoading(true)
      await authApi.registerVerify(tempToken, otpCode)
      addToast('Verification successful! Logging in...', 'success')
      
      await login({
        email: savedFormData.email,
        password: savedFormData.password
      })

      addToast('Welcome to Taxi Meik!', 'success')
      navigate(`/${role}`, { replace: true })
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Verification failed. Please check the code.', 'error')
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Choose your role to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('owner')}
              className={cn('flex-1 p-3 rounded-lg border text-center transition-all', role === 'owner' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50')}
            >
              <Car className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Car Owner</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('driver')}
              className={cn('flex-1 p-3 rounded-lg border text-center transition-all', role === 'driver' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50')}
            >
              <Users className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Taxi Driver</span>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="Your name" {...register('name')} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="you@email.com" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="09xxxxxxxxx" {...register('phone')} />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label>NRC Number</Label>
                <Input placeholder="12/XXXXX(N)XXXXXX" {...register('nrc_number')} />
                {errors.nrc_number && <p className="text-xs text-red-500">{errors.nrc_number.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" placeholder="Min 6 characters" {...register('password')} />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" placeholder="Repeat password" {...register('password_confirmation')} />
                {errors.password_confirmation && <p className="text-xs text-red-500">{errors.password_confirmation.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Select onValueChange={(v) => setValue('city', v)}>
                  <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                  <SelectContent>
                    {MYANMAR_CITIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.city && <p className="text-xs text-red-500">{errors.city.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label>Township</Label>
                <Input placeholder="Township" {...register('township')} />
                {errors.township && <p className="text-xs text-red-500">{errors.township.message as string}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input placeholder="Street address" {...register('address')} />
              {errors.address && <p className="text-xs text-red-500">{errors.address.message as string}</p>}
            </div>

            {role === 'driver' && (
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>License Number</Label>
                  <Input placeholder="License #" {...register('license_number')} />
                  {errors.license_number && <p className="text-xs text-red-500">{errors.license_number.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label>License Expiry</Label>
                  <Input type="date" {...register('license_expiry')} />
                  {errors.license_expiry && <p className="text-xs text-red-500">{errors.license_expiry.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Years Experience</Label>
                  <Input type="number" placeholder="0" {...register('years_experience', { valueAsNumber: true })} />
                  {errors.years_experience && <p className="text-xs text-red-500">{errors.years_experience.message as string}</p>}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
              <UserPlus className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </CardContent>
      </Card>

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-card border border-border/80 shadow-2xl rounded-xl p-6 relative overflow-hidden text-card-foreground"
          >
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold tracking-tight">Phone Verification</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit OTP code to <span className="font-semibold text-foreground">{savedFormData?.phone}</span>. Please enter it below to verify your account.
              </p>
            </div>
            
            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  className="text-center text-2xl tracking-[0.5em] font-semibold py-6"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowOtpModal(false)}
                  disabled={otpLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 font-semibold"
                  disabled={otpCode.length !== 6 || otpLoading}
                >
                  {otpLoading ? 'Verifying...' : 'Verify & Sign In'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
