// app/[lang]/page.tsx
// ホームページ

import { setRequestLocale } from 'next-intl/server'
import { locales, type Locale } from '@/lib/i18n'
import { Container } from '@/components/common/container'
import { Hero, FeaturedProjects, VisitorCount, Board } from '@/components/home'
import { getFeaturedProjects } from '@/lib/projects'

type Props = {
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params
  setRequestLocale(lang)

  const featuredProjects = await getFeaturedProjects(lang as Locale, 4)

  return (
    <Container>
      <Hero />
      <VisitorCount />
      <FeaturedProjects projects={featuredProjects} />
      <Board />
    </Container>
  )
}
