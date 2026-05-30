import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/format'

interface CarCardProps {
  car: any
  onView?: (id: string | number) => void
  onBook?: (id: string | number) => void | Promise<void>
  bookingStageLabel?: string
  onBookingStageClick?: () => void
}

export function CarCard({ car, onView, onBook, bookingStageLabel, onBookingStageClick }: CarCardProps) {
  const photos = car.photos || []
  const [imgIdx, setImgIdx] = useState(0)
  const [applying, setApplying] = useState(false)
  const displayRate = car.rental_price || car.daily_rate
  const location = [car.city, car.location].filter(Boolean).join(', ') || 'Location not provided'

  const handleApply = async () => {
    if (!onBook || applying) return

    try {
      setApplying(true)
      await onBook(car.id)
    } finally {
      setApplying(false)
    }
  }

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setImgIdx((i) => (i - 1 + photos.length) % photos.length)
  }
  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setImgIdx((i) => (i + 1) % photos.length)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group flex h-full min-h-[430px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm transition-all hover:border-slate-300 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={photos[imgIdx]?.url || '/placeholder-car.jpg'}
          alt={`${car.brand} ${car.model}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm">
          {car.car_type || 'Car'}
        </div>
        {car.is_available && car.status === 'verified' && (
          <div className="absolute right-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            Available
          </div>
        )}
        {photos.length > 1 && (
          <>
            <button onClick={prevImg} className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextImg} className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_: unknown, i: number) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div>
          <h3 className="line-clamp-2 min-h-12 text-lg font-semibold leading-6 text-slate-950">
            {car.brand} {car.model}
          </h3>
          <p className="mt-2 flex items-start gap-1.5 text-sm leading-5 text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-2">{location}</span>
          </p>
        </div>

        {car.description && (
          <div className="mt-4 min-h-10">
            <p className="line-clamp-2 text-sm leading-5 text-slate-500">{car.description}</p>
          </div>
        )}

        <div className="mt-auto space-y-4 border-t border-slate-200 pt-4">
          <div className="min-w-0">
            <p className="text-xl font-bold text-slate-950">
              {formatCurrency(displayRate)}
            </p>
            {car.deposit_amount > 0 && (
              <p className="mt-1 text-xs text-slate-500">Deposit: {formatCurrency(car.deposit_amount)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => onView?.(car.id)}>View</Button>
            {bookingStageLabel ? (
              <Button size="sm" variant="outline" onClick={onBookingStageClick}>
                {bookingStageLabel}
              </Button>
            ) : car.is_available && car.status === 'verified' && (
              <Button size="sm" disabled={applying} onClick={handleApply}>
                {applying ? 'Sending...' : 'Apply to Rent'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
