# Step 2: ルーティング詳細設計

## 概要
Next.js App Router を使用した多言語対応ルーティング設計

---

## URL設計

### 全ルート一覧

| パス | ページ | 説明 |
|------|--------|------|
| `/` | - | middleware で `/{lang}` にリダイレクト |
| `/{lang}` | Home | ポートフォリオ主役ページ |
| `/{lang}/projects` | Projects | プロジェクト一覧 |
| `/{lang}/projects/{slug}` | Project Detail | プロジェクト詳細（MDX） |
| `/{lang}/blog` | Blog | 記事一覧 |
| `/{lang}/blog/{slug}` | Post Detail | 記事詳細（MDX） |
| `/{lang}/about` | About | 自己紹介 |
| `/{lang}/contact` | Contact | 連絡先 |

### 言語コード
| コード | 言語 | 備考 |
|--------|------|------|
| `ja` | 日本語 | - |
| `en` | 英語 | fallback |

### URL例
```
/                           → /ja または /en にリダイレクト
/ja                         → 日本語 Home
/en                         → 英語 Home
/ja/projects                → 日本語プロジェクト一覧
/ja/projects/my-portfolio   → 日本語プロジェクト詳細
/en/blog/nextjs-setup       → 英語記事詳細
```

---

## App Router ディレクトリ構造

```
app/
├── [lang]/
│   ├── layout.tsx              # 言語別共通レイアウト
│   ├── page.tsx                # Home
│   ├── projects/
│   │   ├── page.tsx            # プロジェクト一覧
│   │   └── [slug]/
│   │       └── page.tsx        # プロジェクト詳細
│   ├── blog/
│   │   ├── page.tsx            # 記事一覧
│   │   └── [slug]/
│   │       └── page.tsx        # 記事詳細
│   ├── about/
│   │   └── page.tsx            # About
│   └── contact/
│       └── page.tsx            # Contact
├── api/
│   └── og/
│       └── route.tsx           # OGP画像生成
├── layout.tsx                  # ルートレイアウト
├── globals.css
├── sitemap.ts
├── robots.ts
└── not-found.tsx
```

---

## middleware.ts 設計

### 処理フロー

```
リクエスト
    ↓
┌─────────────────────────────────────┐
│ 1. 静的ファイルチェック              │
│    → /_next, /images 等はスキップ    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. 既に言語パス付き？                │
│    → /ja/*, /en/* はそのまま通す     │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 3. 言語決定（優先順）                │
│    ① lang Cookie                    │
│    ② Accept-Language ヘッダ          │
│    ③ fallback: en                   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 4. リダイレクト                      │
│    / → /{lang}                      │
│    /projects → /{lang}/projects     │
└─────────────────────────────────────┘
```

### 擬似コード

```typescript
// middleware.ts

import { NextRequest, NextResponse } from 'next/server'

const LOCALES = ['ja', 'en'] as const
const DEFAULT_LOCALE = 'en'

// スキップ対象のパターン（本体側で管理 = 真実）
const SKIP_PATTERNS = [
  /^\/_next/,           // Next.js 内部
  /^\/api/,             // API routes
  /^\/images/,          // 画像
  /^\/fonts/,           // フォント
  /\.\w+$/,             // 拡張子付きファイル（favicon.ico 等）
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. スキップ判定（本体側が真実）
  if (SKIP_PATTERNS.some(pattern => pattern.test(pathname))) {
    return NextResponse.next()
  }

  // 2. 既に言語パス付きならスキップ
  const hasLocalePrefix = LOCALES.some(locale =>
    pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )
  if (hasLocalePrefix) {
    return NextResponse.next()
  }

  // 3. 言語決定
  const locale = getLocale(request)

  // 4. リダイレクト
  // /projects → /{lang}/projects
  // / → /{lang}
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`

  const response = NextResponse.redirect(url)

  // Cookie に言語を保存（1年）
  response.cookies.set('lang', locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })

  return response
}

function getLocale(request: NextRequest): string {
  // 1. Cookie
  const cookieLang = request.cookies.get('lang')?.value
  if (cookieLang && LOCALES.includes(cookieLang as any)) {
    return cookieLang
  }

  // 2. Accept-Language
  const acceptLang = request.headers.get('accept-language')
  if (acceptLang) {
    const preferred = acceptLang.split(',')[0].split('-')[0]
    if (LOCALES.includes(preferred as any)) {
      return preferred
    }
  }

  // 3. Fallback
  return DEFAULT_LOCALE
}

// matcher は広め（本体側のガードが真実）
export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
```

### 設計判断：matcher vs 本体ガード

| 方針 | 説明 |
|------|------|
| **採用**: 本体側でガード | スキップ条件を `SKIP_PATTERNS` に集約。matcher とズレても安全 |
| 不採用: matcher に寄せる | matcher が複雑になり、更新時にミスしやすい |

**理由**: matcher は「広めにマッチ」、本体で「厳密にガード」が事故りにくい

---

## 言語パスなしアクセスの振る舞い

middleware により、言語パスなしの URL は自動的にリダイレクトされる。

### リダイレクト例

| アクセスURL | リダイレクト先 | 備考 |
|-------------|---------------|------|
| `/` | `/ja` or `/en` | 言語判定による |
| `/projects` | `/{lang}/projects` | 言語判定による |
| `/projects/my-app` | `/{lang}/projects/my-app` | 言語判定による |
| `/blog/hello` | `/{lang}/blog/hello` | 言語判定による |
| `/about` | `/{lang}/about` | 言語判定による |

### 言語判定フロー（再掲）

```
1. Cookie (lang) があればその値
2. なければ Accept-Language ヘッダ
3. どちらもなければ fallback: en
```

### 注意：直接 `/{lang}` なしでアクセスされた場合

- SEO観点: 検索エンジンには `/{lang}/...` の URL のみをインデックスさせる
- sitemap.xml には `/{lang}` 付きの URL のみ記載
- canonical URL も `/{lang}` 付きで設定
- これにより、言語パスなし URL がインデックスされることを防ぐ

---

## 動的ルートパラメータ

### [lang] パラメータ

```typescript
// app/[lang]/layout.tsx
// ※ generateStaticParams は layout には置かない（効かない）
// ※ 言語の静的生成は各 page.tsx で担保する

type Props = {
  children: React.ReactNode
  params: { lang: string }
}

export default function LangLayout({ children, params }: Props) {
  const { lang } = params
  // lang: 'ja' | 'en'
  return <>{children}</>
}
```

### 各 page.tsx での言語パラメータ生成

```typescript
// app/[lang]/page.tsx（Home）
// app/[lang]/about/page.tsx 等、slug を持たないページ

export function generateStaticParams() {
  return [{ lang: 'ja' }, { lang: 'en' }]
}
```

### [slug] パラメータ

```typescript
// app/[lang]/projects/[slug]/page.tsx

type Props = {
  params: { lang: string; slug: string }
}

export default async function ProjectPage({ params }: Props) {
  const { lang, slug } = params
  const project = await getProjectBySlug(lang, slug)
  // ...
}

// 静的生成用
export async function generateStaticParams() {
  const projects = await getAllProjects()

  return projects.flatMap(project => [
    { lang: 'ja', slug: project.slug },
    { lang: 'en', slug: project.slug },
  ])
}
```

---

## 言語切替の挙動

### 切替フロー

```
ユーザーが言語切替ボタンをクリック
    ↓
┌─────────────────────────────────────┐
│ 1. Cookie を更新                     │
│    lang: ja → en                    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. 現在のパスを維持してリダイレクト    │
│    /ja/projects → /en/projects      │
│    /ja/blog/xxx → /en/blog/xxx      │
└─────────────────────────────────────┘
```

### 実装イメージ

```typescript
// components/layout/language-switcher.tsx

'use client'

import { usePathname, useRouter } from 'next/navigation'

export function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const switchLanguage = (newLang: string) => {
    // Cookie 更新
    document.cookie = `lang=${newLang}; path=/; max-age=${60 * 60 * 24 * 365}`

    // パス変換: /ja/projects → /en/projects
    // ※ 先頭のみ置換（途中に /ja が含まれるケースを回避）
    const newPath = pathname.replace(
      new RegExp(`^/${currentLang}(?=/|$)`),
      `/${newLang}`
    )
    router.push(newPath)
  }

  return (
    <button onClick={() => switchLanguage(currentLang === 'ja' ? 'en' : 'ja')}>
      {currentLang === 'ja' ? 'EN' : 'JP'}
    </button>
  )
}
```

**正規表現の解説**:
- `^/${currentLang}` - 先頭が `/{lang}` で始まる
- `(?=/|$)` - 直後が `/` または文字列終端（先読み）
- 例: `/ja/projects/japan` → `/en/projects/japan`（途中の `japan` は置換されない）

### 注意点：コンテンツ存在確認

言語切替時、対応するコンテンツが存在しない場合の挙動：

| ケース | 挙動 |
|--------|------|
| 両言語に存在 | そのまま切替 |
| 片方のみ存在 | 一覧ページにフォールバック or 404 |

**推奨**: 一覧ページにフォールバック（UX優先）

---

## SEO考慮事項

### hreflang タグ

```html
<!-- /ja/projects/my-portfolio -->
<link rel="alternate" hreflang="ja" href="https://example.com/ja/projects/my-portfolio" />
<link rel="alternate" hreflang="en" href="https://example.com/en/projects/my-portfolio" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/projects/my-portfolio" />
```

### canonical URL

```html
<!-- 各ページに設定 -->
<link rel="canonical" href="https://example.com/{lang}/{path}" />
```

---

## レビュー結果

| ポイント | 結果 | 対応 |
|---------|------|------|
| layout の generateStaticParams | 🟡 修正済み | layout から削除、各 page.tsx で定義 |
| pathname.replace() の安全性 | 🟡 修正済み | 先頭マッチの正規表現に変更 |
| matcher vs 本体ガードの二重管理 | 🟡 修正済み | 本体側を真実に、matcher は広めに |
| 言語パスなしアクセス | 🟡 追加済み | リダイレクト例とSEO注意点を明記 |

---

**ステータス**: ✅ 承認済み
