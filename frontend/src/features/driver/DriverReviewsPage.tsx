import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { reviewsApi } from '@/api'
import type { Review } from '@/types'
import { formatDate } from '@/utils/format'
import { useNavigate } from 'react-router-dom'

export function DriverReviewsPage() {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reviewsApi.getMyReviews().then(setReviews).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton type="list" />
  if (reviews.length === 0) return <div className="space-y-6"><h1 className="text-2xl font-bold">Reviews</h1><EmptyState title="No reviews yet" description="Reviews from completed bookings will appear here." /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reviews</h1>
      <div className="grid gap-3">
        {reviews.map((review) => (
          <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">{formatDate(review.created_at)}</span>
                </div>
                {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                <p className="text-xs text-muted-foreground mt-2">by {review.reviewer?.name || 'Unknown'}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
