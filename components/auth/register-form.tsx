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
import { RegisterSchema } from '@/types/register-schema'
import { z } from 'zod'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import Link from 'next/link'
import { useAction } from 'next-safe-action/hooks'
import { emailRegister } from '@/server/actions/email-register'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { FormSuccess } from './form-success'
import { FormError } from './form-error'

export const RegisterForm = () => {
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { execute, status, result } = useAction(emailRegister, {
    onSuccess: ({ data }) => {
      if (data?.error) setError(data?.error)
      if (data?.success) setSuccess(data?.success)
    },
  })

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    execute(values)
  }

  return (
    <AuthCard
      cardTitle="Create an account!"
      backButtonHref="/auth/login"
      backButtonLabel="Already have an account?"
      showSocials
    >
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Karl Cusi" type="text" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <span>Register</span>
            </Button>
          </form>
        </Form>
      </div>
    </AuthCard>
  )
}
