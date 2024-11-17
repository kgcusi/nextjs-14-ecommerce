'use server'

import { NewPasswordSchema } from '@/types/new-password-schema'
import { createSafeActionClient } from 'next-safe-action'
import { db } from '..'
import { getPasswordResetTokenByToken } from './tokens'
import { eq } from 'drizzle-orm'
import { passwordResetTokens, users } from '../schema'
import bcrypt from 'bcrypt'
import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'

const action = createSafeActionClient()

export const newPassword = action
  .schema(NewPasswordSchema)
  .action(async ({ parsedInput: { password, token } }) => {
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL })
    const dbPool = drizzle(pool)
    //Check Token
    if (!token) return { error: 'Missing Token' }

    //Check if token is valid
    const existingToken = await getPasswordResetTokenByToken(token)
    if (!existingToken) return { error: 'Token not found' }

    const hasExpired = new Date(existingToken.expires) < new Date()
    if (hasExpired) return { error: 'Token has expired' }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, existingToken.email),
    })
    if (!existingUser) return { error: 'Email does not exist' }

    const hashedPassword = await bcrypt.hash(password, 10)

    await dbPool.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          password: hashedPassword,
        })
        .where(eq(users.id, existingUser.id))
      await tx
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, existingToken.id))
    })
    return { success: 'Password updated' }
  })
