// components/mdx/callout.tsx
// 注意書き・補足情報コンポーネント

import { cn } from '@/lib/utils'

type CalloutType = 'info' | 'warning' | 'tip' | 'error'

type Props = {
  type?: CalloutType
  title?: string
  children: React.ReactNode
}

const styles: Record<CalloutType, string> = {
  info: 'bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-400',
  warning:
    'bg-yellow-500/10 border-yellow-500/50 text-yellow-600 dark:text-yellow-400',
  tip: 'bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400',
  error: 'bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-400',
}

const icons: Record<CalloutType, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  tip: '💡',
  error: '❌',
}

const defaultTitles: Record<CalloutType, string> = {
  info: 'Info',
  warning: 'Warning',
  tip: 'Tip',
  error: 'Error',
}

export function Callout({ type = 'info', title, children }: Props) {
  return (
    <div
      className={cn(
        'border-l-4 rounded-r-lg p-4 my-4',
        styles[type]
      )}
    >
      <div className="flex items-center gap-2 font-medium mb-2">
        <span>{icons[type]}</span>
        <span>{title || defaultTitles[type]}</span>
      </div>
      <div className="text-foreground">{children}</div>
    </div>
  )
}
