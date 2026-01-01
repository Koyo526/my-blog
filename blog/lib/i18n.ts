// lib/i18n.ts
// 多言語対応の設定

import { createNavigation } from 'next-intl/navigation'

export const locales = ['ja', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'ja'

// next-intl ナビゲーションコンポーネント
export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
})

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

export function getLocaleName(locale: Locale): string {
  const names: Record<Locale, string> = {
    ja: '日本語',
    en: 'English',
  }
  return names[locale]
}

// next-intl用のメッセージ読み込み
export async function getMessages(locale: Locale) {
  return (await import(`../locales/${locale}.json`)).default
}
