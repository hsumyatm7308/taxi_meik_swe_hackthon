import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CarCard } from '@/components/shared/CarCard'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { carsApi } from '@/api'
import type { Car } from '@/types'
import { MYANMAR_CITIES, FUEL_OPTIONS, CAR_TYPE_OPTIONS } from '@/constants'

export function DriverBrowseCarsPage() {
  const navigate = useNavigate()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [carType, setCarType] = useState('')
  const [fuelType, setFuelType] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadCars()
  }, [city, carType, fuelType])

  const loadCars = async () => {
    try {
      setLoading(true)
      const res = await carsApi.list({
        verified_only: true,
        city: city || undefined,
        car_type: carType || undefined,
        fuel_type: fuelType || undefined,
        per_page: 20,
      })
      setCars(res.data)
    } catch {
      setCars([])
    } finally {
      setLoading(false)
    }
  }

  const filteredCars = cars.filter((car) => {
    if (!search) return true
    const q = search.toLowerCase()
    return car.brand.toLowerCase().includes(q) || car.model.toLowerCase().includes(q) || car.location.toLowerCase().includes(q)
  })

  const clearFilters = () => { setCity(''); setCarType(''); setFuelType('') }
  const hasFilters = city || carType || fuelType

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Browse Cars</h1>
          <p className="text-muted-foreground">Find the perfect car for your next rental</p>
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters {hasFilters && <span className="ml-1 w-2 h-2 rounded-full bg-primary" />}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by brand, model, or location..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {showFilters && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex flex-wrap gap-3 p-4 rounded-xl border bg-card">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Cities" /></SelectTrigger>
            <SelectContent>{MYANMAR_CITIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
          </Select>
          <Select value={carType} onValueChange={setCarType}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Car Type" /></SelectTrigger>
            <SelectContent>{CAR_TYPE_OPTIONS.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
          </Select>
          <Select value={fuelType} onValueChange={setFuelType}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Fuel Type" /></SelectTrigger>
            <SelectContent>{FUEL_OPTIONS.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
          </Select>
          {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}><X className="w-4 h-4 mr-1" />Clear</Button>}
        </motion.div>
      )}

      {loading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : filteredCars.length === 0 ? (
        <EmptyState title="No cars found" description="Try adjusting your filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <CarCard key={car.id} car={car} onView={(id) => navigate(`/cars/${id}`)} onBook={(id) => navigate(`/driver/bookings?car=${id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}
