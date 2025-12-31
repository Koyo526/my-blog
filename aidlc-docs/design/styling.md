# Step 7: スタイリング設計

## 概要
Tailwind CSS によるスタイリング設計（テーマ定義、ダークモード、フォント、レスポンシブ）

---

## 設計方針

| 項目 | 方針 |
|------|------|
| ベース | Tailwind CSS v3.4+ |
| テーマ管理 | CSS変数（shadcn/ui 互換） |
| ダークモード | `class` 戦略 + next-themes |
| フォント | Google Fonts（ブラウザ非依存） |
| デザイン | ミニマリスト・ダーク基調（参考: hiraomakoto.jp） |

---

## ファイル構成

```
my-blog/
├── tailwind.config.ts        # Tailwind 設定
├── app/
│   └── globals.css           # グローバルスタイル・CSS変数
├── lib/
│   └── utils.ts              # cn() ユーティリティ
└── components/
    └── theme-provider.tsx    # next-themes Provider
```

---

## Tailwind 設定

### tailwind.config.ts

```typescript
// tailwind.config.ts

import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.mdx',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        // CSS変数ベース（shadcn/ui互換）
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      // fontFamily は globals.css で直接定義（二重管理を避ける）
      // Tailwind の font-sans は使用しない
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'hsl(var(--foreground))',
            a: {
              color: 'hsl(var(--primary))',
              '&:hover': {
                color: 'hsl(var(--primary) / 0.8)',
              },
            },
            'h1, h2, h3, h4': {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            code: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--muted))',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: 'hsl(var(--muted))',
              color: 'hsl(var(--foreground))',
            },
            blockquote: {
              borderLeftColor: 'hsl(var(--border))',
              color: 'hsl(var(--muted-foreground))',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
```

---

## カラーパレット

### 設計コンセプト

| 要素 | ダークモード | ライトモード |
|------|-------------|-------------|
| 背景 | ほぼ黒（#0a0a0a） | 純白（#fafafa） |
| テキスト | 明るいグレー | 濃いグレー |
| アクセント | 控えめ（グレー系） | 控えめ（グレー系） |
| ボーダー | 薄いグレー | 薄いグレー |

**デザイン方針**: 派手なアクセントカラーは使わず、コンテンツを主役にする。

### CSS変数定義（globals.css）

```css
/* app/globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* ライトモード */
    --background: 0 0% 98%;           /* #fafafa */
    --foreground: 0 0% 9%;            /* #171717 */

    --card: 0 0% 100%;                /* #ffffff */
    --card-foreground: 0 0% 9%;

    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 9%;

    --primary: 0 0% 9%;               /* テキストと同じ（ミニマル） */
    --primary-foreground: 0 0% 98%;

    --secondary: 0 0% 96%;            /* #f5f5f5 */
    --secondary-foreground: 0 0% 9%;

    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 45%;     /* #737373 */

    --accent: 0 0% 96%;
    --accent-foreground: 0 0% 9%;

    --destructive: 0 84% 60%;         /* 赤系（エラー用） */
    --destructive-foreground: 0 0% 98%;

    --border: 0 0% 90%;               /* #e5e5e5 */
    --input: 0 0% 90%;
    --ring: 0 0% 9%;

    --radius: 0.5rem;
  }

  .dark {
    /* ダークモード */
    --background: 0 0% 4%;            /* #0a0a0a */
    --foreground: 0 0% 98%;           /* #fafafa */

    --card: 0 0% 7%;                  /* #121212 */
    --card-foreground: 0 0% 98%;

    --popover: 0 0% 7%;
    --popover-foreground: 0 0% 98%;

    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;

    --secondary: 0 0% 15%;            /* #262626 */
    --secondary-foreground: 0 0% 98%;

    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 64%;     /* #a3a3a3 */

    --accent: 0 0% 15%;
    --accent-foreground: 0 0% 98%;

    --destructive: 0 62% 50%;
    --destructive-foreground: 0 0% 98%;

    --border: 0 0% 20%;               /* #333333 */
    --input: 0 0% 20%;
    --ring: 0 0% 83%;                 /* #d4d4d4 */
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

### カラー対比表

| 要素 | Light | Dark | コントラスト比 |
|------|-------|------|---------------|
| 本文テキスト | #171717 on #fafafa | #fafafa on #0a0a0a | 18:1+ ✅ |
| muted テキスト | #737373 on #fafafa | #a3a3a3 on #0a0a0a | 4.5:1+ ✅ |
| ボーダー | #e5e5e5 | #333333 | - |

**WCAG AA 準拠**: 本文 4.5:1 以上、大きなテキスト 3:1 以上

---

## フォント設計

### 選定基準

| 基準 | 説明 |
|------|------|
| 可読性 | 日本語・英語両方で読みやすい |
| ブラウザ非依存 | Google Fonts で統一 |
| ファイルサイズ | 必要なウェイトのみ読み込み |
| 表示速度 | `next/font` で最適化 |

### 採用フォント

| 用途 | フォント | ウェイト | 理由 |
|------|---------|---------|------|
| 本文（日本語） | Noto Sans JP | 400, 500, 700 | Google 推奨、可読性高い |
| 本文（英語） | Inter | 400, 500, 600, 700 | モダン、variable font 対応 |
| コード | JetBrains Mono | 400 | 開発者向け、リガチャ対応 |

### next/font 設定（案A: シンプル運用）

**方針**: CSS変数は使わず、next/font の className を直接使用。
Tailwind の `font-sans` は使用せず、body で font-family を直接定義。

```typescript
// app/layout.tsx

import { Inter, Noto_Sans_JP, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'

// 英語フォント
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

// 日本語フォント
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

// コードフォント
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',  // コードのみ CSS変数で参照
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={jetbrainsMono.variable} suppressHydrationWarning>
      <body
        className={`${inter.className} ${notoSansJP.className}`}
        style={{
          fontFamily: `${inter.style.fontFamily}, ${notoSansJP.style.fontFamily}, system-ui, sans-serif`,
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### フォントスタック

```css
/* globals.css */

@layer base {
  /* body の font-family は layout.tsx で inline style 指定済み */
  /* ここでは code/pre のみ定義 */

  code, pre {
    font-family: var(--font-mono), 'Menlo', 'Monaco', 'Consolas', monospace;
  }
}
```

### なぜこの構成か

| 方式 | 問題点 |
|------|--------|
| CSS変数で二重定義 | Tailwind と globals.css がズレやすい |
| Tailwind の font-sans | 日本語フォントを含めるのが煩雑 |

**採用**: next/font の className を body に直接適用。シンプルで事故りにくい。

---

## ダークモード設計

### next-themes 設定

```typescript
// components/theme-provider.tsx

'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### レイアウトでの適用

**重要**: ThemeProvider は `app/layout.tsx`（root layout）に配置する。

```typescript
// app/layout.tsx（root layout）
// ※ [lang]/layout.tsx ではなく root に置く理由:
// - next-themes は <html> の class を操作するため、アプリ全体で1箇所が安全
// - 言語切替時に Provider が再マウントされるとテーマ状態がリセットされる

import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

```typescript
// app/[lang]/layout.tsx
// ※ こちらは NextIntlClientProvider とレイアウト（Header/Footer）のみ

import { NextIntlClientProvider } from 'next-intl'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  const messages = await getMessages(params.lang)

  return (
    <NextIntlClientProvider locale={params.lang} messages={messages}>
      <Header lang={params.lang} />
      <main>{children}</main>
      <Footer lang={params.lang} />
    </NextIntlClientProvider>
  )
}
```

### 設定オプション

| オプション | 値 | 説明 |
|-----------|-----|------|
| `attribute` | `"class"` | `<html class="dark">` で切替 |
| `defaultTheme` | `"dark"` | 初回アクセス時はダーク |
| `enableSystem` | `true` | OS設定を尊重 |
| `disableTransitionOnChange` | `true` | 切替時のチラつき防止 |

### Hydration 対策

```typescript
// components/layout/theme-toggle.tsx

'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // SSR時はプレースホルダーを表示（Hydration mismatch 回避）
  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden="true" />
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors"
      aria-label={isDark ? 'ライトモードに切替' : 'ダークモードに切替'}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
```

---

## レスポンシブ設計

### ブレークポイント

| 名前 | 幅 | 用途 |
|------|-----|------|
| `sm` | 640px | モバイル横向き |
| `md` | 768px | タブレット |
| `lg` | 1024px | デスクトップ |
| `xl` | 1280px | 大画面 |
| `2xl` | 1536px | ワイドスクリーン |

**コンテナ最大幅**: 1280px（読みやすさ優先）

### モバイルファースト原則

```typescript
// ✅ 推奨: モバイルファースト
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ❌ 非推奨: デスクトップファースト
<div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
```

### レスポンシブパターン

#### ナビゲーション

```typescript
// モバイル: ハンバーガーメニュー
// デスクトップ: 横並びナビ

<nav className="hidden md:flex items-center gap-6">
  {/* Desktop Navigation */}
</nav>

<Sheet>
  <SheetTrigger className="md:hidden">
    <MenuIcon />
  </SheetTrigger>
  <SheetContent>
    {/* Mobile Navigation */}
  </SheetContent>
</Sheet>
```

#### カードグリッド

```typescript
// 1列 → 2列 → 3列
<div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {projects.map(project => (
    <ProjectCard key={project.slug} project={project} />
  ))}
</div>
```

#### 記事本文

```typescript
// 最大幅を制限して可読性確保
<article className="prose prose-lg max-w-3xl mx-auto">
  {content}
</article>
```

---

## スペーシングシステム

### 基本単位

Tailwind デフォルトの 4px 基準を使用。

| クラス | サイズ | 用途 |
|--------|--------|------|
| `gap-1` | 4px | アイコン間 |
| `gap-2` | 8px | 小さな要素間 |
| `gap-4` | 16px | 標準の要素間 |
| `gap-6` | 24px | カード間 |
| `gap-8` | 32px | セクション内 |
| `py-16` | 64px | セクション間 |
| `py-24` | 96px | 大きなセクション間 |

### セクションスペーシング

```typescript
// components/common/section.tsx

export function Section({ children, className }: Props) {
  return (
    <section className={cn('py-16 md:py-24', className)}>
      {children}
    </section>
  )
}
```

---

## Prose（タイポグラフィ）

### @tailwindcss/typography 設定

```css
/* MDX本文に適用 */
.prose {
  @apply max-w-none;
}

.prose h1 {
  @apply text-3xl font-bold tracking-tight mt-8 mb-4;
}

.prose h2 {
  @apply text-2xl font-semibold tracking-tight mt-8 mb-4;
}

.prose h3 {
  @apply text-xl font-semibold mt-6 mb-3;
}

.prose p {
  @apply leading-7 mb-4;
}

.prose ul, .prose ol {
  @apply my-4 pl-6;
}

.prose li {
  @apply my-2;
}

.prose a {
  @apply underline underline-offset-4 hover:text-foreground/80 transition-colors;
}

.prose img {
  @apply rounded-lg my-6;
}
```

### コードブロック

```css
.prose pre {
  @apply bg-zinc-900 text-zinc-100 rounded-lg p-4 overflow-x-auto my-6;
}

.prose code {
  @apply bg-muted px-1.5 py-0.5 rounded text-sm font-mono;
}

/* pre 内の code はスタイルリセット */
.prose pre code {
  @apply bg-transparent p-0 rounded-none;
}
```

---

## ユーティリティクラス

### よく使うパターン

```css
/* globals.css */

@layer utilities {
  /* テキスト省略 */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* フォーカスリング */
  .focus-ring {
    @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
  }

  /* スムーズスクロール */
  .scroll-smooth {
    scroll-behavior: smooth;
  }
}
```

### cn() ユーティリティ

```typescript
// lib/utils.ts

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**使用例**:

```typescript
<button
  className={cn(
    'px-4 py-2 rounded',
    isActive && 'bg-primary text-primary-foreground',
    isDisabled && 'opacity-50 cursor-not-allowed'
  )}
>
  Button
</button>
```

---

## アニメーション基盤

### トランジション方針

**重要**: グローバルな `* { transition }` は避ける。

```css
/* ❌ 避けるべき */
* {
  @apply transition-colors duration-200;
}
```

問題点：
- 入力・レイアウト系が妙にヌルっとして UX が崩れる
- パフォーマンス低下
- `prefers-reduced-motion` への配慮が難しくなる

### 推奨: コンポーネント単位で適用

```css
/* globals.css */

@layer base {
  /* インタラクティブ要素のみトランジション */
  a, button {
    @apply transition-colors duration-150;
  }
}
```

### コンポーネントでの適用例

```typescript
// ✅ 必要な箇所にのみ transition を付ける

// Button
<button className="... transition-colors hover:bg-accent">

// Card
<article className="... transition-colors hover:border-border">

// Link
<Link className="... transition-colors hover:text-foreground">
```

### トランジションクラス

| 用途 | クラス | 備考 |
|------|--------|------|
| ホバー色変化 | `transition-colors` | 最も軽量 |
| スケール変化 | `transition-transform` | GPU アクセラレート |
| 複合 | `transition-all` | 重いので避ける |

### アクセシビリティ対応

```css
/* globals.css */

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## パフォーマンス考慮

### CSS 最適化

| 対策 | 方法 |
|------|------|
| 未使用CSS削除 | Tailwind の purge（`content` 設定） |
| フォント最適化 | `next/font` + `display: swap` |
| 変数最小化 | 使用する変数のみ定義 |

### Critical CSS

Next.js App Router は自動的に Critical CSS をインライン化。
追加設定は不要。

---

## 依存パッケージ

```json
{
  "dependencies": {
    "next-themes": "^0.4.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.x",
    "@tailwindcss/typography": "^0.5.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x"
  }
}
```

---

## レビュー結果

| ポイント | 結果 | 対応 |
|---------|------|------|
| ThemeProvider 配置 | 🟡 修正済み | root layout に移動、[lang] は NextIntlClientProvider のみ |
| フォント変数の二重管理 | 🟡 修正済み | 案A採用: body で直接 font-family 指定、Tailwind は触らない |
| グローバル transition | 🟡 修正済み | `*` 指定を削除、a/button のみ + コンポーネント単位に変更 |
| prefers-reduced-motion | 🟢 追加 | アクセシビリティ対応のメディアクエリ追加 |

---

**ステータス**: ✅ 承認済み
