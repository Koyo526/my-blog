// app/[lang]/about/page.tsx
// About ページ - タイムライン形式の経歴紹介

import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { locales } from '@/lib/i18n'
import { Container } from '@/components/common/container'
import { Timeline, AchievementSection } from '@/components/about'
import { timelineData, achievements } from '@/lib/about-data'
import { SlideUp } from '@/components/motion'

type Props = {
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params
  setRequestLocale(lang)

  return <AboutContent />
}

function AboutContent() {
  const t = useTranslations('about')

  return (
    <Container className="py-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <SlideUp>
          <div className="space-y-4 mb-12">
            <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>
            <p className="text-lg text-foreground-muted">{t('intro')}</p>
          </div>
        </SlideUp>

        {/* Timeline */}
        <Timeline entries={timelineData} />

        {/* Achievements */}
        <AchievementSection achievements={achievements} />
      </div>
    </Container>
  )
}
