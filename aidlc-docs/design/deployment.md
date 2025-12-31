# Step 11: ビルド・デプロイ設計

## 概要
Vercel へのデプロイ設計（環境変数、Preview/本番分離、ビルド設定）

---

## 設計方針

| 項目 | 方針 |
|------|------|
| ホスティング | Vercel |
| ビルド方式 | Standard Next.js（SSR/SSG ハイブリッド） |
| 環境分離 | Production / Preview / Development |
| CI/CD | Vercel Git Integration（GitHub） |
| カスタムドメイン | 将来設定 |

### なぜ Standard Next.js を選択したか

`output: 'export'`（完全静的生成）では以下の機能が使用不可:

| 機能 | 本プロジェクトでの使用 |
|------|----------------------|
| Route Handlers（動的） | ✅ OGP 画像生成 (`app/og/route.tsx`) |
| Middleware | ✅ 言語検出・リダイレクト |
| Image Optimization API | ✅ `next/image` 最適化 |
| Dynamic sitemap/robots | ✅ `sitemap.ts` / `robots.ts` |

これらの機能を活用するため、Standard Next.js を採用。

---

## ファイル構成

```
/
├── next.config.ts          # Next.js 設定
├── vercel.json             # Vercel 設定（オプション）
├── .env.local              # ローカル環境変数（Git 除外）
├── .env.example            # 環境変数テンプレート
└── .github/
    └── workflows/          # GitHub Actions（オプション）
```

---

## Next.js 設定

### next.config.ts

```typescript
// next.config.ts

import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  // Standard Next.js（SSR/SSG ハイブリッド）
  // output: 'export' は使用しない（動的機能を活用するため）

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

  // ESLint エラーでビルド失敗
  eslint: {
    ignoreDuringBuilds: false,
  },

  // TypeScript エラーでビルド失敗
  typescript: {
    ignoreBuildErrors: false,
  },

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

          // クロスオリジン分離（推奨）
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

  // 実験的機能
  experimental: {
    // 将来: View Transitions API
    // viewTransition: true,
  },
}

export default withNextIntl(nextConfig)
```

### Standard Next.js で使用可能な機能

| 機能 | 使用可否 | 本プロジェクトでの用途 |
|------|---------|----------------------|
| Image Optimization API | ✅ | `next/image` で自動最適化 |
| Route Handlers | ✅ | OGP 画像動的生成 |
| Middleware | ✅ | 言語検出・リダイレクト |
| Dynamic sitemap/robots | ✅ | `sitemap.ts` / `robots.ts` |
| ISR (Incremental Static Regeneration) | ✅ | 将来利用可能（現時点では不使用） |

### ビルド時の動作

- **静的ページ**: `generateStaticParams` を定義したページはビルド時に静的生成
- **動的 Route Handler**: リクエスト時に動的に生成（OGP 画像等）
- **Middleware**: Edge Runtime で実行（言語検出）

コンテンツ更新時は再デプロイで反映。将来的に ISR を導入する場合は `revalidate` を設定。

### trailingSlash と Middleware の組み合わせ

`trailingSlash: true` と言語リダイレクト Middleware を組み合わせると、二重リダイレクトが発生しやすい。

**問題パターン**:
```
/ → /ja（Middleware）→ /ja/（trailingSlash）  ❌ 二重リダイレクト
```

**正しいパターン**:
```
/ → /ja/（Middleware で最終形に一発リダイレクト）  ✅
```

**Middleware 実装の注意点**:

```typescript
// middleware.ts

// ❌ NG: 末尾スラッシュなしにリダイレクト
return NextResponse.redirect(new URL('/ja', request.url))

// ✅ OK: 最終形（末尾スラッシュあり）にリダイレクト
return NextResponse.redirect(new URL('/ja/', request.url))
```

**URL 生成の統一ルール**:
- canonical URL: 末尾スラッシュあり
- alternates hreflang: 末尾スラッシュあり
- sitemap URL: 末尾スラッシュあり
- OGP URL: 末尾スラッシュあり

---

## 環境変数

### 分類

| 種類 | プレフィックス | サーバー | クライアント |
|------|---------------|---------|-------------|
| サーバーのみ | なし | ✅ | ❌ |
| クライアント公開 | `NEXT_PUBLIC_` | ✅ | ✅ |

### 環境変数一覧

```bash
# .env.example

# ========================================
# サイト設定
# ========================================
NEXT_PUBLIC_SITE_URL=https://yoursite.com

# ========================================
# Google Analytics
# ========================================
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ========================================
# Vercel 自動設定（設定不要）
# ========================================
# VERCEL_ENV=production|preview|development
# NEXT_PUBLIC_VERCEL_ENV=production|preview|development
# VERCEL_URL=xxx.vercel.app

# ========================================
# 将来: Giscus
# ========================================
# NEXT_PUBLIC_GISCUS_REPO=username/repo
# NEXT_PUBLIC_GISCUS_REPO_ID=R_xxxxx
# NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_xxxxx
```

### ローカル開発用

```bash
# .env.local（Git 除外）

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Vercel での設定

| 設定場所 | 環境 |
|---------|------|
| Project Settings > Environment Variables | Production / Preview / Development |

```
┌─────────────────────────────────────────────────────────┐
│ Environment Variables                                    │
├─────────────────────────────────────────────────────────┤
│ NEXT_PUBLIC_GA_MEASUREMENT_ID                           │
│ Value: G-XXXXXXXXXX                                     │
│ Environments: ☑ Production  ☐ Preview  ☐ Development   │
└─────────────────────────────────────────────────────────┘
```

**ポイント**: GA4 は Production のみにチェック（Preview でのノイズ防止）

---

## 環境分離

### Vercel の環境

| 環境 | トリガー | URL |
|------|---------|-----|
| Production | `main` ブランチへの push | `yoursite.com` |
| Preview | その他のブランチへの push / PR | `xxx-xxx.vercel.app` |
| Development | `vercel dev` | `localhost:3000` |

### 環境別の動作

| 機能 | Production | Preview | Development |
|------|-----------|---------|-------------|
| GA4 | ✅ 有効 | ❌ 無効 | ❌ 無効 |
| Vercel Analytics | ✅ 有効 | ❌ 無効 | ❌ 無効 |
| Draft 記事表示 | ❌ 非表示 | ❌ 非表示 | ✅ 表示 |
| OGP 画像生成 | ✅ 動作 | ✅ 動作 | ✅ 動作 |

### コードでの環境判定

```typescript
// lib/env.ts

/**
 * 環境判定ユーティリティ
 *
 * 重要: NODE_ENV ではなく VERCEL_ENV を使用
 * - NODE_ENV=production は Preview でも true になる
 * - VERCEL_ENV は production/preview/development を正確に区別
 */
export const env = {
  // Vercel 環境（GA/Analytics の判定に使用）
  isProduction: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production',
  isPreview: process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview',
  isDevelopment: process.env.NODE_ENV === 'development',

  // サイト URL（canonical/OG URL 生成用）
  // Production: NEXT_PUBLIC_SITE_URL
  // Preview: VERCEL_URL を優先（毎回変わるため）
  // Development: localhost
  siteUrl: getSiteUrl(),

  // GA
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
} as const

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
```

### 環境判定の注意点

| 判定 | 正しい方法 | NG な方法 |
|------|-----------|----------|
| 本番のみ GA 有効 | `VERCEL_ENV === 'production'` | `NODE_ENV === 'production'` |
| Preview URL 取得 | `NEXT_PUBLIC_VERCEL_URL` | 手動設定 |
| サーバー側判定 | `VERCEL_ENV` | `NEXT_PUBLIC_VERCEL_ENV` |
| クライアント側判定 | `NEXT_PUBLIC_VERCEL_ENV` | `VERCEL_ENV`（見えない） |

**よくある事故**: `NODE_ENV === 'production'` で判定すると Preview でも GA が動いてしまう。

---

## Vercel 設定

### vercel.json（オプション）

基本的に不要。`next.config.ts` で設定可能なものはそちらを優先。

```json
// vercel.json（必要な場合のみ）

{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs"
}
```

**注意**: ヘッダーは `next.config.ts` の `headers()` で設定済み。リダイレクトは Middleware で処理。

### セキュリティヘッダー

| ヘッダー | 値 | 目的 |
|---------|-----|------|
| `X-Content-Type-Options` | `nosniff` | MIME スニッフィング防止 |
| `X-Frame-Options` | `DENY` | クリックジャッキング防止 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | リファラー制御 |
| `Cross-Origin-Opener-Policy` | `same-origin` | クロスオリジン分離 |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | 不要な機能を無効化 |

**削除したヘッダー**:
- `X-XSS-Protection`: 現代ブラウザでは効果が薄い（CSP で代替）

**将来追加候補**（MVP 後）:
- `Content-Security-Policy`: GA・フォント・OGP 等の外部リソースを許可リスト化（設定が複雑）
- `Cross-Origin-Resource-Policy`: 外部画像がある場合は `cross-origin` に変更が必要

### Next.js での設定（推奨）

Standard Next.js では `next.config.ts` の `headers()` が動作する。上記の `next.config.ts` 例を参照。

---

## ビルドコマンド

### package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

**ローカルでの本番確認**:
```bash
npm run build && npm run start
# http://localhost:3000 で確認
```

### ビルド前チェック

```bash
# 型チェック + Lint + ビルド
npm run type-check && npm run lint && npm run build
```

### Vercel ビルド設定

| 項目 | 値 |
|------|-----|
| Framework Preset | Next.js |
| Build Command | `npm run build` (自動検出) |
| Output Directory | `.next` (デフォルト) |
| Install Command | `npm install` (自動検出) |
| Node.js Version | 20.x |

---

## デプロイフロー

### Git Integration（推奨）

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Push / PR
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Vercel Platform                       │
│                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   Build     │ -> │   Deploy    │ -> │   CDN Edge  │ │
│  │  (SSG)      │    │             │    │             │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### ブランチ戦略

| ブランチ | 用途 | デプロイ先 |
|---------|------|-----------|
| `main` | 本番 | Production |
| `develop` | 開発統合 | Preview |
| `feature/*` | 機能開発 | Preview |
| `fix/*` | バグ修正 | Preview |

### PR ワークフロー

1. `feature/xxx` ブランチを作成
2. コミット・プッシュ → Preview デプロイ
3. PR 作成 → Preview URL でレビュー
4. マージ → Production デプロイ

---

## パフォーマンス最適化

### Vercel 設定

| 項目 | 設定 |
|------|------|
| Edge Network | 自動（グローバル CDN） |
| Compression | 自動（Brotli/Gzip） |
| Caching | 静的アセットは自動キャッシュ |

### キャッシュヘッダー

静的アセット（`_next/static/*`）は Vercel が自動で最適化。

```
Cache-Control: public, max-age=31536000, immutable
```

### 画像最適化

Standard Next.js では Vercel Image Optimization API を使用可能。

```typescript
// next/image の使用例
import Image from 'next/image'

// ローカル画像（自動最適化）
<Image
  src="/images/profile.jpg"
  alt="Profile"
  width={400}
  height={400}
  priority  // LCP 画像には priority を付与
/>

// 外部画像（remotePatterns 設定が必要）
<Image
  src="https://example.com/image.jpg"
  alt="External"
  width={800}
  height={600}
/>
```

**Vercel Image Optimization の特徴**:
- 自動 WebP/AVIF 変換
- レスポンシブサイズ生成
- 遅延読み込み（デフォルト）
- Edge CDN キャッシュ

**推奨**: ローカル画像は `public/images/` に配置。外部画像を使う場合は `next.config.ts` で `remotePatterns` を設定。

---

## カスタムドメイン

### 設定手順

1. Vercel ダッシュボード > Domains
2. カスタムドメインを追加
3. DNS 設定（CNAME or A レコード）
4. SSL 証明書（自動発行）

### DNS 設定例

| タイプ | 名前 | 値 |
|--------|------|-----|
| CNAME | `@` or `www` | `cname.vercel-dns.com` |
| A | `@` | `76.76.21.21` |

### リダイレクト設定

```json
// vercel.json

{
  "redirects": [
    {
      "source": "/:path((?!_next|api|og).*)",
      "has": [{ "type": "host", "value": "www.yoursite.com" }],
      "destination": "https://yoursite.com/:path",
      "permanent": true
    }
  ]
}
```

---

## モニタリング

### Vercel ダッシュボード

| 機能 | 用途 |
|------|------|
| Deployments | デプロイ履歴・ログ |
| Analytics | トラフィック・Core Web Vitals |
| Logs | ビルド・ランタイムログ |
| Speed Insights | パフォーマンス詳細 |

### アラート設定

- ビルド失敗時のメール通知（デフォルト有効）
- Slack Integration（オプション）

---

## トラブルシューティング

### ビルドエラー

| エラー | 原因 | 対処 |
|--------|------|------|
| `Type error` | TypeScript エラー | `npm run type-check` で確認 |
| `ESLint error` | Lint エラー | `npm run lint:fix` で修正 |
| `Module not found` | 依存関係不足 | `npm install` |
| `generateStaticParams` | 動的ルートの設定不足 | 全 `{lang, slug}` を返す |
| `Edge Runtime` エラー | Node.js API を Edge で使用 | `runtime = 'edge'` のファイルで Node.js 専用 API を避ける |
| `Middleware` エラー | Middleware で非対応 API 使用 | Edge Runtime 対応 API のみ使用 |

### 環境変数が読めない

```typescript
// ❌ サーバーでのみ参照可能
const secret = process.env.SECRET_KEY

// ✅ クライアントで参照可能
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
```

### OGP 画像が生成されない

Route Handler (`app/og/route.tsx`) で OGP 画像を動的生成。

```typescript
// app/og/route.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'  // Edge Runtime を使用

export async function GET(request: Request) {
  // フォントファイルを読み込み（CSS ではなくバイナリ）
  const fontData = await fetch(
    new URL('../../public/fonts/NotoSansJP-Bold.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    // ... JSX
    { fonts: [{ name: 'NotoSansJP', data: fontData, style: 'normal' }] }
  )
}
```

**フォント読み込みの注意点**:
- ❌ Google Fonts の CSS URL を fetch → CSS テキストが返る
- ✅ `.ttf` / `.woff2` ファイルを直接 fetch → バイナリが返る
- フォントファイルは `public/fonts/` に配置し、`import.meta.url` で読み込む

**確認方法**:
1. `http://localhost:3000/og?title=Test&lang=ja` にアクセス
2. 画像が表示されれば OK
3. 本番では Vercel Edge Network で自動キャッシュ

---

## チェックリスト

### デプロイ前

- [ ] `npm run type-check` が通る
- [ ] `npm run lint` が通る
- [ ] `npm run build` が成功する
- [ ] 環境変数が Vercel に設定済み
- [ ] `generateStaticParams` が全ページで定義済み

### デプロイ後

- [ ] 全ページが正常に表示される
- [ ] OGP 画像が正しく生成される
- [ ] 多言語切替が動作する
- [ ] GA4 が Production でのみ動作する
- [ ] robots.txt / sitemap.xml が正しい

---

## レビューポイント

1. Standard Next.js（SSR/SSG ハイブリッド）の選択は妥当か
2. 環境変数の分類は適切か
3. セキュリティヘッダーは十分か
4. パフォーマンス最適化の方針は妥当か
5. Edge Runtime 使用箇所は適切か（OGP、Middleware）

---

**ステータス**: 完了
