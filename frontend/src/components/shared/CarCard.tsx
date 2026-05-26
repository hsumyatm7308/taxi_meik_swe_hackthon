import { motion } from 'framer-motion'
import { MapPin, Fuel, Users, Gauge, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Car } from '@/types'
import { formatCurrency } from '@/utils/format'

interface CarCardProps {
  car: Car
  onView?: (id: number) => void
  onBook?: (id: number) => void
}

export function CarCard({ car, onView, onBook }: CarCardProps) {
  const primaryPhoto = car.photos?.find((p) => p.is_primary)?.url || car.photos?.[0]?.url || '/placeholder-car.jpg'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group rounded-xl border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={primaryPhoto}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {car.status !== 'verified' && (
          <div className="absolute top-2 left-2">
            <Badge variant="warning">{car.status}</Badge>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={car.is_available ? 'success' : 'secondary'}>
            {car.is_available ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg">{car.brand} {car.model}</h3>
          <p className="text-sm text-muted-foreground">{car.year}</p>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span>{car.city}, {car.location}</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Fuel className="w-3 h-3" /> {car.fuel_type}</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {car.seat_capacity} seats</span>
          <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {car.transmission}</span>
        </div>

        <div className="pt-2 border-t flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary">{formatCurrency(car.daily_rate)}<span className="text-xs text-muted-foreground font-normal">/day</span></p>
            {car.deposit_amount > 0 && (
              <p className="text-xs text-muted-foreground">Deposit: {formatCurrency(car.deposit_amount)}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onView?.(car.id)}>View</Button>
            {car.is_available && car.status === 'verified' && (
              <Button size="sm" onClick={() => onBook?.(car.id)}>Book</Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
