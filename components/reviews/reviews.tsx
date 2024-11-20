import { db } from '@/server'
import Review from './review'
import ReviewsForm from './reviews-form'
import { desc, eq } from 'drizzle-orm'
import { reviews } from '@/server/schema'
import ReviewChart from './review-chart'

export default async function Reviews({ productId }: { productId: number }) {
  const data = await db.query.reviews.findMany({
    where: eq(reviews.productId, productId),
    with: { user: true },
    orderBy: [desc(reviews.created)],
  })
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-4">Product Reviews</h2>
      <div className="flex lg:flex-row flex-col gap-2 lg:gap-12 justify-stretch">
        <div className="flex-1">
          <Review reviews={data} />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <ReviewsForm />
          <ReviewChart reviews={data} />
        </div>
      </div>
    </section>
  )
}
