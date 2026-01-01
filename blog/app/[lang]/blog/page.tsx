// app/[lang]/blog/page.tsx
// ブログ一覧ページ

import { setRequestLocale } from 'next-intl/server'
import { locales, type Locale } from '@/lib/i18n'
import { getAllPosts } from '@/lib/posts'
import { Container } from '@/components/common/container'
import { BlogList } from '@/components/blog/blog-list'

type Props = {
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export default async function BlogPage({ params }: Props) {
  const { lang } = await params
  setRequestLocale(lang)

  const posts = await getAllPosts(lang as Locale)

  return (
    <Container className="py-16">
      <BlogList posts={posts} />
    </Container>
  )
}
