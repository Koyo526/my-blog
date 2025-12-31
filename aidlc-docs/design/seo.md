# Step 9: SEO・メタデータ設計

## 概要
Next.js App Router の Metadata API を使用した SEO 設計（メタデータ、OGP 動的生成、サイトマップ）

---

## 設計方針

| 項目 | 方針 |
|------|------|
| メタデータ API | Next.js `generateMetadata` / `metadata` export |
| OGP 画像 | `next/og` (Vercel OG) による動的生成 |
| サイトマップ | `app/sitemap.ts` による動的生成 |
| robots.txt | `app/robots.ts` による生成 |
| 多言語 SEO | `alternates.languages` で hreflang 設定 |
| 構造化データ | JSON-LD（Person, Article, WebSite） |

---

## ファイル構成

```
app/
├── layout.tsx              # 共通メタデータ（サイト名、デフォルト OGP）
├── sitemap.ts              # サイトマップ生成
├── robots.ts               # robots.txt 生成
├── [lang]/
│   ├── layout.tsx          # 言語別メタデータ
│   ├── page.tsx            # ホームページメタデータ
│   ├── about/
│   │   └── page.tsx        # About ページメタデータ
│   ├── projects/
│   │   ├── page.tsx        # プロジェクト一覧メタデータ
│   │   └── [slug]/
│   │       └── page.tsx    # プロジェクト詳細メタデータ（動的）
│   └── blog/
│       ├── page.tsx        # ブログ一覧メタデータ
│       └── [slug]/
│           └── page.tsx    # ブログ詳細メタデータ（動的）
└── og/
    └── route.tsx           # OGP 画像生成 API Route
```

---

## サイト設定

```typescript
// lib/config.ts

export const siteConfig = {
  name: 'Your Name',
  title: 'Your Name | Software Engineer',
  description: 'Software engineer specializing in web development',
  url: 'https://yoursite.com',
  ogImage: '/og-default.png',
  author: {
    name: 'Your Name',
    email: 'your@email.com',
    twitter: '@yourhandle',
    github: 'yourgithub',
  },
  locale: {
    default: 'ja',
    supported: ['ja', 'en'] as const,
  },
} as const

export type Locale = (typeof siteConfig.locale.supported)[number]
```

---

## メタデータ実装

### ルートレイアウト（共通設定）

```typescript
// app/layout.tsx

import type { Metadata, Viewport } from 'next'
import { siteConfig } from '@/lib/config'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author.name }],
  creator: siteConfig.author.name,
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.author.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}
```

### 言語別レイアウト

```typescript
// app/[lang]/layout.tsx

import type { Metadata } from 'next'
import { siteConfig, type Locale } from '@/lib/config'

type Props = {
  params: { lang: Locale }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = params
  const isJa = lang === 'ja'

  return {
    alternates: {
      canonical: `${siteConfig.url}/${lang}`,
      languages: {
        'ja': `${siteConfig.url}/ja`,
        'en': `${siteConfig.url}/en`,
      },
    },
    openGraph: {
      locale: isJa ? 'ja_JP' : 'en_US',
    },
  }
}
```

### ホームページ

```typescript
// app/[lang]/page.tsx

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { siteConfig, type Locale } from '@/lib/config'

type Props = {
  params: { lang: Locale }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = params
  const t = await getTranslations({ locale: lang, namespace: 'meta.home' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteConfig.url}/${lang}`,
      languages: {
        'ja': `${siteConfig.url}/ja`,
        'en': `${siteConfig.url}/en`,
      },
    },
  }
}
```

### プロジェクト詳細ページ（動的メタデータ）

```typescript
// app/[lang]/projects/[slug]/page.tsx

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProjectBySlug, getAllProjects } from '@/lib/projects'
import { siteConfig, type Locale } from '@/lib/config'

type Props = {
  params: { lang: Locale; slug: string }
}

export async function generateStaticParams() {
  const locales: Locale[] = ['ja', 'en']

  const params = await Promise.all(
    locales.map(async (lang) => {
      const projects = await getAllProjects(lang)
      return projects.map((p) => ({ lang, slug: p.slug }))
    })
  )

  return params.flat()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = params
  const project = await getProjectBySlug(lang, slug)

  if (!project) {
    return {}
  }

  const { frontmatter } = project
  // Projects use 'name' field, not 'title' (see Step 4)
  const ogImageUrl = frontmatter.ogImage
    ? `${siteConfig.url}${frontmatter.ogImage}`
    : `${siteConfig.url}/og?title=${encodeURIComponent(frontmatter.name)}&type=project`

  return {
    title: frontmatter.name,
    description: frontmatter.summary,
    openGraph: {
      type: 'article',
      title: frontmatter.name,
      description: frontmatter.summary,
      url: `${siteConfig.url}/${lang}/projects/${slug}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: frontmatter.name,
        },
      ],
      publishedTime: frontmatter.date,
      tags: frontmatter.tech,  // Projects use 'tech' instead of 'tags'
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.name,
      description: frontmatter.summary,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `${siteConfig.url}/${lang}/projects/${slug}`,
      languages: {
        'ja': `${siteConfig.url}/ja/projects/${slug}`,
        'en': `${siteConfig.url}/en/projects/${slug}`,
      },
    },
  }
}
```

### ブログ記事ページ

```typescript
// app/[lang]/blog/[slug]/page.tsx

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostBySlug, getAllPosts } from '@/lib/posts'
import { siteConfig, type Locale } from '@/lib/config'

type Props = {
  params: { lang: Locale; slug: string }
}

export async function generateStaticParams() {
  const locales: Locale[] = ['ja', 'en']

  const params = await Promise.all(
    locales.map(async (lang) => {
      const posts = await getAllPosts(lang)
      return posts.map((p) => ({ lang, slug: p.slug }))
    })
  )

  return params.flat()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = params
  const post = await getPostBySlug(lang, slug)

  if (!post) {
    return {}
  }

  const { frontmatter } = post
  // Posts use 'summary' field, not 'description' (see Step 4)
  const ogImageUrl = frontmatter.ogImage
    ? `${siteConfig.url}${frontmatter.ogImage}`
    : `${siteConfig.url}/og?title=${encodeURIComponent(frontmatter.title)}&type=blog`

  return {
    title: frontmatter.title,
    description: frontmatter.summary,
    openGraph: {
      type: 'article',
      title: frontmatter.title,
      description: frontmatter.summary,
      url: `${siteConfig.url}/${lang}/blog/${slug}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: frontmatter.title,
        },
      ],
      publishedTime: frontmatter.date,
      modifiedTime: frontmatter.updatedAt,
      authors: [siteConfig.author.name],
      tags: frontmatter.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.summary,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `${siteConfig.url}/${lang}/blog/${slug}`,
      languages: {
        'ja': `${siteConfig.url}/ja/blog/${slug}`,
        'en': `${siteConfig.url}/en/blog/${slug}`,
      },
    },
  }
}
```

---

## OGP 画像動的生成

### 概要

`next/og` (Vercel OG Image Generation) を使用して、記事タイトルを含む OGP 画像を動的生成。

### フォントファイルの準備

```
public/
└── fonts/
    └── NotoSansJP-Bold.ttf    # Google Fonts からダウンロード
```

**重要**: Google Fonts の CSS URL を fetch してもフォントバイナリは取得できない。
フォントファイル（.ttf/.otf/.woff）を `public/fonts/` に配置し、`import.meta.url` で読み込む。

### API Route 実装

```typescript
// app/og/route.tsx

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { siteConfig } from '@/lib/config'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const title = searchParams.get('title') ?? siteConfig.name
  const type = searchParams.get('type') ?? 'default' // 'blog' | 'project' | 'default'

  // フォント読み込み（public/fonts/ からバイナリを取得）
  const fontData = await fetch(
    new URL('../../public/fonts/NotoSansJP-Bold.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%)',
          fontFamily: 'Noto Sans JP',
        }}
      >
        {/* コンテンツタイプラベル */}
        {type !== 'default' && (
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 60,
              fontSize: 24,
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {type === 'blog' ? 'Blog' : 'Project'}
          </div>
        )}

        {/* タイトル */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 60px',
            maxWidth: '1000px',
          }}
        >
          <h1
            style={{
              fontSize: title.length > 30 ? 48 : 64,
              fontWeight: 700,
              color: '#ffffff',
              textAlign: 'center',
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            {title}
          </h1>
        </div>

        {/* サイト名 */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 60,
            fontSize: 28,
            color: '#666',
          }}
        >
          {siteConfig.name}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Noto Sans JP',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  )
}
```

### 使用方法

```
/og?title=記事タイトル&type=blog
/og?title=プロジェクト名&type=project
/og (デフォルト画像)
```

### デザインバリエーション（将来拡張）

| パラメータ | 説明 |
|-----------|------|
| `title` | 表示するタイトル |
| `type` | コンテンツタイプ（blog / project / default） |
| `tags` | タグ表示（将来） |
| `date` | 日付表示（将来） |

---

## サイトマップ

```typescript
// app/sitemap.ts

import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'
import { getAllProjects } from '@/lib/projects'
import { siteConfig, type Locale } from '@/lib/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url
  const locales: Locale[] = ['ja', 'en']

  // 静的ページ
  const staticPages = ['', '/about', '/projects', '/blog']
  const staticEntries = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}${page}`])
        ),
      },
    }))
  )

  // プロジェクトページ
  const projectEntries = await Promise.all(
    locales.map(async (locale) => {
      const projects = await getAllProjects(locale)
      return projects.map((project) => ({
        url: `${baseUrl}/${locale}/projects/${project.slug}`,
        // updatedAt がある場合はそれを使用、なければ date を使用
        lastModified: new Date(project.frontmatter.updatedAt ?? project.frontmatter.date),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/projects/${project.slug}`])
          ),
        },
      }))
    })
  )

  // ブログ記事
  const blogEntries = await Promise.all(
    locales.map(async (locale) => {
      const posts = await getAllPosts(locale)
      return posts.map((post) => ({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.frontmatter.updatedAt ?? post.frontmatter.date),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/blog/${post.slug}`])
          ),
        },
      }))
    })
  )

  return [
    ...staticEntries,
    ...projectEntries.flat(),
    ...blogEntries.flat(),
  ]
}
```

---

## robots.txt

```typescript
// app/robots.ts

import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/og/'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
```

---

## 構造化データ（JSON-LD）

### 安全な JSON-LD 出力ユーティリティ

JSON-LD を安全に出力するためのユーティリティ関数を用意。`</script>` タグがデータに含まれる場合の XSS を防止。

```typescript
// lib/json-ld.ts

/**
 * JSON-LD データを安全にシリアライズする
 * </script> を含むデータによる XSS を防止
 */
export function safeJsonLdStringify(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/<\/script/gi, '<\\/script')
}
```

### WebSite スキーマ（ルートレイアウト）

```typescript
// components/seo/json-ld.tsx

import { siteConfig } from '@/lib/config'
import { safeJsonLdStringify } from '@/lib/json-ld'

export function WebSiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.url,
    },
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON-LD requires innerHTML, data is sanitized via safeJsonLdStringify
      dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
    />
  )
}
```

### Person スキーマ（About ページ）

```typescript
// components/seo/person-json-ld.tsx

import { siteConfig } from '@/lib/config'
import { safeJsonLdStringify } from '@/lib/json-ld'

export function PersonJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.author.name,
    url: siteConfig.url,
    sameAs: [
      `https://github.com/${siteConfig.author.github}`,
      `https://twitter.com/${siteConfig.author.twitter?.replace('@', '')}`,
    ],
    jobTitle: 'Software Engineer',
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON-LD requires innerHTML, data is sanitized
      dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
    />
  )
}
```

### Article スキーマ（ブログ記事）

```typescript
// components/seo/article-json-ld.tsx

import { siteConfig } from '@/lib/config'
import { safeJsonLdStringify } from '@/lib/json-ld'

type Props = {
  title: string
  description: string
  date: string
  updatedAt?: string
  url: string
  image?: string
  tags?: string[]
}

export function ArticleJsonLd({
  title,
  description,
  date,
  updatedAt,
  url,
  image,
  tags,
}: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.url,
    },
    datePublished: date,
    dateModified: updatedAt ?? date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(image && {
      image: {
        '@type': 'ImageObject',
        url: image,
      },
    }),
    ...(tags && {
      keywords: tags.join(', '),
    }),
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON-LD requires innerHTML, data is sanitized
      dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
    />
  )
}
```

### 使用例

```typescript
// app/[lang]/blog/[slug]/page.tsx

import { notFound } from 'next/navigation'
import { ArticleJsonLd } from '@/components/seo/article-json-ld'
import { getPostBySlug } from '@/lib/posts'
import { siteConfig, type Locale } from '@/lib/config'

type Props = {
  params: { lang: Locale; slug: string }
}

export default async function BlogPostPage({ params }: Props) {
  const { lang, slug } = params
  const post = await getPostBySlug(lang, slug)

  if (!post) {
    notFound()
  }

  return (
    <>
      <ArticleJsonLd
        title={post.frontmatter.title}
        description={post.frontmatter.summary}  // Posts use 'summary' field
        date={post.frontmatter.date}
        updatedAt={post.frontmatter.updatedAt}
        url={`${siteConfig.url}/${lang}/blog/${slug}`}
        image={post.frontmatter.ogImage}
        tags={post.frontmatter.tags}
      />
      {/* ページコンテンツ */}
    </>
  )
}
```

### セキュリティ考慮事項

| 項目 | 対応 |
|------|------|
| XSS 防止 | `safeJsonLdStringify` で `</script>` をエスケープ |
| データソース | 信頼できるソース（frontmatter、siteConfig）のみ使用 |
| ESLint | `react/no-danger` を明示的にコメントで無効化 |

---

## 多言語 SEO 対応

### hreflang 設定

`alternates.languages` で自動設定。

```typescript
alternates: {
  canonical: `${siteConfig.url}/${lang}/blog/${slug}`,
  languages: {
    'ja': `${siteConfig.url}/ja/blog/${slug}`,
    'en': `${siteConfig.url}/en/blog/${slug}`,
  },
}
```

生成される HTML:

```html
<link rel="canonical" href="https://yoursite.com/ja/blog/post-slug" />
<link rel="alternate" hreflang="ja" href="https://yoursite.com/ja/blog/post-slug" />
<link rel="alternate" hreflang="en" href="https://yoursite.com/en/blog/post-slug" />
```

### 注意点

| 項目 | 対応 |
|------|------|
| 同一コンテンツの別言語版がない場合 | その言語の alternates は省略 |
| デフォルト言語 | `x-default` は設定しない（ja/en 両方を明示） |
| canonical | 現在の言語版 URL を指定 |

---

## ファビコン・アイコン

### 必要ファイル

```
public/
├── favicon.ico           # 16x16, 32x32 (ICO形式)
├── favicon-16x16.png     # 16x16
├── favicon-32x32.png     # 32x32
├── apple-touch-icon.png  # 180x180
├── android-chrome-192x192.png
├── android-chrome-512x512.png
├── og-default.png        # 1200x630 (デフォルト OGP)
├── site.webmanifest
└── fonts/
    └── NotoSansJP-Bold.ttf  # OGP 画像生成用フォント
```

### Web Manifest

```json
// public/site.webmanifest
{
  "name": "Your Name",
  "short_name": "YourName",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#0a0a0a",
  "background_color": "#0a0a0a",
  "display": "standalone"
}
```

---

## パフォーマンス考慮

### OGP 画像生成

| 項目 | 対応 |
|------|------|
| Edge Runtime | `runtime = 'edge'` で高速化 |
| キャッシュ | Vercel でデフォルトでキャッシュされる |
| フォントサイズ | タイトル長に応じて動的調整 |

### メタデータ生成

| 項目 | 対応 |
|------|------|
| 静的生成 | `generateStaticParams` で事前生成 |
| 重複回避 | ルートレイアウトで共通設定、ページで上書き |

---

## レビューポイント

1. メタデータ構造は適切か
2. OGP 画像のデザイン方針は妥当か
3. サイトマップの生成ロジックは正しいか
4. 構造化データは必要十分か
5. 多言語対応（hreflang）は正しく設定されているか

---

## レビュー結果

| ポイント | 結果 | 対応 |
|---------|------|------|
| Frontmatter 整合性 | 🟡 修正済み | Posts: `title`+`summary`, Projects: `name`+`summary`+`tech` に統一 |
| API import/引数順 | 🟡 修正済み | `@/lib/posts`, `@/lib/projects` / 引数順 `(locale, slug)` |
| generateStaticParams | 🟡 修正済み | `{ lang, slug }` を返すよう修正 |
| params 型 | 🟡 修正済み | `Promise<{...}>` → plain object |
| next/og フォント | 🟡 修正済み | ローカルフォントファイル + `fonts` オプション |

---

**ステータス**: レビュー待ち
