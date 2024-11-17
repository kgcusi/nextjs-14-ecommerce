'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { useSearchParams } from 'next/navigation'
import { ReviewSchema } from '@/types/reviews-schema'
import { Textarea } from '../ui/textarea'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAction } from 'next-safe-action/hooks'
import { addReview } from '@/server/actions/add-review'
import { toast } from 'sonner'

export default function ReviewsForm() {
  const params = useSearchParams()
  const productId = Number(params.get('productId'))

  const form = useForm<z.infer<typeof ReviewSchema>>({
    resolver: zodResolver(ReviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  })

  const { execute, status } = useAction(addReview, {
    onExecute: (values) => {
      toast.loading('Adding review...')
    },
    onSuccess: ({ data }) => {
      toast.dismiss()
      if (data?.success) toast.success(data?.success)
      if (data?.error) toast.error(data?.error)
      form.reset()
    },
  })

  function onSubmit(values: z.infer<typeof ReviewSchema>) {
    execute({
      comment: values.comment,
      rating: values.rating,
      productId,
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="w-full">
          <Button className="font-medium w-full" variant="secondary">
            Leave a Review
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="comment">Leave your review</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="How would you describe this product?"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="comment">Leave your rating</FormLabel>
                  <FormControl>
                    <Input type="hidden" placeholder="Star Rating" {...field} />
                  </FormControl>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <motion.div
                        className="relative cursor-pointer"
                        whileTap={{ scale: 0.8 }}
                        whileHover={{ scale: 1.2 }}
                        key={value}
                      >
                        <Star
                          key={value}
                          onClick={() => {
                            form.setValue('rating', value, {
                              shouldValidate: true,
                            })
                          }}
                          className={cn(
                            'text-primary bg-transparent transition-all duration-300 ease-in-out',
                            form.getValues('rating') >= value
                              ? 'text-primary'
                              : 'text-muted',
                          )}
                        />
                      </motion.div>
                    ))}
                  </div>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={status === 'executing'}
            >
              {status === 'executing' ? 'Adding review...' : 'Add Review'}
            </Button>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
