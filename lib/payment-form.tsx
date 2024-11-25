'use client'

import {
  AddressElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { useCartStore } from './client-store'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { createPaymentIntent } from '@/server/actions/create-payment-intent'

export default function PaymentForm({ totalPrice }: { totalPrice: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const { cart } = useCartStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    if (!stripe || !elements) {
      setIsLoading(false)
      return
    }
    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message!)
      setIsLoading(false)
      return
    }

    const data = await createPaymentIntent({
      amount: totalPrice,
      currency: 'usd',
      cart: cart.map((item) => ({
        quantity: item.variant.quantity,
        productId: item.id,
        title: item.name,
        price: item.price,
        image: item.image,
      })),
    })
    if (data?.data?.error) {
      setError(data.data.error)
      setIsLoading(false)
      return
    }
    if (data?.data?.success) {
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret: data.data.success?.clientSecret!,
        redirect: 'if_required',
        confirmParams: {
          return_url: 'http://localhost:3000/success',
          receipt_email: data.data.success?.user as string,
        },
      })
      if (error) {
        setError(error.message!)
        setIsLoading(false)
        return
      } else {
        setIsLoading(false)
        window.location.href = 'http://localhost:3000/success'
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <AddressElement options={{ mode: 'shipping' }} />
      <Button disabled={!stripe || !elements}>
        <span>Pay now</span>
      </Button>
    </form>
  )
}
