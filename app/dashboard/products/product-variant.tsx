'use client'

import { VariantsWithImagesTags } from '@/lib/infer-type'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { VariantSchema } from '@/types/variant-schema'
import { InputTags } from './input-tags'
import VariantImages from './variant-images'
import { useAction } from 'next-safe-action/hooks'
import { createVariant } from '@/server/actions/create-variant'
import { toast } from 'sonner'
import React, { useEffect, useState } from 'react'
import { deleteVariant } from '@/server/actions/delete-variant'

export const ProductVariant = ({
  editMode,
  productId,
  variant,
  children,
}: {
  editMode: boolean
  productId: number
  variant?: VariantsWithImagesTags
  children: React.ReactNode
}) => {
  const form = useForm<z.infer<typeof VariantSchema>>({
    resolver: zodResolver(VariantSchema),
    defaultValues: {
      tags: [],
      variantImages: [],
      color: '#00000',
      productType: 'Black Notebook',
      editMode,
      id: undefined,
      productId,
    },
    mode: 'onChange',
  })

  const [open, setOpen] = useState(false)

  const setEdit = () => {
    if (!editMode) {
      form.reset()
      return
    }
    if (editMode && variant) {
      form.setValue('editMode', true)
      form.setValue('id', variant.id)
      form.setValue('productType', variant.productType)
      form.setValue('color', variant.color)
      form.setValue(
        'tags',
        variant.variantTags.map((tag) => tag.tag),
      )
      form.setValue(
        'variantImages',
        variant.variantImages.map((img) => ({
          name: img.name,
          url: img.url,
          size: img.size,
        })),
      )
      form.setValue('productId', variant.productId)
    }
  }

  useEffect(() => {
    setEdit()
  }, [])

  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const { execute, status } = useAction(createVariant, {
    onExecute: (values) => {
      toast.loading(`${editMode ? 'Updating' : 'Creating'} variant`)
      setOpen(false)
    },
    onSuccess: ({ data }) => {
      toast.dismiss()
      if (data?.error) toast.error(data.error)
      if (data?.success) toast.success(data.success)
    },
  })

  const { execute: executeDelete, status: deleteStatus } = useAction(
    deleteVariant,
    {
      onExecute: (values) => {
        toast.loading('Deleting variant')
        setOpen(false)
      },
      onSuccess: ({ data }) => {
        toast.dismiss()
        if (data?.error) toast.error(data.error)
        if (data?.success) toast.success(data.success)
      },
    },
  )

  function onSubmit(values: z.infer<typeof VariantSchema>) {
    execute(values)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-[860px] rounded-md">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit' : 'Create'} your variant</DialogTitle>
          <DialogDescription>
            Manage your product variants here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="productType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Pick a title for your variant"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant Color</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant Tags</FormLabel>
                  <FormControl>
                    <InputTags {...field} onChange={(e) => field.onChange(e)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <VariantImages />
            <div className="flex gap-2">
              {editMode && variant && (
                <Button
                  disabled={
                    status === 'executing' ||
                    deleteStatus === 'executing' ||
                    !form.formState.isValid ||
                    !form.formState.isDirty
                  }
                  variant="destructive"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    executeDelete({ id: variant.id })
                  }}
                >
                  Delete
                </Button>
              )}
              <Button
                disabled={
                  status === 'executing' ||
                  deleteStatus === 'executing' ||
                  !form.formState.isValid ||
                  !form.formState.isDirty
                }
                type="submit"
              >
                {editMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
