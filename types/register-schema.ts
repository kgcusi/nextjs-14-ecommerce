import * as z from 'zod'

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters long',
  }),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters long',
  }),
})
