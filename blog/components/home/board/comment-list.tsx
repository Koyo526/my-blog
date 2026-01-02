'use client'

// components/home/board/comment-list.tsx
// コメント一覧（スクロール表示）

import { useTranslations } from 'next-intl'
import { CommentItem } from './comment-item'
import type { Comment } from '@/types/board'

interface CommentListProps {
  comments: Comment[]
  isLoading: boolean
}

export function CommentList({ comments, isLoading }: CommentListProps) {
  const t = useTranslations('board')

  if (isLoading) {
    return (
      <div className="h-[300px] overflow-y-auto divide-y divide-border/40">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="py-3 animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 w-20 bg-foreground-muted/20 rounded" />
              <div className="h-3 w-16 bg-foreground-muted/20 rounded" />
            </div>
            <div className="h-4 w-full bg-foreground-muted/20 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-foreground-muted">
        {t('noComments')}
      </div>
    )
  }

  return (
    <div className="h-[300px] overflow-y-auto divide-y divide-border/40">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  )
}
