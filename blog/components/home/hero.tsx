// components/home/hero.tsx
// ヒーローセクション

'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n'
import { SlideUp } from '@/components/motion'

export function Hero() {
  const t = useTranslations('home')

  return (
    <section className="py-20 md:py-32">
      <div className="space-y-6">
        <SlideUp>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            {t('hero.title')}
          </h1>
        </SlideUp>

        <SlideUp delay={0.1}>
          <p className="text-lg md:text-xl text-foreground-muted max-w-2xl">
            {t('hero.description')}
          </p>
        </SlideUp>

        <SlideUp delay={0.2}>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition-opacity focus-ring"
            >
              {t('hero.cta.projects')}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-border-hover font-medium transition-colors focus-ring"
            >
              {t('hero.cta.blog')}
            </Link>
          </div>
        </SlideUp>
      </div>
    </section>
  )
}
