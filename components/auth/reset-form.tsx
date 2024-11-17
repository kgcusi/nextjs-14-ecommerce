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
import { z } from 'zod'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import Link from 'next/link'
import { useAction } from 'next-safe-action/hooks'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { FormSuccess } from './form-success'
import { FormError } from './form-error'
import { ResetSchema } from '@/types/reset-schema'
import { reset } from '@/server/actions/password-reset'

export const ResetForm = () => {
  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: '',
    },
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { execute, status, result } = useAction(reset, {
    onSuccess({ data }) {
      if (data?.error) setError(data.error)
      if (data?.success) setSuccess(data.success)
    },
  })

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    execute(values)
  }

  return (
    <AuthCard
      cardTitle="Forgot your password? Enter your email to reset it"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="karlcusi@gmail.com"
                        type="email"
                        disabled={status === 'executing'}
                        autoComplete="email"
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
