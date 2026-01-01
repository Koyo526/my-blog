// components/common/container.tsx
// コンテンツ幅を制限するコンテナ

import { cn } from '@/lib/utils'

type Props = {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className }: Props) {
  return (
    <div className={cn('mx-auto max-w-4xl px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  )
}
