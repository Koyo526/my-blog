# Step 6: コンポーネント設計

## 概要
UIコンポーネントの設計（共通コンポーネント、ページ固有コンポーネント、shadcn/ui選定）

---

## 設計方針

| 項目 | 方針 |
|------|------|
| デフォルト | Server Components |
| Client Components | インタラクション必要時のみ `'use client'` |
| UIライブラリ | shadcn/ui（必要最小限）+ Tailwind CSS（メイン） |
| デザイン | ミニマリスト・機能重視（参考: hiraomakoto.jp） |

---

## ディレクトリ構造

```
components/
├── layout/                    # レイアウト系
│   ├── header.tsx
│   ├── footer.tsx
│   ├── navigation.tsx
│   ├── language-switcher.tsx
│   └── theme-toggle.tsx
├── home/                      # Homeページ固有
│   ├── hero.tsx
│   └── featured-projects.tsx
├── projects/                  # プロジェクト関連
│   ├── project-card.tsx
│   └── project-list.tsx
├── blog/                      # ブログ関連
│   ├── post-card.tsx
│   ├── post-list.tsx
│   ├── post-header.tsx
│   └── tag-list.tsx
├── mdx/                       # MDXカスタムコンポーネント
│   ├── index.ts               # エクスポート集約
│   ├── code-block.tsx
│   ├── callout.tsx
│   ├── image.tsx
│   └── link-card.tsx
├── ui/                        # shadcn/ui コンポーネント
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
└── common/                    # 汎用コンポーネント
    ├── section.tsx
    ├── container.tsx
    └── external-link.tsx
```

---

## 共通コンポーネント

### Header

```typescript
// components/layout/header.tsx

import Link from 'next/link'
import { Navigation } from './navigation'
import { LanguageSwitcher } from './language-switcher'
import { ThemeToggle } from './theme-toggle'
import type { Locale } from '@/lib/i18n'

type Props = {
  lang: Locale
}

export function Header({ lang }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo / Site Name */}
        <Link href={`/${lang}`} className="text-xl font-bold">
          Portfolio
        </Link>

        {/* Navigation */}
        <Navigation lang={lang} />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher currentLang={lang} />
        </div>
      </div>
    </header>
  )
}
```

### Navigation

```typescript
// components/layout/navigation.tsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { Locale } from '@/lib/i18n'

type Props = {
  lang: Locale
}

export function Navigation({ lang }: Props) {
  const pathname = usePathname()
  const t = useTranslations('navigation')

  const links = [
    { href: `/${lang}`, label: t('home'), exact: true },
    { href: `/${lang}/projects`, label: t('projects') },
    { href: `/${lang}/blog`, label: t('blog') },
    { href: `/${lang}/about`, label: t('about') },
    { href: `/${lang}/contact`, label: t('contact') },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav className="hidden md:flex items-center gap-6">
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-foreground',
            isActive(link.href, link.exact)
              ? 'text-foreground'
              : 'text-muted-foreground'
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
```

### Footer

```typescript
// components/layout/footer.tsx

import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/i18n'

type Props = {
  lang: Locale
}

export async function Footer({ lang }: Props) {
  const t = await getTranslations({ locale: lang, namespace: 'footer' })

  return (
    <footer className="border-t border-border/40 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/username"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <GitHubIcon className="h-5 w-5" />
            </a>
            {/* 他のソーシャルリンク */}
          </div>
        </div>
      </div>
    </footer>
  )
}
```

### Language Switcher（Step 3 で設計済み、再掲）

```typescript
// components/layout/language-switcher.tsx

'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { locales, localeNames, type Locale } from '@/lib/i18n'

type Props = {
  currentLang: Locale
}

export function LanguageSwitcher({ currentLang }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('languageSwitcher')

  const switchLanguage = (newLang: Locale) => {
    document.cookie = `lang=${newLang}; path=/; max-age=${60 * 60 * 24 * 365}`
    const newPath = pathname.replace(
      new RegExp(`^/${currentLang}(?=/|$)`),
      `/${newLang}`
    )
    router.push(newPath)
  }

  return (
    <div role="group" aria-label={t('label')} className="flex items-center gap-1">
      {locales.map(locale => (
        <button
          key={locale}
          onClick={() => switchLanguage(locale)}
          disabled={locale === currentLang}
          className={cn(
            'px-2 py-1 text-sm rounded transition-colors',
            locale === currentLang
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-current={locale === currentLang ? 'true' : undefined}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
```

### Theme Toggle

```typescript
// components/layout/theme-toggle.tsx

'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Hydration mismatch 回避
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-9 w-9" /> // プレースホルダー
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  )
}
```

### Container / Section

```typescript
// components/common/container.tsx

import { cn } from '@/lib/utils'

type Props = {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className }: Props) {
  return (
    <div className={cn('container mx-auto px-4', className)}>
      {children}
    </div>
  )
}
```

```typescript
// components/common/section.tsx

import { cn } from '@/lib/utils'

type Props = {
  children: React.ReactNode
  className?: string
}

export function Section({ children, className }: Props) {
  return (
    <section className={cn('py-16 md:py-24', className)}>
      {children}
    </section>
  )
}
```

---

## Homeページコンポーネント

### Hero

```typescript
// components/home/hero.tsx

import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n'

type Props = {
  lang: Locale
}

export async function Hero({ lang }: Props) {
  const t = await getTranslations({ locale: lang, namespace: 'home.hero' })

  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          {t('title', { name: 'Your Name' })}
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          {t('subtitle')}
        </p>
        <div className="mt-8">
          <Link
            href={`/${lang}/projects`}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-6 py-3 text-background font-medium hover:bg-foreground/90 transition-colors"
          >
            {t('cta')}
          </Link>
        </div>
      </div>
    </section>
  )
}
```

### Featured Projects

```typescript
// components/home/featured-projects.tsx

import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ProjectCard } from '@/components/projects/project-card'
import type { Project } from '@/lib/projects'
import type { Locale } from '@/lib/i18n'

type Props = {
  projects: Project[]
  lang: Locale
}

export async function FeaturedProjects({ projects, lang }: Props) {
  const t = await getTranslations({ locale: lang, namespace: 'home.featuredProjects' })

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{t('title')}</h2>
          <Link
            href={`/${lang}/projects`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('viewAll')} →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <ProjectCard key={project.slug} project={project} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## プロジェクトコンポーネント

### Project Card

```typescript
// components/projects/project-card.tsx

import Image from 'next/image'
import Link from 'next/link'
import type { Project } from '@/lib/projects'
import type { Locale } from '@/lib/i18n'

type Props = {
  project: Project
  lang: Locale
}

export function ProjectCard({ project, lang }: Props) {
  const { frontmatter, slug } = project

  return (
    <article className="group overflow-hidden rounded-lg border border-border/40 bg-card transition-colors hover:border-border focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      {/* Thumbnail */}
      {frontmatter.thumbnail && (
        <div className="aspect-video overflow-hidden">
          <Image
            src={frontmatter.thumbnail}
            alt=""
            width={600}
            height={340}
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Pinned badge */}
        {frontmatter.pinned && (
          <span className="inline-block mb-2 text-xs text-amber-500">
            📌 Pinned
          </span>
        )}

        {/* Title as Link */}
        <h3 className="font-semibold">
          <Link
            href={`/${lang}/projects/${slug}`}
            className="hover:underline focus:outline-none"
          >
            {frontmatter.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {frontmatter.summary}
        </p>

        {/* Tech Stack */}
        <div className="mt-3 flex flex-wrap gap-1">
          {frontmatter.tech.slice(0, 4).map(tech => (
            <span
              key={tech}
              className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tech}
            </span>
          ))}
          {frontmatter.tech.length > 4 && (
            <span className="text-xs text-muted-foreground">
              +{frontmatter.tech.length - 4}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
```

### Project List

```typescript
// components/projects/project-list.tsx

import { ProjectCard } from './project-card'
import type { Project } from '@/lib/projects'
import type { Locale } from '@/lib/i18n'

type Props = {
  projects: Project[]
  lang: Locale
}

export function ProjectList({ projects, lang }: Props) {
  if (projects.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No projects found.
      </p>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map(project => (
        <ProjectCard key={project.slug} project={project} lang={lang} />
      ))}
    </div>
  )
}
```

---

## ブログコンポーネント

### Post Card

```typescript
// components/blog/post-card.tsx

import Image from 'next/image'
import Link from 'next/link'
import type { Post } from '@/lib/posts'
import type { Locale } from '@/lib/i18n'

type Props = {
  post: Post
  lang: Locale
}

export function PostCard({ post, lang }: Props) {
  const { frontmatter, slug } = post

  return (
    <article className="group flex gap-4 py-4 border-b border-border/40 last:border-b-0 focus-within:bg-muted/50 transition-colors">
      {/* Thumbnail (optional) */}
      {frontmatter.thumbnail && (
        <div className="hidden sm:block shrink-0 w-32 h-20 overflow-hidden rounded">
          <Image
            src={frontmatter.thumbnail}
            alt=""
            width={128}
            height={80}
            className="object-cover h-full w-full"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <time dateTime={frontmatter.date}>{frontmatter.date}</time>
          {frontmatter.draft && (
            <span className="text-amber-500 text-xs">Draft</span>
          )}
          {frontmatter.pinned && (
            <span className="text-amber-500 text-xs">📌</span>
          )}
        </div>

        {/* Title as Link */}
        <h3 className="mt-1 font-medium">
          <Link
            href={`/${lang}/blog/${slug}`}
            className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            {frontmatter.title}
          </Link>
        </h3>

        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {frontmatter.summary}
        </p>

        {/* Tags */}
        <div className="mt-2 flex flex-wrap gap-1">
          {frontmatter.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-xs text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
```

### Post List

```typescript
// components/blog/post-list.tsx

import { PostCard } from './post-card'
import type { Post } from '@/lib/posts'
import type { Locale } from '@/lib/i18n'

type Props = {
  posts: Post[]
  lang: Locale
}

export function PostList({ posts, lang }: Props) {
  if (posts.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No posts found.
      </p>
    )
  }

  return (
    <div className="divide-y divide-border/40">
      {posts.map(post => (
        <PostCard key={post.slug} post={post} lang={lang} />
      ))}
    </div>
  )
}
```

### Post Header

```typescript
// components/blog/post-header.tsx

import { getFormatter } from 'next-intl/server'
import type { PostFrontmatter } from '@/lib/schemas/post'
import type { Locale } from '@/lib/i18n'

type Props = {
  frontmatter: PostFrontmatter
  lang: Locale
}

export async function PostHeader({ frontmatter, lang }: Props) {
  const format = await getFormatter({ locale: lang })

  const formattedDate = format.dateTime(new Date(frontmatter.date), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="mb-8 pb-8 border-b border-border/40">
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {frontmatter.tags.map(tag => (
          <span
            key={tag}
            className="rounded bg-muted px-2 py-0.5 text-sm text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
        {frontmatter.title}
      </h1>

      {/* Meta */}
      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <time dateTime={frontmatter.date}>{formattedDate}</time>
        {frontmatter.updatedAt && (
          <span>Updated: {frontmatter.updatedAt}</span>
        )}
      </div>
    </header>
  )
}
```

### Tag List

```typescript
// components/blog/tag-list.tsx

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Locale } from '@/lib/i18n'

type Props = {
  tags: string[]
  activeTag?: string
  lang: Locale
}

export function TagList({ tags, activeTag, lang }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/${lang}/blog`}
        className={cn(
          'rounded px-3 py-1 text-sm transition-colors',
          !activeTag
            ? 'bg-foreground text-background'
            : 'bg-muted text-muted-foreground hover:text-foreground'
        )}
      >
        All
      </Link>
      {tags.map(tag => (
        <Link
          key={tag}
          href={`/${lang}/blog?tag=${encodeURIComponent(tag)}`}
          className={cn(
            'rounded px-3 py-1 text-sm transition-colors',
            activeTag === tag
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          {tag}
        </Link>
      ))}
    </div>
  )
}
```

---

## MDXカスタムコンポーネント

### コンポーネント登録

```typescript
// components/mdx/index.ts

import { CodeBlock } from './code-block'
import { Callout } from './callout'
import { MdxImage } from './image'
import { LinkCard } from './link-card'

export const mdxComponents = {
  // HTML要素のオーバーライド
  pre: CodeBlock,
  img: MdxImage,

  // カスタムコンポーネント
  Callout,
  LinkCard,
}
```

### Code Block

```typescript
// components/mdx/code-block.tsx

import { cn } from '@/lib/utils'

type Props = {
  children: React.ReactNode
  className?: string
}

export function CodeBlock({ children, className }: Props) {
  return (
    <pre
      className={cn(
        'overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm',
        className
      )}
    >
      {children}
    </pre>
  )
}
```

### Callout

```typescript
// components/mdx/callout.tsx

import { cn } from '@/lib/utils'

type CalloutType = 'info' | 'warning' | 'error' | 'tip'

type Props = {
  type?: CalloutType
  children: React.ReactNode
}

const styles: Record<CalloutType, string> = {
  info: 'border-blue-500/50 bg-blue-500/10',
  warning: 'border-amber-500/50 bg-amber-500/10',
  error: 'border-red-500/50 bg-red-500/10',
  tip: 'border-green-500/50 bg-green-500/10',
}

const icons: Record<CalloutType, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  tip: '💡',
}

export function Callout({ type = 'info', children }: Props) {
  return (
    <div
      className={cn(
        'my-4 rounded-lg border-l-4 p-4',
        styles[type]
      )}
    >
      <div className="flex gap-2">
        <span className="shrink-0">{icons[type]}</span>
        <div className="prose-sm">{children}</div>
      </div>
    </div>
  )
}
```

### Image

```typescript
// components/mdx/image.tsx

import NextImage from 'next/image'

type Props = {
  src: string
  alt: string
  width?: number
  height?: number
}

export function MdxImage({ src, alt, width = 800, height = 450 }: Props) {
  return (
    <figure className="my-6">
      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-lg"
      />
      {alt && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {alt}
        </figcaption>
      )}
    </figure>
  )
}
```

### Link Card

```typescript
// components/mdx/link-card.tsx

type Props = {
  url: string
  title?: string
  description?: string
}

export function LinkCard({ url, title, description }: Props) {
  const hostname = new URL(url).hostname

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-4 flex items-center gap-4 rounded-lg border border-border/40 p-4 transition-colors hover:border-border hover:bg-muted/50"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{title || url}</p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{hostname}</p>
      </div>
      <span className="text-muted-foreground">→</span>
    </a>
  )
}
```

---

## shadcn/ui 使用コンポーネント

### 選定基準

| 基準 | 説明 |
|------|------|
| 必要最小限 | 自作が複雑 or アクセシビリティ重要なもののみ |
| カスタマイズ性 | Tailwind で上書き可能 |
| 軽量 | 不要な依存を避ける |

### 使用コンポーネント一覧

| コンポーネント | 用途 | 理由 |
|---------------|------|------|
| `Button` | 汎用ボタン | variant, size 管理 |
| `Card` | カードUI | 構造化された Card.Header/Content/Footer |
| `Dialog` | モーダル | アクセシビリティ（フォーカストラップ等） |
| `Sheet` | モバイルメニュー | スライドインメニュー |
| `Separator` | 区切り線 | semantic な hr |
| `Badge` | タグ/ラベル | variant 管理 |

### 不使用（自作で十分）

| コンポーネント | 理由 |
|---------------|------|
| `Avatar` | img + rounded で十分 |
| `Tooltip` | シンプルな title 属性で十分 |
| `Input` | カスタムスタイルで十分 |
| `Label` | label 要素で十分 |

---

## ユーティリティ関数

### cn (Class Name Merge)

```typescript
// lib/utils.ts

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## Server / Client Components 分類

| コンポーネント | 種別 | 理由 |
|---------------|------|------|
| Header | Server | 静的、データフェッチなし |
| Navigation | **Client** | usePathname, useTranslations |
| Footer | Server | getTranslations |
| LanguageSwitcher | **Client** | useRouter, Cookie操作 |
| ThemeToggle | **Client** | useTheme, useState |
| Hero | Server | getTranslations |
| FeaturedProjects | Server | getTranslations |
| ProjectCard | Server | 静的 |
| PostCard | Server | 静的 |
| PostHeader | Server | getFormatter |
| TagList | Server | 静的、Link のみ |
| MDX Components | Server | 静的 |

---

## アクセシビリティ考慮

| 項目 | 対応 |
|------|------|
| キーボード操作 | 全インタラクティブ要素にフォーカス可能 |
| スクリーンリーダー | aria-label, role 適切に設定 |
| カラーコントラスト | WCAG AA 準拠（4.5:1 以上） |
| フォーカス表示 | focus-visible でリング表示 |
| 画像 alt | 装飾画像は空alt、意味のある画像は適切なalt |

### カードUIのLinkパターン

**避けるべき**: `absolute inset-0` の Link overlay

```typescript
// ❌ アンチパターン
<article className="relative">
  <h3>{title}</h3>
  <Link href={url} className="absolute inset-0" aria-label={title} />
</article>
```

問題点：
- 内部にボタン/リンクを置くとクリックできない
- スクリーンリーダーの読み上げ順が不自然
- フォーカスリングがカード全体に広がり見づらい

**推奨**: タイトルを Link で包む + `focus-within` で視覚フィードバック

```typescript
// ✅ 推奨パターン
<article className="group focus-within:ring-2 focus-within:ring-ring">
  <h3>
    <Link href={url} className="hover:underline focus:outline-none">
      {title}
    </Link>
  </h3>
</article>
```

利点：
- タイトルだけがリンク → a11y ツリーが自然
- `focus-within` でカード全体にフォーカス感を演出
- 内部に別のリンク/ボタンを追加可能

---

## レビュー結果

| ポイント | 結果 | 対応 |
|---------|------|------|
| getTranslations の呼び出し | 🟡 修正済み | `{ locale: lang, namespace }` 形式に統一 |
| cn import 漏れ | 🟡 修正済み | LanguageSwitcher に import 追加 |
| Link overlay パターン | 🟡 修正済み | タイトル Link + focus-within に変更 |
| Frontmatter フィールド名 | ✅ 問題なし | Step 4 で `thumbnail` + `ogImage` に分離済み |

---

**ステータス**: ✅ 承認済み
