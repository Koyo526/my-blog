# Step 10: 分析・将来拡張設計

## 概要
GA4 / Vercel Analytics の導入設計と、将来的な機能拡張のための準備

---

## 設計方針

| 項目 | 方針 |
|------|------|
| 分析（主軸） | Google Analytics 4（意思決定・詳細分析） |
| 分析（補助） | Vercel Analytics（UX・Core Web Vitals） |
| コメント | Giscus（将来拡張、MVP では見送り） |
| 検索 | 将来拡張（MVP では見送り） |
| RSS | 将来拡張（MVP では見送り） |

### 役割分担

| ツール | 用途 | 強み |
|--------|------|------|
| GA4 | 詳細な行動分析、コンバージョン追跡 | 豊富なレポート、セグメント分析 |
| Vercel Analytics | リアルタイム、Core Web Vitals | シンプル、Vercel と統合済み |

---

## ファイル構成

```
app/
├── layout.tsx              # Analytics コンポーネント配置
└── ...

components/
└── analytics/
    ├── google-analytics.tsx   # GA4 コンポーネント
    └── vercel-analytics.tsx   # Vercel Analytics コンポーネント

lib/
└── config.ts               # 分析設定（Measurement ID 等）
```

---

## Google Analytics 4

### 概要

`@next/third-parties` を使用した GA4 導入。Next.js 公式推奨の方法で、パフォーマンスへの影響を最小化。

### インストール

```bash
npm install @next/third-parties
```

### 環境変数

```bash
# .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 実装（基本）

```typescript
// components/analytics/google-analytics.tsx

'use client'

import { GoogleAnalytics as GA } from '@next/third-parties/google'

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  // VERCEL_ENV で本番環境のみ有効化（Preview 除外）
  const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

  // 本番環境かつ ID 設定時のみ有効化
  if (!measurementId || !isProduction) {
    return null
  }

  return <GA gaId={measurementId} />
}
```

### ルートレイアウトへの配置

```typescript
// app/layout.tsx

import { GoogleAnalytics } from '@/components/analytics/google-analytics'
import { VercelAnalytics } from '@/components/analytics/vercel-analytics'

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <GoogleAnalytics />
        <VercelAnalytics />
      </body>
    </html>
  )
}
```

### page_view の計測方針

**重要**: App Router + 多言語サイトでは「二重 page_view」が起きやすい。

| 方針 | 採用 |
|------|------|
| `page_view` は GA4 の自動計測に任せる | ✅ 採用 |
| 手動で `page_view` を送信しない | ✅ |
| `trackEvent` は意図したイベントのみ | ✅ |

```typescript
// ❌ やらない: 手動 page_view（二重計測の原因）
// gtag('event', 'page_view', { page_path: pathname })

// ✅ 推奨: 自動 page_view に任せる
// @next/third-parties の GoogleAnalytics コンポーネントが自動で処理
```

### 多言語対応: 言語属性の設定

言語を user_properties として設定することで、ja/en の比較分析が容易になる。

```typescript
// components/analytics/google-analytics.tsx（完全版）

'use client'

import { GoogleAnalytics as GA } from '@next/third-parties/google'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
  const params = useParams()
  const lang = params?.lang as string | undefined

  useEffect(() => {
    // 言語をユーザー属性として設定
    if (typeof window !== 'undefined' && window.gtag && lang && isProduction) {
      window.gtag('set', 'user_properties', {
        language: lang,
      })
    }
  }, [lang, isProduction])

  if (!measurementId || !isProduction) {
    return null
  }

  return <GA gaId={measurementId} />
}
```

### カスタムイベント送信（GA4 推奨形式）

GA4 では `category/label` より `event_name + params` 形式が推奨。

```typescript
// lib/analytics.ts

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

type EventParams = Record<string, string | number | boolean | undefined>

/**
 * 汎用イベント送信
 * GA4 推奨形式: eventName + params
 */
export function track(eventName: string, params?: EventParams) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

/**
 * CTA クリック
 */
export function trackCtaClick(placement: string, target: string, lang?: string) {
  track('cta_click', {
    placement,    // 'hero', 'footer', 'sidebar'
    target,       // 'projects', 'contact', 'resume'
    language: lang,
  })
}

/**
 * 外部リンククリック
 */
export function trackExternalLinkClick(url: string, text: string, lang?: string) {
  track('external_link_click', {
    url,
    link_text: text,
    language: lang,
  })
}

/**
 * ファイルダウンロード
 */
export function trackFileDownload(fileName: string, url: string, lang?: string) {
  track('file_download', {
    file_name: fileName,
    file_url: url,
    language: lang,
  })
}

/**
 * プロジェクト閲覧
 */
export function trackProjectView(slug: string, name: string, lang?: string) {
  track('project_view', {
    project_slug: slug,
    project_name: name,
    language: lang,
  })
}
```

### 使用例

```typescript
// コンポーネント内での使用
import { trackCtaClick, trackExternalLinkClick } from '@/lib/analytics'

// CTA ボタン
<button onClick={() => trackCtaClick('hero', 'projects', lang)}>
  View Projects
</button>

// 外部リンク
<a
  href="https://github.com/..."
  onClick={() => trackExternalLinkClick('https://github.com/...', 'GitHub', lang)}
>
  GitHub
</a>
```

### 追跡するイベント一覧

| イベント名 | 用途 | 自動/手動 |
|-----------|------|----------|
| `page_view` | ページ閲覧 | 自動（GA4） |
| `scroll` | スクロール深度 | 自動（GA4） |
| `cta_click` | CTA ボタンクリック | 手動 |
| `external_link_click` | 外部リンククリック | 手動 |
| `file_download` | ファイルダウンロード | 手動 |
| `project_view` | プロジェクト詳細閲覧 | 手動 |
| `form_submit` | お問い合わせ（将来） | 手動 |

---

## Vercel Analytics

### 概要

Vercel が提供するシンプルな Web Analytics。Core Web Vitals の自動測定が特徴。

### インストール

```bash
npm install @vercel/analytics @vercel/speed-insights
```

### 本番環境のみで有効化

Preview 環境を含めるとノイズになるため、本番のみで計測。

```typescript
// components/analytics/vercel-analytics.tsx

'use client'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

export function VercelAnalytics() {
  // 本番環境のみで有効化
  // Vercel の VERCEL_ENV は 'production' | 'preview' | 'development'
  const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

  if (!isProduction) {
    return null
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
```

### 環境変数（Vercel 自動設定）

| 変数 | 値 | 説明 |
|------|-----|------|
| `VERCEL_ENV` | `production` / `preview` / `development` | デプロイ環境 |
| `NEXT_PUBLIC_VERCEL_ENV` | 同上 | クライアントで参照可能 |

**注意**: `NODE_ENV` は Vercel Preview でも `production` になるため、`VERCEL_ENV` を使用。

### Speed Insights

| 指標 | 説明 |
|------|------|
| LCP | Largest Contentful Paint |
| FID | First Input Delay |
| CLS | Cumulative Layout Shift |
| TTFB | Time to First Byte |
| INP | Interaction to Next Paint |

### Vercel ダッシュボード

- Vercel プロジェクト設定で Analytics を有効化
- リアルタイムでアクセス状況を確認可能
- 無料枠: 月間 2,500 イベント（Hobby プラン）

### 環境別の計測方針

| 環境 | GA4 | Vercel Analytics |
|------|-----|-----------------|
| Production | ✅ 有効 | ✅ 有効 |
| Preview | ❌ 無効 | ❌ 無効 |
| Development | ❌ 無効 | ❌ 無効 |

---

## 分析のプライバシー考慮

### Cookie バナー

MVP では Cookie バナーは見送り。将来的に EU 向け対応が必要な場合は追加。

```typescript
// 将来: components/cookie-banner.tsx

'use client'

import { useState, useEffect } from 'react'

export function CookieBanner() {
  const [consent, setConsent] = useState<boolean | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('cookie-consent')
    if (stored !== null) {
      setConsent(stored === 'true')
    }
  }, [])

  if (consent !== null) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4">
      <p>このサイトでは分析のために Cookie を使用しています。</p>
      <div className="flex gap-2 mt-2">
        <button onClick={() => handleConsent(true)}>同意する</button>
        <button onClick={() => handleConsent(false)}>拒否する</button>
      </div>
    </div>
  )
}
```

### robots.txt での除外

分析スクリプトは `robots.txt` で除外不要（クローラーは JS を実行しない）。

---

## 将来拡張: Giscus コメント

### 概要

Giscus は GitHub Discussions を利用したコメントシステム。GitHub アカウントでコメント可能。

### なぜ Giscus か

| 比較 | Giscus | Disqus | utterances |
|------|--------|--------|------------|
| バックエンド | GitHub Discussions | Disqus サーバー | GitHub Issues |
| 広告 | なし | あり（無料版） | なし |
| プライバシー | 良好 | 要注意 | 良好 |
| スレッド | ✅ | ✅ | ❌ |
| リアクション | ✅ | ✅ | ❌ |

### MVP での方針

**見送り**。理由:
- ポートフォリオサイトでコメントの優先度は低い
- 導入は後から容易（コンポーネント追加のみ）

### 将来の実装

```typescript
// 将来: components/blog/giscus-comments.tsx

'use client'

import Giscus from '@giscus/react'
import { useTheme } from 'next-themes'

type Props = {
  lang: 'ja' | 'en'
}

export function GiscusComments({ lang }: Props) {
  const { resolvedTheme } = useTheme()

  return (
    <Giscus
      repo="username/repo"
      repoId="R_xxxxx"
      category="Comments"
      categoryId="DIC_xxxxx"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      lang={lang}
      loading="lazy"
    />
  )
}
```

### 導入手順（将来）

1. GitHub リポジトリで Discussions を有効化
2. [giscus.app](https://giscus.app) で設定を生成
3. `@giscus/react` をインストール
4. ブログ記事ページにコンポーネント追加

---

## 将来拡張: RSS フィード

### 概要

ブログ記事の RSS/Atom フィード生成。

### 実装方針

```typescript
// 将来: app/feed.xml/route.ts

import { getAllPosts } from '@/lib/posts'
import { siteConfig } from '@/lib/config'

export async function GET() {
  const posts = await getAllPosts('ja')

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name}</title>
    <link>${siteConfig.url}</link>
    <description>${siteConfig.description}</description>
    <language>ja</language>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml"/>
    ${posts.map(post => `
    <item>
      <title>${escapeXml(post.frontmatter.title)}</title>
      <link>${siteConfig.url}/ja/blog/${post.slug}</link>
      <guid>${siteConfig.url}/ja/blog/${post.slug}</guid>
      <pubDate>${new Date(post.frontmatter.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.frontmatter.summary)}</description>
    </item>
    `).join('')}
  </channel>
</rss>`

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
```

### 多言語対応

| URL | 言語 |
|-----|------|
| `/feed.xml` | 日本語（デフォルト） |
| `/en/feed.xml` | 英語 |

---

## 将来拡張: サイト内検索

### 選択肢

| 方式 | 複雑度 | コスト | 特徴 |
|------|--------|--------|------|
| クライアント検索（Fuse.js） | 低 | 無料 | 全文検索、小規模向け |
| Algolia | 中 | 有料（無料枠あり） | 高速、大規模向け |
| Pagefind | 低 | 無料 | 静的生成、軽量 |

### MVP での方針

**見送り**。記事数が少ない初期段階では不要。

### 将来の実装（Fuse.js）

```typescript
// 将来: lib/search.ts

import Fuse from 'fuse.js'
import type { Post } from '@/lib/posts'

export function createSearchIndex(posts: Post[]) {
  return new Fuse(posts, {
    keys: [
      { name: 'frontmatter.title', weight: 2 },
      { name: 'frontmatter.summary', weight: 1 },
      { name: 'frontmatter.tags', weight: 1.5 },
    ],
    threshold: 0.3,
    includeScore: true,
  })
}
```

---

## 将来拡張: ニュースレター

### 選択肢

| サービス | 無料枠 | 特徴 |
|---------|--------|------|
| Buttondown | 100 subscribers | シンプル、Markdown 対応 |
| ConvertKit | 1,000 subscribers | クリエイター向け |
| Resend | 3,000 emails/月 | 開発者向け、API first |

### MVP での方針

**見送り**。導入は後から容易。

---

## 将来拡張: お問い合わせフォーム

### 選択肢

| 方式 | 特徴 |
|------|------|
| Formspree | ノーコード、無料枠あり |
| Resend + React Email | 自前実装、柔軟性高い |
| Google Forms 埋め込み | 最もシンプル |

### MVP での方針

**見送り**。GitHub / Twitter / メールアドレスで十分。

---

## 拡張ポイントまとめ

### MVP に含める

| 機能 | 理由 |
|------|------|
| GA4 | 主要分析ツール |
| Vercel Analytics | Core Web Vitals 監視 |

### 将来拡張（優先度順）

| 優先度 | 機能 | 導入タイミング |
|--------|------|---------------|
| 高 | RSS フィード | ブログ記事が増えたら |
| 中 | Giscus コメント | ブログの反応を得たいとき |
| 中 | サイト内検索 | 記事が 20+ になったら |
| 低 | ニュースレター | 読者が増えたら |
| 低 | お問い合わせフォーム | 必要に応じて |
| 低 | Cookie バナー | EU 向け対応が必要になったら |

### 拡張しやすい設計

| 設計 | 理由 |
|------|------|
| コンポーネント分離 | 機能追加が `import` 1行で済む |
| 環境変数管理 | 設定変更がコード変更不要 |
| Client Component 分離 | Server/Client 境界が明確 |

---

## 環境変数一覧

```bash
# .env.local

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Giscus (将来)
# NEXT_PUBLIC_GISCUS_REPO=username/repo
# NEXT_PUBLIC_GISCUS_REPO_ID=R_xxxxx
# NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_xxxxx
```

---

## レビューポイント

1. GA4 と Vercel Analytics の役割分担は適切か
2. 将来拡張の優先度は妥当か
3. プライバシー対応（Cookie バナー）の方針は妥当か
4. 拡張しやすい設計になっているか

---

## レビュー結果

| ポイント | 結果 | 対応 |
|---------|------|------|
| page_view 二重計測 | 🟡 修正済み | 自動計測に任せ、手動送信しない方針を明記 |
| イベント命名 | 🟡 修正済み | GA4 推奨の `event_name + params` 形式に変更 |
| 多言語分析 | 🟡 修正済み | `user_properties.language` + イベントに `language` 付与 |
| 本番/Preview 分離 | 🟡 修正済み | `VERCEL_ENV` で本番のみ有効化 |

---

**ステータス**: レビュー待ち
