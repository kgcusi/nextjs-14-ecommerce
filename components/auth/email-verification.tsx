'use client'

import { newVerification } from '@/server/actions/tokens'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { AuthCard } from './auth-card'
import { FormSuccess } from './form-success'
import { FormError } from './form-error'

const EmailVerificationForm = () => {
  const token = useSearchParams().get('token')
  const router = useRouter()

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleVerification = useCallback(() => {
    if (success || error) return
    if (!token) return setError('Token not found')

    newVerification(token).then((data) => {
      if (data.error) setError(data.error)
      if (data.success) {
        setSuccess(data.success)
        router.push('/auth/login')
      }
    })
  }, [])

  useEffect(() => {
    handleVerification()
  }, [])

  return (
    <AuthCard
      cardTitle="Verify your account"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center flex-col w-full justify-center">
        <p>{!success && !error ? 'Verifying email' : null}</p>
        <FormSuccess message={success} />
        <FormError message={error} />
      </div>
    </AuthCard>
  )
}

export default EmailVerificationForm
