'use server'

import { eq } from 'drizzle-orm'
import { db } from '..'
import { products } from '../schema'

export async function getProduct(id: number) {
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    })

    if (!product) return { error: 'Product not found' }

    return { success: product }
  } catch (error) {
    return { error: 'An error occurred' }
  }
}
