// components/mdx/code-block.tsx
// シンタックスハイライト付きコードブロック

import { cn } from '@/lib/utils'

type Props = {
  children: React.ReactNode
  className?: string
  language?: string
  filename?: string
}

export function CodeBlock({ children, className, language, filename }: Props) {
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-border">
      {(filename || language) && (
        <div className="bg-background-secondary px-4 py-2 text-sm text-foreground-muted border-b border-border flex items-center justify-between">
          {filename && <span className="font-mono">{filename}</span>}
          {language && !filename && (
            <span className="font-mono">{language}</span>
          )}
        </div>
      )}
      <pre className={cn('p-4 overflow-x-auto bg-background-secondary', className)}>
        {children}
      </pre>
    </div>
  )
}
