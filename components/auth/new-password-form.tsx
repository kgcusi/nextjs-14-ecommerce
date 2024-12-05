'use client'

import { AuthCard } from '@/components/auth/auth-card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema } from '@/types/login-schema'
import { z } from 'zod'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import Link from 'next/link'
import { useAction } from 'next-safe-action/hooks'
import { emailSignIn } from '@/server/actions/email-signin'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { FormSuccess } from './form-success'
import { FormError } from './form-error'
import { NewPasswordSchema } from '@/types/new-password-schema'
import { newPassword } from '@/server/actions/new-password'
import { useSearchParams } from 'next/navigation'

export const NewPasswordForm = () => {
  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: '',
      token: '',
    },
  })

  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { execute, status, result } = useAction(newPassword, {
    onSuccess({ data }) {
      if (data?.error) setError(data.error)
      if (data?.success) setSuccess(data.success)
    },
  })

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    execute({ password: values.password, token })
  }

  return (
    <AuthCard
      cardTitle="Enter a new password"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
      showSocials={false}
    >
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="********"
                        type="password"
                        disabled={status === 'executing'}
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormSuccess message={success} />
              <FormError message={error} />
              <Button size={'sm'} variant="link" asChild>
                <Link href="/auth/reset">Forgot Password</Link>
              </Button>
            </div>
            <Button
              type="submit"
              className={cn(
                'w-full',
                status === 'executing' ? 'animate-pulse' : '',
              )}
            >
              <span>Reset Password</span>
            </Button>
          </form>
        </Form>
      </div>
    </AuthCard>
  )
}
