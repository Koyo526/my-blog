# Step 8: アニメーション設計

## 概要
Framer Motion を使用したアニメーション設計（コンポーネントアニメーション、マイクロインタラクション）

---

## 設計方針

| 項目 | 方針 |
|------|------|
| ライブラリ | Framer Motion |
| スタイル | 控えめ・機能的（派手さより心地よさ） |
| 対象 | コンポーネント単位（ページ遷移は見送り） |
| パフォーマンス | GPU アクセラレート対象プロパティ優先 |
| アクセシビリティ | `prefers-reduced-motion` 対応必須 |
| Server/Client 境界 | アニメーション対象は Client Component に寄せる |

### なぜページ遷移アニメーションを見送るか

| 理由 | 説明 |
|------|------|
| App Router の制約 | layout が維持されるため `<AnimatePresence>` が効きにくい |
| 複雑性 | 対応には `usePathname` + state 管理が必要で MVP には重い |
| UX 優先度 | ミニマリストデザインでは過度な演出より速度が重要 |

**MVP 方針**: コンポーネント単位のアニメーションに集中。ページ遷移は将来拡張。

### Server/Client 境界の方針

アニメーションを含むコンポーネントは **Client Component に寄せる** のが安全。

| 方針 | 説明 |
|------|------|
| ❌ 避ける | Server Component (async + getTranslations) 内で motion コンポーネントを直接使用 |
| ✅ 推奨 | アニメーション対象コンポーネント全体を Client Component 化し、`useTranslations` を使用 |
| ✅ 代替案 | Server Component から props でテキストを渡し、Client wrapper で motion を適用 |

**理由**: Server/Client 境界をまたぐと Hydration の複雑さが増し、デバッグが困難になる。

---

## ファイル構成

```
components/
├── motion/
│   ├── fade-in.tsx           # フェードイン
│   ├── slide-up.tsx          # スライドアップ
│   ├── stagger-container.tsx # 子要素の順次表示
│   └── motion-config.tsx     # 共通設定 Provider
└── ...
```

---

## アニメーション仕様

### 使用箇所一覧

| 箇所 | アニメーション | 優先度 |
|------|---------------|--------|
| Hero セクション | フェードイン + スライドアップ | 高 |
| カード一覧 | 順次フェードイン（stagger） | 高 |
| カードホバー | スケールアップ + 影 | 中 |
| ナビゲーション | アンダーライン伸縮 | 低 |
| モバイルメニュー | スライドイン | 中 |
| テーマ切替アイコン | 回転 | 低 |

### 共通パラメータ

```typescript
// 共通のイージングとデュレーション
const defaultTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1], // cubic-bezier (ease-out 系)
}

const staggerTransition = {
  staggerChildren: 0.1,
  delayChildren: 0.1,
}
```

---

## コンポーネント実装

### Motion Config Provider

```typescript
// components/motion/motion-config.tsx

'use client'

import { MotionConfig } from 'framer-motion'

type Props = {
  children: React.ReactNode
}

export function MotionProvider({ children }: Props) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  )
}
```

**`reducedMotion: "user"`**: OS の `prefers-reduced-motion` を自動で尊重。

### Fade In

```typescript
// components/motion/fade-in.tsx

'use client'

import { motion } from 'framer-motion'

type Props = {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

### Slide Up

```typescript
// components/motion/slide-up.tsx

'use client'

import { motion } from 'framer-motion'

type Props = {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function SlideUp({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

### Stagger Container（順次表示）

```typescript
// components/motion/stagger-container.tsx

'use client'

import { motion } from 'framer-motion'

type Props = {
  children: React.ReactNode
  className?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

export function StaggerContainer({ children, className }: Props) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: Props) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}
```

**`whileInView` + `viewport`**: スクロールで要素が画面に入ったときにアニメーション開始。`once: true` で1回のみ実行。

---

## 使用例

### Hero セクション

**方針**: Hero 全体を Client Component 化し、`useTranslations` を使用。

```typescript
// components/home/hero.tsx

'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import Link from 'next/link'

type Props = {
  lang: string
}

const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
}

export function Hero({ lang }: Props) {
  const t = useTranslations('home.hero')

  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <motion.h1
          variants={slideUpVariants}
          initial="hidden"
          animate="visible"
          custom={0}
          className="text-4xl md:text-6xl font-bold tracking-tight"
        >
          {t('title', { name: 'Your Name' })}
        </motion.h1>
        <motion.p
          variants={slideUpVariants}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="mt-4 text-xl text-muted-foreground"
        >
          {t('subtitle')}
        </motion.p>
        <motion.div
          variants={slideUpVariants}
          initial="hidden"
          animate="visible"
          custom={0.2}
          className="mt-8"
        >
          <Link
            href={`/${lang}/projects`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t('cta')}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
```

**ポイント**:
- `'use client'` で Client Component 化
- `useTranslations` で翻訳取得（Server の getTranslations は使わない）
- `custom` prop で delay を動的に指定
- Hero は通常ファーストビューなので `animate` でOK（`whileInView` 不要）

### カード一覧（Stagger）

```typescript
// components/projects/project-list.tsx

import { StaggerContainer, StaggerItem } from '@/components/motion/stagger-container'

export function ProjectList({ projects, lang }: Props) {
  return (
    <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map(project => (
        <StaggerItem key={project.slug}>
          <ProjectCard project={project} lang={lang} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}
```

---

## ホバーアニメーション

### カードホバー（CSS + Tailwind）

シンプルなホバーは CSS/Tailwind で十分。Framer Motion は不要。

```typescript
// components/projects/project-card.tsx

export function ProjectCard({ project, lang }: Props) {
  return (
    <article className="
      group overflow-hidden rounded-lg border border-border/40 bg-card
      transition-all duration-200
      hover:border-border hover:shadow-lg hover:-translate-y-1
      focus-within:ring-2 focus-within:ring-ring
    ">
      {/* Thumbnail */}
      {frontmatter.thumbnail && (
        <div className="aspect-video overflow-hidden">
          <Image
            src={frontmatter.thumbnail}
            alt=""
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      {/* ... */}
    </article>
  )
}
```

### ナビゲーションアンダーライン

**重要**: `layoutId` を使うため、Navigation は**完全に Client Component** として実装する。リンク配列・active 判定・レンダリングをすべて同一コンポーネント内に閉じる。

```typescript
// components/layout/navigation.tsx

'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

type Props = {
  lang: string
}

export function Navigation({ lang }: Props) {
  const pathname = usePathname()
  const t = useTranslations('navigation')

  // リンク配列もこのコンポーネント内で定義
  const links = [
    { href: `/${lang}`, label: t('home') },
    { href: `/${lang}/projects`, label: t('projects') },
    { href: `/${lang}/blog`, label: t('blog') },
    { href: `/${lang}/about`, label: t('about') },
  ]

  const isActive = (href: string) => {
    if (href === `/${lang}`) {
      return pathname === `/${lang}` || pathname === `/${lang}/`
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="hidden md:flex items-center gap-6">
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className="relative py-2 text-sm font-medium"
        >
          {link.label}
          {isActive(link.href) && (
            <motion.div
              layoutId="nav-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </Link>
      ))}
    </nav>
  )
}
```

**ポイント**:
- `layoutId` はすべての要素が同一 Client Component ツリー内にある必要がある
- リンク配列、active 判定、レンダリングを分散させない
- Navigation は Server Component 化しない（アンダーラインアニメーションが壊れる）

---

## モバイルメニュー

shadcn/ui の `Sheet` はアニメーション内蔵のため、追加実装は不要。

```typescript
// components/layout/mobile-menu.tsx

'use client'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { MenuIcon } from 'lucide-react'

export function MobileMenu({ lang }: Props) {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden p-2">
        <MenuIcon className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent side="right">
        {/* メニュー内容 */}
      </SheetContent>
    </Sheet>
  )
}
```

---

## テーマ切替アイコン

```typescript
// components/layout/theme-toggle.tsx

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-9 w-9" />

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </motion.div>
      </AnimatePresence>
    </button>
  )
}
```

---

## パフォーマンス考慮

### GPU アクセラレート対象

| プロパティ | GPU 対応 | 使用推奨 |
|-----------|---------|---------|
| `transform` (translate, scale, rotate) | ✅ | 積極的に使用 |
| `opacity` | ✅ | 積極的に使用 |
| `width`, `height` | ❌ | 避ける |
| `top`, `left` | ❌ | transform で代替 |
| `background-color` | ❌ | transition-colors は OK |

### 避けるべきパターン

```typescript
// ❌ 避ける: width/height のアニメーション
<motion.div
  initial={{ width: 0 }}
  animate={{ width: '100%' }}
/>

// ✅ 推奨: scaleX で代替
<motion.div
  initial={{ scaleX: 0, transformOrigin: 'left' }}
  animate={{ scaleX: 1 }}
/>
```

### will-change の注意

```css
/* ❌ 常時適用は避ける（メモリ消費） */
.card {
  will-change: transform;
}

/* ✅ ホバー時のみ */
.card:hover {
  will-change: transform;
}
```

---

## アクセシビリティ

### prefers-reduced-motion 対応

Framer Motion の `MotionConfig` で自動対応。

```typescript
// app/layout.tsx

import { MotionProvider } from '@/components/motion/motion-config'

export default function RootLayout({ children }: Props) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <MotionProvider>
            {children}
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### CSS フォールバック

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

## 依存パッケージ

```json
{
  "dependencies": {
    "framer-motion": "^11.x"
  }
}
```

---

## 将来拡張（ページ遷移）

MVP 後に検討する項目。

### 方式案

| 方式 | 難易度 | 備考 |
|------|--------|------|
| View Transitions API | 低 | ブラウザネイティブ、Safari 未対応 |
| next-view-transitions | 中 | Polyfill ライブラリ |
| カスタム実装 | 高 | usePathname + state 管理 |

### View Transitions API（将来）

```typescript
// 将来: next.config.js
experimental: {
  viewTransition: true,
}
```

---

## レビューポイント

1. アニメーション箇所の選定は適切か
2. パフォーマンス考慮は十分か
3. アクセシビリティ対応は十分か
4. ページ遷移の見送りは妥当か

---

**ステータス**: レビュー待ち
