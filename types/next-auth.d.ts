import NextAuth, { type DefaultSession } from 'next-auth'

export type ExtendUser = DefaultSession['user'] & {
  id: string
  role: string
  twoFactorEnabled: boolean
  isOAuth: boolean
  image: string
}

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: ExtendUser
  }
}
