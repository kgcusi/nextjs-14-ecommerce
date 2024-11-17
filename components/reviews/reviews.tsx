'use client'
import ReviewsForm from './reviews-form'

export default async function Reviews({ productId }: { productId: number }) {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-4">Product Reviews</h2>
      <div>
        <ReviewsForm />
      </div>
    </div>
  )
}
