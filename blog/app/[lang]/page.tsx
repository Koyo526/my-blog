// app/[lang]/page.tsx
// ホームページ

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { setRequestLocale } from 'next-intl/server'
import { locales, type Locale } from '@/lib/i18n'
import { Container } from '@/components/common/container'
import {
  Hero,
  FeaturedProjects,
  VisitorCountSkeleton,
  BoardSkeleton,
} from '@/components/home'
import { getFeaturedProjects } from '@/lib/projects'

// 遅延ロード: コード分割でバンドルサイズ削減、FCP/LCP改善
const VisitorCount = dynamic(
  () => import('@/components/home/visitor-count').then((mod) => mod.VisitorCount),
  { loading: () => <VisitorCountSkeleton /> }
)

const Board = dynamic(
  () => import('@/components/home/board').then((mod) => mod.Board),
  { loading: () => <BoardSkeleton /> }
)

type Props = {
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

// ISR: 5分間キャッシュし、バックグラウンドで再生成
export const revalidate = 300

export default async function HomePage({ params }: Props) {
  const { lang } = await params
  setRequestLocale(lang)

  const featuredProjects = await getFeaturedProjects(lang as Locale, 4)

  return (
    <Container>
      <Hero />
      <Suspense fallback={<VisitorCountSkeleton />}>
        <VisitorCount />
      </Suspense>
      <FeaturedProjects projects={featuredProjects} />
      <Suspense fallback={<BoardSkeleton />}>
        <Board />
      </Suspense>
    </Container>
  )
}
