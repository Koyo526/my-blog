// components/blog/blog-list.tsx
// ブログ一覧コンポーネント（アニメーション付き）

'use client'

import { useTranslations } from 'next-intl'
import { PostCard } from './post-card'
import {
  SlideUp,
  StaggerContainerWhenVisible,
  StaggerItem,
} from '@/components/motion'
import type { Post } from '@/types/content'

type BlogListProps = {
  posts: Post[]
}

export function BlogList({ posts }: BlogListProps) {
  const t = useTranslations('blog')

  return (
    <div className="space-y-8">
      {/* Header */}
      <SlideUp>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-foreground-muted">{t('description')}</p>
        </div>
      </SlideUp>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <StaggerContainerWhenVisible
          staggerDelay={0.1}
          className="grid gap-6 md:grid-cols-2"
        >
          {posts.map((post) => (
            <StaggerItem key={post.slug}>
              <PostCard post={post} />
            </StaggerItem>
          ))}
        </StaggerContainerWhenVisible>
      ) : (
        <p className="text-foreground-muted">{t('noPosts')}</p>
      )}
    </div>
  )
}
