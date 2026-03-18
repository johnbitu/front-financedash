import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

type PageLoadingProps = {
  className?: string
  children?: ReactNode
}

export function PageLoading({ className, children }: PageLoadingProps) {
  return (
    <div className={cn('flex h-[50vh] items-center justify-center', className)}>
      {children ?? <Spinner className="size-8" />}
    </div>
  )
}
