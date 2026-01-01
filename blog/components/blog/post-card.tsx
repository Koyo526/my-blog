// components/blog/post-card.tsx
// ブログ記事カード

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { Post } from '@/types/content'
import { formatDate } from '@/lib/utils'

type Props = {
  post: Post
}

export function PostCard({ post }: Props) {
  const t = useTranslations('blog')
  const { slug, locale, frontmatter, readingTime } = post

  return (
    <article className="group">
      <Link
        href={`/${locale}/blog/${slug}/`}
        className="block p-6 rounded-xl border border-border bg-card hover:bg-card-hover hover:border-border-hover transition-all focus-ring"
      >
        <div className="space-y-3">
          {/* Tags */}
          {frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {frontmatter.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full bg-background-secondary text-foreground-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-semibold group-hover:text-accent transition-colors">
            {frontmatter.title}
          </h3>

          {/* Summary */}
          <p className="text-foreground-muted line-clamp-2">
            {frontmatter.summary}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-foreground-muted">
            <time dateTime={frontmatter.publishedAt}>
              {formatDate(frontmatter.publishedAt, locale)}
            </time>
            <span>·</span>
            <span>{t('readingTime', { minutes: readingTime })}</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
