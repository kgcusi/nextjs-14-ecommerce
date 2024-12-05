import * as z from 'zod'

export const createOrderSchema = z.object({
  total: z.number(),
  status: z.string(),
  paymentIntentId: z.string(),
  products: z.array(
    z.object({
      quantity: z.number(),
      productId: z.number(),
      variantId: z.number(),
    }),
  ),
})
