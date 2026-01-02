'use client'

// components/home/board/comment-form.tsx
// コメント投稿フォーム

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Send } from 'lucide-react'
import { COMMENT_LIMITS } from '@/lib/db/schema'
import type { PostCommentResponse } from '@/types/board'

interface CommentFormProps {
  onCommentPosted: () => void
}

export function CommentForm({ onCommentPosted }: CommentFormProps) {
  const t = useTranslations('board')
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content, honeypot }),
      })

      const data: PostCommentResponse = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setError(t('error.tooManyRequests', { seconds: data.retryAfter ?? 30 }))
        } else {
          setError(data.error || t('error.postFailed'))
        }
        return
      }

      // 成功時
      setName('')
      setContent('')
      onCommentPosted()
    } catch {
      setError(t('error.postFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot フィールド（ボット対策、非表示） */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute -left-[9999px] opacity-0"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="name" className="block text-sm text-foreground-muted mb-1">
          {t('form.name')}
          <span className="text-foreground-muted/60 ml-1">
            ({t('form.optional')})
          </span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={COMMENT_LIMITS.NAME_MAX_LENGTH}
          placeholder={COMMENT_LIMITS.DEFAULT_NAME}
          className="w-full px-3 py-2 rounded-lg
            bg-background border border-border
            focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent
            transition-colors"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm text-foreground-muted mb-1">
          {t('form.comment')}
          <span className="text-foreground-muted/60 ml-1">
            ({content.length}/{COMMENT_LIMITS.CONTENT_MAX_LENGTH})
          </span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={COMMENT_LIMITS.CONTENT_MAX_LENGTH}
          required
          rows={3}
          placeholder={t('form.placeholder')}
          className="w-full px-3 py-2 rounded-lg resize-none
            bg-background border border-border
            focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent
            transition-colors"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
          bg-accent text-accent-foreground font-medium
          hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
          transition-opacity"
      >
        <Send className="w-4 h-4" />
        {isSubmitting ? t('form.submitting') : t('form.submit')}
      </button>
    </form>
  )
}
