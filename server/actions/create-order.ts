'use server'

import { createOrderSchema } from '@/types/order-schema'
import { createSafeActionClient } from 'next-safe-action'
import { auth } from '../auth'
import { db } from '..'
import { orderProduct, orders } from '../schema'

const action = createSafeActionClient()

export const createOrder = action
  .schema(createOrderSchema)
  .action(
    async ({ parsedInput: { products, status, total, paymentIntentId } }) => {
      try {
        const user = await auth()
        if (!user) return { error: 'You must be logged in to create an order' }

        const order = await db
          .insert(orders)
          .values({
            status,
            total,
            paymentIntentId,
            userId: user.user.id,
          })
          .returning()

        products.map(async ({ productId, quantity, variantId }) => {
          await db.insert(orderProduct).values({
            quantity,
            productVariantId: variantId,
            orderId: order[0].id,
            productId: productId,
          })
        })

        return { success: 'Order has been added' }
      } catch (e) {
        console.log(e)
        return { error: 'Failed to add order' }
      }
    },
  )
