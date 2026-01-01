// app/[lang]/layout.tsx
// 言語別レイアウト

import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n'
import { siteConfig } from '@/lib/config'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

type Props = {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const t = await getTranslations({ locale: lang, namespace: 'site' })

  return {
    title: {
      default: t('name'),
      template: `%s | ${t('name')}`,
    },
    description: t('description'),
    metadataBase: new URL(siteConfig.siteUrl),
    alternates: {
      canonical: `/${lang}`,
      languages: {
        ja: '/ja',
        en: '/en',
      },
    },
    openGraph: {
      type: 'website',
      locale: lang === 'ja' ? 'ja_JP' : 'en_US',
      url: siteConfig.siteUrl,
      siteName: t('name'),
      title: t('name'),
      description: t('description'),
      images: [
        {
          url: `${siteConfig.siteUrl}/og?title=${encodeURIComponent(t('name'))}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('name'),
      description: t('description'),
      creator: `@${siteConfig.author.twitter}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params

  // Validate locale
  if (!locales.includes(lang as Locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(lang)

  // Get messages for the current locale
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  )
}
