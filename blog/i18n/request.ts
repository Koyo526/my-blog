// i18n/request.ts
// next-intl のサーバーサイド設定

import { getRequestConfig } from 'next-intl/server'
import { locales, type Locale } from '@/lib/i18n'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Validate that the incoming locale is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'ja'
  }

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
  }
})
