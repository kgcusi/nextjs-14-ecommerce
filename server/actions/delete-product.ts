'use server'

import { eq } from 'drizzle-orm'
import { createSafeActionClient } from 'next-safe-action'
import * as z from 'zod'
import { products } from '../schema'
import { db } from '..'
import { revalidatePath } from 'next/cache'

const action = createSafeActionClient()

export const deleteProduct = action
  .schema(
    z.object({
      id: z.number(),
    }),
  )
  .action(async ({ parsedInput: { id } }) => {
    try {
      const existingProduct = await db.query.products.findFirst({
        where: eq(products.id, id),
      })
      if (!existingProduct) return { error: 'Product does not exist' }
      await db.delete(products).where(eq(products.id, id))
      revalidatePath('/dashboard/products')
      return { success: `Product ${existingProduct.title} has been deleted` }
    } catch (e) {
      console.log(e)
      return { error: 'Failed to delete product' }
    }
  })
