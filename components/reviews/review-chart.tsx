'use client'

import { ReviewsWithUser } from '@/lib/infer-type'
import { Card, CardDescription, CardTitle } from '../ui/card'
import { getReviewAverage } from '@/lib/review-average'
import { useMemo } from 'react'
import { Progress } from '@/components/ui/progress'

export default function ReviewChart({
  reviews,
}: {
  reviews: ReviewsWithUser[]
}) {
  const totalRating = getReviewAverage(reviews.map((r) => r.rating))

  const getRatingByStars = useMemo(() => {
    const ratingValues = Array.from({ length: 5 }, () => 0)
    const totalReviews = reviews.length

    reviews.forEach((review) => {
      ratingValues[review.rating - 1]++
    })

    return ratingValues.map((rating) => (rating / totalReviews) * 100)
  }, [reviews])

  return (
    <Card className="flex flex-col p-8 rounded-md gap-4">
      <div className="flex gap-2 items-center">
        <CardTitle>Product Rating:</CardTitle>
        <CardDescription className="text-lg font-medium">
          {totalRating.toFixed(1)} stars
        </CardDescription>
      </div>
      {getRatingByStars.map((rating, index) => (
        <div key={index} className="flex gap-2 justify-between items-center">
          <p className="text-xs font-medium flex gap-1">
            {index + 1} <span>Stars</span>
          </p>
          <Progress value={rating} />
        </div>
      ))}
    </Card>
  )
}
