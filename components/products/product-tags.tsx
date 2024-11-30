'use client'

import { cn } from '@/lib/utils'
import { Badge } from '../ui/badge'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ProductTags() {
  const router = useRouter()
  const params = useSearchParams()

  const tag = params.get('tag')

  const setFilter = (tag: string) => {
    tag ? router.push(`/?tag=${tag}`) : router.push('/')
  }

  return (
    <div className="my-4 flex gap-4 items-center justify-center">
      <Badge
        onClick={() => setFilter('')}
        className={cn(
          'cursor-pointer hover:opacity:100 bg-black hover:bg-black/75',
          !tag ? 'opacity-100' : 'opacity-50',
        )}
      >
        All
      </Badge>
      <Badge
        onClick={() => setFilter('red')}
        className={cn(
          'cursor-pointer hover:opacity:100 bg-red-500 hover:bg-red-600',
          tag == 'red' ? 'opacity-100' : 'opacity-50',
        )}
      >
        Red
      </Badge>
      <Badge
        onClick={() => setFilter('purple')}
        className={cn(
          'cursor-pointer hover:opacity:100 bg-violet-500 hover:bg-violet-600',
          tag == 'purple' ? 'opacity-100' : 'opacity-50',
        )}
      >
        Purple
      </Badge>
    </div>
  )
}
