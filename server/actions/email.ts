'use server'

import getBaseURL from '@/lib/base-url'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const domain = getBaseURL()

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`

  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Sproud and Scribble - Confirmation Email',
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm your email address.</p>`,
  })

  if (error) return error
  if (data) return data
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`

  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Sproud and Scribble - Password Reset',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  })

  if (error) return error
  if (data) return data
}

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`

  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Sproud and Scribble - Your Two Factor Token',
    html: `<p>Your Confirmation Code: ${token}</p>`,
  })

  if (error) return error
  if (data) return data
}
