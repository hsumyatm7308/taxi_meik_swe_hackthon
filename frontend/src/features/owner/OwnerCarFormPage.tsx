import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { carSchema, type CarFormData } from '@/utils/validation'
import { KYCLock } from '@/components/shared/KYCLock'
import { carsApi } from '@/api'
import { useToast } from '@/providers'
import { MYANMAR_CITIES, FUEL_OPTIONS, CAR_TYPE_OPTIONS } from '@/constants'

export function OwnerCarFormPage() {
  return (
    <KYCLock feature="Post Car">
      <OwnerCarFormContent />
    </KYCLock>
  )
}

function OwnerCarFormContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
  })

  useEffect(() => {
    if (id) {
      loadCar(Number(id))
    }
  }, [id])

  const loadCar = async (carId: number) => {
    try {
      const car = await carsApi.getById(carId)
      Object.entries(car).forEach(([key, value]) => {
        setValue(key as any, value as any)
      })
    } catch {
      navigate('/owner/cars')
    }
  }

  const onSubmit = async (data: CarFormData) => {
    try {
      setLoading(true)
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      if (id) {
        await carsApi.update(Number(id), formData)
        addToast('Car updated successfully', 'success')
      } else {
        await carsApi.create(formData)
        addToast('Car added successfully', 'success')
      }
      navigate('/owner/cars')
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to save car', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>{id ? 'Edit Car' : 'Add New Car'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input placeholder="Toyota" {...register('brand')} />
                  {errors.brand && <p className="text-xs text-red-500">{errors.brand.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input placeholder="Crown" {...register('model')} />
                  {errors.model && <p className="text-xs text-red-500">{errors.model.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input type="number" placeholder="2020" {...register('year', { valueAsNumber: true })} />
                  {errors.year && <p className="text-xs text-red-500">{errors.year.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input placeholder="White" {...register('color')} />
                  {errors.color && <p className="text-xs text-red-500">{errors.color.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>License Plate</Label>
                  <Input placeholder="YGN-1234" {...register('license_plate')} />
                  {errors.license_plate && <p className="text-xs text-red-500">{errors.license_plate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Seat Capacity</Label>
                  <Input type="number" placeholder="4" {...register('seat_capacity', { valueAsNumber: true })} />
                  {errors.seat_capacity && <p className="text-xs text-red-500">{errors.seat_capacity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Fuel Type</Label>
                  <Select onValueChange={(v) => setValue('fuel_type', v as any)}>
                    <SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger>
                    <SelectContent>
                      {FUEL_OPTIONS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.fuel_type && <p className="text-xs text-red-500">{errors.fuel_type.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Car Type</Label>
                  <Select onValueChange={(v) => setValue('car_type', v as any)}>
                    <SelectTrigger><SelectValue placeholder="Select car type" /></SelectTrigger>
                    <SelectContent>
                      {CAR_TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.car_type && <p className="text-xs text-red-500">{errors.car_type.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Transmission</Label>
                  <Select onValueChange={(v) => setValue('transmission', v)}>
                    <SelectTrigger><SelectValue placeholder="Select transmission" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="auto">Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.transmission && <p className="text-xs text-red-500">{errors.transmission.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Mileage (km)</Label>
                  <Input type="number" placeholder="50000" {...register('mileage', { valueAsNumber: true })} />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Daily Rate (MMK)</Label>
                  <Input type="number" placeholder="50000" {...register('daily_rate', { valueAsNumber: true })} />
                  {errors.daily_rate && <p className="text-xs text-red-500">{errors.daily_rate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Weekly Rate (MMK)</Label>
                  <Input type="number" placeholder="300000" {...register('weekly_rate', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Rate (MMK)</Label>
                  <Input type="number" placeholder="1000000" {...register('monthly_rate', { valueAsNumber: true })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deposit Amount (MMK)</Label>
                <Input type="number" placeholder="200000" {...register('deposit_amount', { valueAsNumber: true })} />
                {errors.deposit_amount && <p className="text-xs text-red-500">{errors.deposit_amount.message}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
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
                  {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="Downtown" {...register('location')} />
                  {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  rows={3}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Car description..."
                  {...register('description')}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/owner/cars')}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Car'}
                  <Save className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
