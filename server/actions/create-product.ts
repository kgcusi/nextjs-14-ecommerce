'use server'

import { ProductSchema } from '@/types/product-schema'
import { eq } from 'drizzle-orm'
import { createSafeActionClient } from 'next-safe-action'
import { db } from '..'
import { products } from '../schema'
import { revalidatePath } from 'next/cache'

const action = createSafeActionClient()

export const createProduct = action
  .schema(ProductSchema)
  .action(async ({ parsedInput: { description, price, title, id } }) => {
    try {
      if (id) {
        const existingProduct = await db.query.products.findFirst({
          where: eq(products.id, id),
        })
        if (!existingProduct) return { error: 'Product does not exist' }
        const updatedProduct = await db
          .update(products)
          .set({
            description,
            price,
            title,
          })
          .where(eq(products.id, id))
          .returning()
        revalidatePath('/dashboard/products')
        return {
          success: `Product ${updatedProduct[0].title} has been updated`,
        }
      }
      const newProduct = await db
        .insert(products)
        .values({
          description,
          price,
          title,
        })
        .returning()
      revalidatePath('/dashboard/products')
      return { success: `Product ${newProduct[0].title} has been created` }
    } catch (e) {
      console.log(e)
      return { error: 'Failed to create product' }
    }
  })
