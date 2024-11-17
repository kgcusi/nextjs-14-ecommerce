'use server'

import { SettingsSchema } from '@/types/settings-schema'
import { createSafeActionClient } from 'next-safe-action'
import { auth } from '../auth'
import { db } from '..'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import { revalidatePath } from 'next/cache'
import { users } from './../schema'

const action = createSafeActionClient()

export const settings = action
  .schema(SettingsSchema)
  .action(
    async ({
      parsedInput: {
        email,
        name,
        image,
        password,
        newPassword,
        isTwoFactorEnabled,
      },
    }) => {
      const user = await auth()
      if (!user) return { error: 'User not found' }

      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.user.id),
      })
      if (!dbUser) return { error: 'User not found' }

      if (user.user.isOAuth) {
        email = undefined
        password = undefined
        newPassword = undefined
        isTwoFactorEnabled = undefined
      }

      if (password && newPassword && dbUser.password) {
        const passwordMatch = await bcrypt.compare(password, dbUser.password)
        if (!passwordMatch) return { error: 'Incorrect password' }

        const samePassword = await bcrypt.compare(newPassword, dbUser.password)
        if (samePassword)
          return {
            error: 'New password cannot be the same as the old password',
          }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        password = hashedPassword
        newPassword = undefined
      }
      const updatedUser = await db
        .update(users)
        .set({
          email,
          name,
          image,
          password,
          twoFactorEnabled: isTwoFactorEnabled,
        })
        .where(eq(users.id, dbUser.id))

      revalidatePath('/dashboard/settings')

      return { success: 'Settings updated' }
    },
  )
