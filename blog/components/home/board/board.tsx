'use client'

// components/home/board/board.tsx
// 掲示板メインコンポーネント

import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { CommentForm } from './comment-form'
import { CommentList } from './comment-list'
import type { Comment, CommentsResponse } from '@/types/board'

export function Board() {
  const t = useTranslations('board')
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch('/api/comments')
      if (!response.ok) throw new Error('Failed to fetch')
      const data: CommentsResponse = await response.json()
      setComments(data.comments)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleCommentPosted = () => {
    fetchComments()
  }

  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 md:p-8
          bg-card/60 backdrop-blur-md border border-border/50
          rounded-xl shadow-lg"
      >
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-bold">{t('title')}</h2>
        </div>

        {/* フォーム */}
        <div className="mb-6">
          <CommentForm onCommentPosted={handleCommentPosted} />
        </div>

        {/* 区切り線 */}
        <div className="border-t border-border/40 mb-4" />

        {/* コメント一覧 */}
        {error ? (
          <div className="h-[300px] flex items-center justify-center text-foreground-muted">
            {t('error.loadFailed')}
          </div>
        ) : (
          <CommentList comments={comments} isLoading={isLoading} />
        )}
      </motion.div>
    </section>
  )
}
