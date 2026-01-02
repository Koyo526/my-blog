// next.config.ts

import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import bundleAnalyzer from '@next/bundle-analyzer'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  // 画像最適化（Vercel Image Optimization を使用）
  images: {
    // 外部画像を使う場合のみ remotePatterns を設定
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'example.com' },
    // ],
  },

  // 末尾スラッシュ（SEO 統一）
  // 注意: Middleware と組み合わせる場合、二重リダイレクト防止が必要
  trailingSlash: true,

  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // 基本セキュリティ
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          // クロスオリジン分離
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },

          // 機能制限（ブログでは不要な機能を無効化）
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default withBundleAnalyzer(withNextIntl(nextConfig))
