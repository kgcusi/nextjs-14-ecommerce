'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Session } from 'next-auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SettingsSchema } from '@/types/settings-schema'
import Image from 'next/image'
import { Switch } from '@/components/ui/switch'
import { FormError } from '@/components/auth/form-error'
import { FormSuccess } from '@/components/auth/form-success'
import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { settings } from '@/server/actions/settings'
import { UploadButton } from '@/app/api/uploadthing/upload'

type SettingsForm = {
  session: Session
}

export default function SettingsCard(session: SettingsForm) {
  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: session.session.user?.name || undefined,
      email: session.session.user?.email || undefined,
      isTwoFactorEnabled: session.session.user?.twoFactorEnabled || false,
      image: session.session.user?.image || undefined,
      password: undefined,
      newPassword: undefined,
    },
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)

  const { execute, status, result } = useAction(settings, {
    onSuccess({ data }) {
      if (data?.error) setError(data.error)
      if (data?.success) setSuccess(data.success)
    },
  })

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    setSuccess('')
    setError('')
    execute(values)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Settings</CardTitle>
        <CardDescription>Update your account settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      disabled={status === 'executing'}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar</FormLabel>
                  <div className="flex items-center gap-4">
                    {!form.getValues('image') && (
                      <div className="font-bold">
                        {session.session.user?.name?.charAt(0)}
                      </div>
                    )}
                    {form.getValues('image') && (
                      <Image
                        className="rounded-full"
                        alt="User Image"
                        src={form.getValues('image')!}
                        width={42}
                        height={42}
                      />
                    )}
                    <UploadButton
                      className="scale-75 ut-button:ring-primary  ut-label:bg-red-50  ut-button:bg-primary/75  hover:ut-button:bg-primary/100 ut:button:transition-all ut-button:duration-500  ut-label:hidden ut-allowed-content:hidden"
                      endpoint="avatarUploader"
                      onUploadBegin={() => {
                        setAvatarUploading(true)
                      }}
                      onUploadError={(error: Error) => {
                        form.setError('image', {
                          type: 'validate',
                          message: error.message,
                        })
                        setAvatarUploading(false)
                        return
                      }}
                      onClientUploadComplete={(res) => {
                        form.setValue('image', res[0].url!)
                        setAvatarUploading(false)
                        return
                      }}
                    />
                  </div>
                  <FormControl>
                    <Input
                      type="hidden"
                      placeholder="User Image"
                      disabled={status === 'executing'}
                      {...field}
                    />
                  </FormControl>

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
                      placeholder="********"
                      type="password"
                      disabled={
                        status === 'executing' || session.session.user.isOAuth
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="********"
                      type="password"
                      disabled={
                        status === 'executing' || session.session.user.isOAuth
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isTwoFactorEnabled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Two Factor Authenticator</FormLabel>
                  <FormDescription>
                    Enable two factor authentication for your account.
                  </FormDescription>
                  <FormControl>
                    <Switch
                      disabled={
                        status === 'executing' || session.session.user.isOAuth
                      }
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button
              disabled={status === 'executing' || avatarUploading}
              type="submit"
            >
              Update your settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
