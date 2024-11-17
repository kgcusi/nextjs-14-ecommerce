'use server'
import { RegisterSchema } from '@/types/register-schema'
import { createSafeActionClient } from 'next-safe-action'
import { db } from '..'
import { eq } from 'drizzle-orm'
import { users } from '../schema'
import bcrypt from 'bcrypt'
import { generateEmailVerificationToken } from './tokens'
import { sendVerificationEmail } from './email'

const action = createSafeActionClient()

export const emailRegister = action
  .schema(RegisterSchema)
  .action(async ({ parsedInput: { email, password, name } }) => {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existingUser) {
      if (!existingUser.emailVerified) {
        const verificationToken = await generateEmailVerificationToken(email)
        await sendVerificationEmail(
          verificationToken[0].email,
          verificationToken[0].token,
        )

        return { success: 'Email Confirmation Resent' }
      }
      return { error: 'Email already in use' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.insert(users).values({
      email,
      name,
      password: hashedPassword,
    })

    const verificationToken = await generateEmailVerificationToken(email)
    await sendVerificationEmail(
      verificationToken[0].email,
      verificationToken[0].token,
    )

    return { success: 'Email Confirmation Sent' }
  })
