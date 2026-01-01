// middleware.ts
// 言語検出・リダイレクト

import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { locales, defaultLocale } from './lib/i18n'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
})

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 静的ファイル・API・OGエンドポイントはスキップ
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/og') ||
    pathname.includes('.') // 静的ファイル（.ico, .png など）
  ) {
    return
  }

  return intlMiddleware(request)
}

export const config = {
  // 静的ファイルとAPIを除外
  matcher: ['/((?!_next|api|og|.*\\..*).*)'],
}
