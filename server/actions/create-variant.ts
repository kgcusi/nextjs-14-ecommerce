'use server'

import { VariantSchema } from '@/types/variant-schema'
import { createSafeActionClient } from 'next-safe-action'
import { db } from '..'
import {
  products,
  productVariants,
  variantImages,
  variantTags,
} from '../schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { algoliasearch } from 'algoliasearch'

const action = createSafeActionClient()

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_WRITE_KEY!,
)

export const createVariant = action
  .schema(VariantSchema)
  .action(
    async ({
      parsedInput: {
        id,
        color,
        editMode,
        productId,
        productType,
        tags,
        variantImages: newImages,
      },
    }) => {
      try {
        if (editMode && id) {
          const updatedVariant = await db
            .update(productVariants)
            .set({ color, productType, updated: new Date() })
            .where(eq(productVariants.id, id))
            .returning()
          await db
            .delete(variantTags)
            .where(eq(variantTags.variantId, updatedVariant[0].id))
          await db.insert(variantTags).values(
            tags.map((tag) => ({
              tag,
              variantId: updatedVariant[0].id,
            })),
          )
          await db
            .delete(variantImages)
            .where(eq(variantImages.variantId, updatedVariant[0].id))
          await db.insert(variantImages).values(
            newImages.map((image, idx) => ({
              name: image.name,
              size: image.size,
              url: image.url,
              variantId: updatedVariant[0].id,
              order: idx,
            })),
          )

          await client.partialUpdateObject({
            indexName: 'products',
            objectID: updatedVariant[0].id.toString(),
            attributesToUpdate: {
              productType,
              color,
              tags,
              images: newImages.map((image) => image.url),
            },
          })

          revalidatePath('/dashboard/products')
          return { success: `Edited ${productType}` }
        }
        if (!editMode) {
          const newVariant = await db
            .insert(productVariants)
            .values({
              color,
              productId,
              productType,
            })
            .returning()
          await db.insert(variantTags).values(
            tags.map((tag) => ({
              tag,
              variantId: newVariant[0].id,
            })),
          )
          await db.insert(variantImages).values(
            newImages.map((image, idx) => ({
              name: image.name,
              size: image.size,
              url: image.url,
              variantId: newVariant[0].id,
              order: idx,
            })),
          )

          const product = await db.query.products.findFirst({
            where: eq(products.id, productId),
          })

          if (product) {
            await client.saveObject({
              indexName: 'products',
              body: {
                objectID: newVariant[0].id,
                id: newVariant[0].id,
                title: product?.title,
                price: product?.price,
                productType: newVariant[0].productType,
                variantImages: newImages[0].url,
              },
            })
          }

          revalidatePath('/dashboard/products')
          return { success: `Created ${productType}` }
        }
      } catch (err) {
        return { error: 'Failed to create variant' }
      }
    },
  )
