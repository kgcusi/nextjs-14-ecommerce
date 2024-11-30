'use server'

import { createSafeActionClient } from 'next-safe-action'
import { z } from 'zod'
import { productVariants, variantImages, variantTags } from '../schema'
import { db } from '..'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { algoliasearch } from 'algoliasearch'

const action = createSafeActionClient()

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.ALGOLIA_WRITE_KEY!,
)

export const deleteVariant = action
  .schema(z.object({ id: z.number() }))
  .action(async ({ parsedInput: { id } }) => {
    try {
      const deletedVariant = await db
        .delete(productVariants)
        .where(eq(productVariants.id, id))
        .returning()
      revalidatePath('/dashboard/products')
      await client.deleteObject({
        indexName: 'products',
        objectID: id.toString(),
      })
      return { success: `Deleted ${deletedVariant[0].productType}` }
    } catch (err) {
      return { error: 'Failed to delete variant' }
    }
  })
