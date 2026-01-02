'use client'

// components/home/board/comment-item.tsx
// 個別コメント表示

import { useLocale } from 'next-intl'
import { getRelativeTime } from '@/lib/utils/relative-time'
import type { Comment } from '@/types/board'

interface CommentItemProps {
  comment: Comment
}

export function CommentItem({ comment }: CommentItemProps) {
  const locale = useLocale() as 'ja' | 'en'
  const relativeTime = getRelativeTime(comment.created_at, locale)

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm">{comment.name}</span>
        <span className="text-xs text-foreground-muted">{relativeTime}</span>
      </div>
      <p className="text-sm text-foreground-muted whitespace-pre-wrap break-words">
        {comment.content}
      </p>
    </div>
  )
}
