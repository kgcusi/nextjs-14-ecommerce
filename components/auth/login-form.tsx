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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'

export const LoginForm = () => {
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      code: '',
    },
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showTwoFactor, setShowTwoFactor] = useState(false)

  const { execute, status, result } = useAction(emailSignIn, {
    onSuccess({ data }) {
      if (data?.error) setError(data.error)
      if (data?.success) setSuccess(data.success)
      if (data?.twoFactor) setShowTwoFactor(true)
    },
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    execute(values)
  }

  return (
    <AuthCard
      cardTitle="Welcome back!"
      backButtonHref="/auth/register"
      backButtonLabel="Create a new Account"
      showSocials
    >
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              {showTwoFactor && (
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {`We've sent you a two factor code to your email.`}
                      </FormLabel>
                      <FormControl>
                        <InputOTP
                          disabled={status === 'executing'}
                          {...field}
                          maxLength={6}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {!showTwoFactor && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="karlcusi@gmail.com"
                            type="email"
                            autoComplete="email"
                          />
                        </FormControl>
                        <FormDescription />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            autoComplete="current-password"
                          />
                        </FormControl>
                        <FormDescription />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <FormSuccess message={success} />
              <FormError message={error} />
              <Button size={'sm'} className="px-0 my-4" variant="link" asChild>
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
              {showTwoFactor ? <span>Verify</span> : <span>Login</span>}
            </Button>
          </form>
        </Form>
      </div>
    </AuthCard>
  )
}
