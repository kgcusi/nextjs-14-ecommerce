'use server'

import { ReviewSchema } from '@/types/reviews-schema'
import { createSafeActionClient } from 'next-safe-action'
import { auth } from '../auth'
import { db } from '..'
import { and, eq } from 'drizzle-orm'
import { reviews } from '../schema'
import { revalidatePath } from 'next/cache'

const action = createSafeActionClient()

export const addReview = action
  .schema(ReviewSchema)
  .action(async ({ parsedInput: { rating, productId, comment } }) => {
    try {
      const session = await auth()
      if (!session) return { error: 'You must be logged in to add a review' }

      const reviewExists = await db.query.reviews.findFirst({
        where: and(
          eq(reviews.productId, productId),
          eq(reviews.userId, session.user.id),
        ),
      })

      if (reviewExists)
        return { error: 'You have already reviewed this product' }

      const newReview = await db
        .insert(reviews)
        .values({
          rating,
          productId,
          comment,
          userId: session.user.id,
        })
        .returning()

      revalidatePath(`/products/${productId}`)
      return { success: `Review added` }
    } catch (e) {
      console.log(e)
      return { error: 'Failed to add review' }
    }
  })
