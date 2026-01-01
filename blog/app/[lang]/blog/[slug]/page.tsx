// app/[lang]/blog/[slug]/page.tsx
// ブログ記事詳細ページ

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { locales, type Locale } from '@/lib/i18n'
import { siteConfig } from '@/lib/config'
import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { renderMDX } from '@/lib/mdx'
import { formatDate } from '@/lib/utils'
import { Container } from '@/components/common/container'
import { mdxComponents } from '@/components/mdx'

type Props = {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateStaticParams() {
  const params = await Promise.all(
    locales.map(async (lang) => {
      const posts = await getAllPosts(lang)
      return posts.map((post) => ({ lang, slug: post.slug }))
    })
  )
  return params.flat()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  const post = await getPostBySlug(lang as Locale, slug)

  if (!post) {
    return {}
  }

  const { frontmatter } = post
  const url = `${siteConfig.siteUrl}/${lang}/blog/${slug}`

  return {
    title: frontmatter.title,
    description: frontmatter.summary,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'article',
      title: frontmatter.title,
      description: frontmatter.summary,
      url,
      publishedTime: frontmatter.publishedAt,
      modifiedTime: frontmatter.updatedAt || frontmatter.publishedAt,
      authors: [siteConfig.author.name],
      tags: frontmatter.tags,
      images: [
        {
          url: `${siteConfig.siteUrl}/og?title=${encodeURIComponent(frontmatter.title)}&description=${encodeURIComponent(frontmatter.summary)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.summary,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { lang, slug } = await params
  setRequestLocale(lang)

  const post = await getPostBySlug(lang as Locale, slug)

  if (!post) {
    notFound()
  }

  const { content } = await renderMDX({
    source: post.content,
    components: mdxComponents,
  })

  return (
    <BlogPostContent
      post={post}
      content={content}
      locale={lang as Locale}
    />
  )
}

function BlogPostContent({
  post,
  content,
  locale,
}: {
  post: NonNullable<Awaited<ReturnType<typeof getPostBySlug>>>
  content: React.ReactNode
  locale: Locale
}) {
  const t = useTranslations('blog')
  const tCommon = useTranslations('common')
  const { frontmatter, readingTime } = post

  return (
    <Container className="py-16">
      <article className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8 space-y-4">
          {/* Tags */}
          {frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {frontmatter.tags.map((tag) => (
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
          <h1 className="text-3xl md:text-4xl font-bold">{frontmatter.title}</h1>

          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-foreground-muted">
            <time dateTime={frontmatter.publishedAt}>
              {tCommon('publishedAt')}: {formatDate(frontmatter.publishedAt, locale)}
            </time>
            <span>·</span>
            <span>{t('readingTime', { minutes: readingTime })}</span>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none">{content}</div>
      </article>
    </Container>
  )
}
