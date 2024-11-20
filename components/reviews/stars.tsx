'use client'

import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

export default function Stars({
  rating,
  totalReviews,
  size = 14,
}: {
  rating: number
  totalReviews?: number
  size?: number
}) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          size={size}
          key={star}
          className={cn(
            'text-primary bg-transparent transition-all ease-in-out duration-300',
            rating >= star ? 'fill-primary' : 'text-transparent',
          )}
        />
      ))}
      <span className="text-secondary-foreground text-sm ml-2">
        {totalReviews} reviews
      </span>
    </div>
  )
}
