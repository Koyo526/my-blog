// app/[lang]/about/page.tsx
// About ページ

import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { locales } from '@/lib/i18n'
import { Container } from '@/components/common/container'

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
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-foreground-muted">{t('description')}</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <p>
            Web開発者として活動しています。フロントエンドを中心に、
            モダンなWebアプリケーションの開発に取り組んでいます。
          </p>

          <h2>スキル</h2>
          <ul>
            <li>TypeScript / JavaScript</li>
            <li>React / Next.js</li>
            <li>Node.js</li>
            <li>Tailwind CSS</li>
          </ul>

          <h2>経歴</h2>
          <p>
            詳細な経歴やプロジェクトについては、
            プロジェクトページをご覧ください。
          </p>
        </div>
      </div>
    </Container>
  )
}
