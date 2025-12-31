# Step 4: MDXコンテンツ設計

## 概要
MDXファイルによるコンテンツ管理設計（記事・プロジェクト）

---

## ディレクトリ構造

```
content/
├── projects/
│   ├── ja/
│   │   ├── my-portfolio.mdx
│   │   └── ecommerce-app.mdx
│   └── en/
│       ├── my-portfolio.mdx
│       └── ecommerce-app.mdx
└── posts/
    ├── ja/
    │   ├── nextjs-setup.mdx
    │   └── typescript-tips.mdx
    └── en/
        ├── nextjs-setup.mdx
        └── typescript-tips.mdx
```

### 命名規則

| 項目 | ルール | 例 |
|------|--------|-----|
| ファイル名 | kebab-case | `my-portfolio.mdx` |
| ファイル名 = slug | URLパスに使用 | `/ja/projects/my-portfolio` |
| 言語ディレクトリ | ISO 639-1 コード | `ja/`, `en/` |

---

## Frontmatter スキーマ

### 記事（Posts）

```yaml
---
title: "Next.js App Router 入門"
date: "2024-01-15"
updatedAt: "2024-01-20"        # オプション
tags: ["Next.js", "React", "TypeScript"]
summary: "Next.js App Router の基本的な使い方を解説します"
draft: false                    # true で非公開
pinned: false                   # true でピン留め
thumbnail: "/images/posts/nextjs-setup.png"  # カード表示用サムネイル
ogImage: "/images/posts/nextjs-setup-og.png" # 静的OGP画像（オプション、未指定なら動的生成）
---
```

### 画像フィールドの使い分け

| フィールド | 用途 | 必須 | 備考 |
|-----------|------|------|------|
| `thumbnail` | 一覧カードのサムネイル | 推奨 | 未指定時はデフォルト画像 |
| `ogImage` | SNS共有時のOGP画像 | 任意 | 未指定時は動的生成（next/og） |

### Zod スキーマ（実行時バリデーション）

```typescript
// lib/schemas/post.ts

import { z } from 'zod'

// ISO 8601 日付形式のバリデーション
const dateString = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Date must be YYYY-MM-DD format'
)

export const postFrontmatterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: dateString,
  updatedAt: dateString.optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  summary: z.string().min(1, 'Summary is required'),
  draft: z.boolean().default(false),
  pinned: z.boolean().default(false),
  thumbnail: z.string().optional(),
  ogImage: z.string().optional(),
})

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>
```

### TypeScript 型定義

```typescript
// types/content.ts

import type { PostFrontmatter } from '@/lib/schemas/post'

export type Post = {
  slug: string
  locale: Locale
  frontmatter: PostFrontmatter
  content: string           // MDX本文
}
```

### プロジェクト（Projects）

```yaml
---
name: "ポートフォリオサイト"
date: "2024-01-01"
updatedAt: "2024-02-01"        # オプション
summary: "Next.js で構築した個人ポートフォリオサイト"
tech: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"]
role: "設計・開発・運用"
highlights:
  - "App Router を採用した多言語対応"
  - "MDX によるコンテンツ管理"
  - "Lighthouse スコア 100 達成"
links:
  github: "https://github.com/username/portfolio"
  live: "https://example.com"
  article: "/ja/blog/portfolio-development"  # 関連記事（オプション）
draft: false
pinned: true                   # ピン留め
thumbnail: "/images/projects/portfolio.png"      # カード表示用
ogImage: "/images/projects/portfolio-og.png"     # 静的OGP（オプション）
---
```

### Zod スキーマ（実行時バリデーション）

```typescript
// lib/schemas/project.ts

import { z } from 'zod'

const dateString = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Date must be YYYY-MM-DD format'
)

const projectLinksSchema = z.object({
  github: z.string().url().optional(),
  live: z.string().url().optional(),
  article: z.string().optional(),  // 内部リンクも許容
})

export const projectFrontmatterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: dateString,
  updatedAt: dateString.optional(),
  summary: z.string().min(1, 'Summary is required'),
  tech: z.array(z.string()).min(1, 'At least one tech is required'),
  role: z.string().min(1, 'Role is required'),
  highlights: z.array(z.string()).min(1, 'At least one highlight is required'),
  links: projectLinksSchema.default({}),
  draft: z.boolean().default(false),
  pinned: z.boolean().default(false),
  thumbnail: z.string().optional(),
  ogImage: z.string().optional(),
})

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>
```

### TypeScript 型定義

```typescript
// types/content.ts

import type { ProjectFrontmatter } from '@/lib/schemas/project'

export type Project = {
  slug: string
  locale: Locale
  frontmatter: ProjectFrontmatter
  content: string
}
```

---

## MDX処理パイプライン

### 採用ライブラリ

| ライブラリ | 用途 |
|-----------|------|
| `next-mdx-remote` | MDXの動的読み込み・レンダリング |
| `gray-matter` | Frontmatter のパース |
| `zod` | Frontmatter の実行時バリデーション |
| `rehype-highlight` | コードブロックのシンタックスハイライト |
| `rehype-slug` | 見出しに自動でID付与 |
| `remark-gfm` | GitHub Flavored Markdown 対応 |

### 処理フロー

```
MDXファイル読み込み
    ↓
┌─────────────────────────────────────┐
│ 1. gray-matter で Frontmatter 分離  │
│    → metadata + content            │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. Zod でバリデーション（重要）      │
│    → 必須フィールドチェック          │
│    → 型検証（date形式, URL等）       │
│    → デフォルト値適用                │
│    → エラー時はビルド失敗            │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 3. next-mdx-remote でコンパイル      │
│    → remark/rehype プラグイン適用   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 4. カスタムコンポーネント注入        │
│    → CodeBlock, Callout, Image等    │
└─────────────────────────────────────┘
    ↓
レンダリング
```

### バリデーション実装例

```typescript
// lib/posts.ts

import matter from 'gray-matter'
import { postFrontmatterSchema } from './schemas/post'

export async function getPostBySlug(locale: Locale, slug: string) {
  const filePath = path.join(process.cwd(), 'content/posts', locale, `${slug}.mdx`)
  const fileContent = fs.readFileSync(filePath, 'utf-8')

  const { data, content } = matter(fileContent)

  // Zod でバリデーション（失敗時はエラーを投げる）
  const result = postFrontmatterSchema.safeParse(data)

  if (!result.success) {
    throw new Error(
      `Invalid frontmatter in ${filePath}:\n${result.error.format()}`
    )
  }

  return {
    slug,
    locale,
    frontmatter: result.data,  // 型安全なデータ
    content,
  }
}
```

### バリデーションエラー例

```
Error: Invalid frontmatter in content/posts/ja/my-post.mdx:
{
  "date": {
    "_errors": ["Date must be YYYY-MM-DD format"]
  },
  "tags": {
    "_errors": ["Expected array, received string"]
  }
}
```

### MDX処理ユーティリティ

```typescript
// lib/mdx.ts

import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import { mdxComponents } from '@/components/mdx'

export async function compileMdxContent<T>(source: string) {
  const { content, frontmatter } = await compileMDX<T>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, rehypeHighlight],
      },
    },
    components: mdxComponents,
  })

  return { content, frontmatter }
}
```

---

## draft 除外ロジック

### 環境変数による制御

```typescript
// lib/posts.ts

const isDevelopment = process.env.NODE_ENV === 'development'

export async function getAllPosts(locale: Locale): Promise<Post[]> {
  const posts = await readAllPostFiles(locale)

  return posts.filter(post => {
    // 開発環境では draft も表示
    if (isDevelopment) return true
    // 本番では draft: false のみ
    return !post.frontmatter.draft
  })
}
```

### ビルド時の挙動

| 環境 | draft: true | draft: false |
|------|-------------|--------------|
| 開発 (`npm run dev`) | ✅ 表示 | ✅ 表示 |
| 本番 (`npm run build`) | ❌ 除外 | ✅ 表示 |

### UI表示（開発環境）

```typescript
// components/blog/post-card.tsx

export function PostCard({ post }: { post: Post }) {
  return (
    <article>
      {post.frontmatter.draft && (
        <span className="badge badge-warning">Draft</span>
      )}
      <h2>{post.frontmatter.title}</h2>
      {/* ... */}
    </article>
  )
}
```

---

## ピン留め機能

### Frontmatter での指定

```yaml
---
pinned: true
---
```

### ソートロジック

```typescript
// lib/posts.ts

export async function getAllPosts(locale: Locale): Promise<Post[]> {
  const posts = await readAllPostFiles(locale)

  return posts
    .filter(post => !post.frontmatter.draft || isDevelopment)
    .sort((a, b) => {
      // 1. ピン留め優先
      if (a.frontmatter.pinned && !b.frontmatter.pinned) return -1
      if (!a.frontmatter.pinned && b.frontmatter.pinned) return 1

      // 2. 日付降順
      return new Date(b.frontmatter.date).getTime() -
             new Date(a.frontmatter.date).getTime()
    })
}
```

### 表示イメージ

```
┌─────────────────────────────────┐
│ 📌 ピン留め記事 A (2024-01-01)  │  ← pinned: true
│ 📌 ピン留め記事 B (2023-12-01)  │  ← pinned: true
├─────────────────────────────────┤
│ 通常記事 C (2024-01-20)         │  ← 日付降順
│ 通常記事 D (2024-01-15)         │
│ 通常記事 E (2024-01-10)         │
└─────────────────────────────────┘
```

---

## カスタムMDXコンポーネント

### コンポーネント一覧

| コンポーネント | 用途 |
|---------------|------|
| `CodeBlock` | シンタックスハイライト付きコードブロック |
| `Callout` | 注意書き・Tips・警告 |
| `Image` | 最適化画像（next/image ラップ） |
| `LinkCard` | リンクプレビューカード |

### 登録

```typescript
// components/mdx/index.ts

import { CodeBlock } from './code-block'
import { Callout } from './callout'
import { Image } from './image'
import { LinkCard } from './link-card'

export const mdxComponents = {
  // HTML要素のオーバーライド
  pre: CodeBlock,
  img: Image,

  // カスタムコンポーネント
  Callout,
  LinkCard,
}
```

### 使用例（MDX内）

```mdx
# タイトル

<Callout type="info">
  これは補足情報です。
</Callout>

\`\`\`typescript
const hello = "world"
\`\`\`

<LinkCard url="https://example.com" />
```

---

## サンプルMDXファイル

### 記事サンプル

```mdx
---
title: "Next.js App Router 入門"
date: "2024-01-15"
tags: ["Next.js", "React", "TypeScript"]
summary: "Next.js App Router の基本的な使い方を解説します"
draft: false
pinned: false
---

# はじめに

Next.js 13 から導入された App Router について解説します。

<Callout type="info">
  この記事は Next.js 14 を対象としています。
</Callout>

## App Router とは

App Router は React Server Components を基盤とした新しいルーティングシステムです。

\`\`\`typescript
// app/page.tsx
export default function HomePage() {
  return <h1>Hello, World!</h1>
}
\`\`\`

## まとめ

- Server Components がデフォルト
- レイアウトの入れ子構造
- ストリーミング対応
```

### プロジェクトサンプル

```mdx
---
name: "ECサイト構築プロジェクト"
date: "2024-01-01"
summary: "Next.js + Stripe で構築したECサイト"
tech: ["Next.js", "TypeScript", "Stripe", "PostgreSQL"]
role: "バックエンド設計・実装"
highlights:
  - "Stripe Checkout による決済実装"
  - "在庫管理システムの設計"
  - "月間1000件の注文処理"
links:
  github: "https://github.com/username/ec-site"
  live: "https://shop.example.com"
draft: false
pinned: true
---

## 課題・背景

クライアントの既存ECサイトが古く、決済システムの刷新が必要でした。

## 技術選定・設計判断

### なぜ Stripe を選んだか

- PCI DSS 準拠が不要
- 豊富なSDKとドキュメント
- Webhook による非同期処理

## 難所と解決

### 在庫の整合性問題

決済と在庫更新のタイミングで不整合が発生する問題に直面しました。

\`\`\`typescript
// 楽観的ロックによる解決
await prisma.product.update({
  where: { id, version: currentVersion },
  data: { stock: { decrement: 1 }, version: { increment: 1 } },
})
\`\`\`

## 成果・学び

- 決済成功率 99.8% を達成
- 在庫不整合インシデント 0 件
- 分散トランザクションの知見を獲得
```

---

## レビュー結果

| ポイント | 結果 | 対応 |
|---------|------|------|
| Frontmatter バリデーション | 🟡 修正済み | Zod スキーマ追加、ビルド時エラー検出 |
| image フィールド分離 | 🟡 修正済み | `thumbnail` + `ogImage` に分離 |

---

**ステータス**: ✅ 承認済み
