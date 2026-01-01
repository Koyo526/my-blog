// lib/env.ts
// 環境変数ユーティリティ
// 重要: NODE_ENV ではなく VERCEL_ENV を使用

function getSiteUrl(): string {
  // Production: 手動設定の本番URL
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
    return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yoursite.com'
  }

  // Preview: Vercel が自動生成する URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }

  // Development: localhost
  return 'http://localhost:3000'
}

export const env = {
  // Vercel 環境（GA/Analytics の判定に使用）
  isProduction: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production',
  isPreview: process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview',
  isDevelopment: process.env.NODE_ENV === 'development',

  // サイト URL（canonical/OG URL 生成用）
  siteUrl: getSiteUrl(),

  // GA
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
} as const
