'use client'
import { Toaster as Toasty } from 'sonner'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function Toaster() {
  const { theme } = useTheme()

  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (typeof theme === 'string') {
    return (
      mounted && (
        <Toasty
          richColors
          position="top-right"
          theme={theme as 'light' | 'dark' | 'system' | undefined}
        />
      )
    )
  }
}
